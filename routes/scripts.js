
/*
 * @todo:

- phasenübergänge:
-- schedule .. exact date/time, rythm, e.g. 2 day
-- condition .. #contributions, #taks-solutions, #word-count, ...

*/

var 
	mongoose = require( 'mongoose' ),
	server =  require('../server'),
	videos =  require('./videos'),
	Scripts  = mongoose.model( 'Scripts' ),
	Templates = mongoose.model('ScriptTemplate'),
	Instances = mongoose.model('ScriptInstance'),
	Groups = mongoose.model('Groups'),
	Users = mongoose.model('Users'),
	fs = require('node-fs'),
	csv = require('csv')
	;


/*
 * Simply renders a template that introduced the scripts
 * status: finished
 **/
exports.renderIndex = function(req, res) { 
	res.render( 'admin/scripts', { });
	res.end('done');
};


/*******************************************************/
/* SCRIPT TEMPLATES */


/*
 * List all script templates
 * status: finished
 **/
exports.renderTemplates = function(req, res) { 
	Templates.find({}).exec(function (err, templates) {
		if(err){ 
			console.log(err); 
		}else{ 
			res.render( 'admin/scripts-template-index', {
				items : templates
			});
			res.end('done');
		}	
	});
};
    
  
/*
 * Get script template by ID
 * status: finished
 **/
exports.renderTemplateByID = function(req, res) { 
	Templates.find({_id: req.params.id}).lean().exec(function (err, template) {
		if(err){ 
			console.log(err); 
		}else{
			res.render( 'admin/scripts-template-edit', {
				items : template[0]
			});
			res.end('done');
		}	
	});
};


/*
 * Loads an empty template from file and saves it to the data base.
 * status: 
 **/
exports.renderNewTemplate = function(req, res) { 
	var 
		tmp = require('./script-template.json'),
		t = new Date()
		;
		tmp.created_at = t.getTime();
  new Templates( tmp )
		.save( function( err, template, count ){
			console.log( 'Created empty template '+template.title )
			res.render('admin/scripts-template-edit', { items: template });//'/admin/scripts/templates/edit/'+template._id );
			res.end();
		});
}

	
/*
 * Duplicates a script template
 * status: finished
 **/
exports.duplicateTemplateByID = function(req, res) {
	Templates.find({_id: req.params.id}).lean().exec(function (err, template) {
		if(err){ 
			console.log(err); 
		}else{
			var template2 = template;
			template2[0].title = template2[0].title + '-' + Math.floor(Math.random()*100);
			delete template2[0]["_id"];
			new Templates( template2[0] )
				.save( function( err, newtemplate, count ){
					if(err){ console.log(err); }
					console.log( 'Duplicated Script Template ' + newtemplate.title )
					res.redirect( '/admin/scripts/templates' );
				});
			
		}	
	});
}	


/*
 * Update Template
 * status: finished
 **/
exports.updateTemplateByID = function(req, res) { console.log(req.body.phases[0].video_files);
	Templates.findOneAndUpdate(req.params.id, req.body, function ( err, template ){
		res.end()
	});
}


/*
* Removes a Template
* status: finished
**/
exports.destroyTemplateByID = function(req, res) {
	Templates.findById( req.params.id, function ( err, template ){
	  template.remove( function ( err, template ){
	    res.redirect( '/admin/scripts/templates' );
	    res.end('done');
	 	});
	});
}


/*
 * Instatiates a script template for associating groups, times, etc.
 **/	
exports.instantiateTemplateByID = function(req, res) {
	Templates.findById( req.params.id, function ( err, template ){
		var 
			t = new Date(),
			script = {
				title : template.title+'_instance',
				template : template._id,
				phases: [],
				created_at 	: t.getTime(),
				status : 'drafted',
				current_phase : 0,
			};
	  // prepare phases
	  for(var i = 0; i < template.phases.length; i++){
  		script.phases[i] = template.phases[i];
  		script.phases[i].start = t.getTime();
			script.phases[i].seq = i;
  		script.phases[i].groupindex = undefined;
  		script.phases[i].groupformation = undefined;
	  }

	  console.log(script);
	  new Instances( script ).save(function(err, instance){
	  	if(err){ 
	  		console.log(err)
	  	}else{
				console.log('-----------------')
				console.log(instance)
			  res.redirect( '/admin/scripts/instances' );
			  res.end('done');
	    }
	  });  
	 	
	});
}




/*************************************************/
/* SCRIPT INSTANCES */

/*
 * List all script instances
 * status: finished
 **/
exports.renderInstances = function(req, res) { 
	Instances.find({}).exec(function (err, instances) {
		if(err){ 
			console.log(err); 
		}else{  console.log(instances)
			res.render( 'admin/scripts-instances-index', {
				items : instances
			});
			res.end('done');
		}	
	});
};


/*
 * Get JSON of all script instances
 * status: finished
 **/
exports.getInstances = function(req, res) {
	Instances.collection.find().toArray(function(err, items) {
    	res.type('application/json');
		 	res.jsonp(items); 
		});
};

/*
 * Get JSON of on script instances
 * status: finished
 **/
exports.getInstanceByID = function(req, res) {
	Instances.find({_id: req.params.id}).lean().exec(function(err, items) {
    	res.type('application/json');
		 	res.jsonp(items); 
		});
};


/*
 * Renders an instance of a script for editing
 * status: finished
 **/
exports.renderInstanceByID = function(req, res) { 
	Instances.find({_id: req.params.id}).lean().exec(function (err, instance) {
		if(err){ 
			console.log(err); 
		}else{
			res.render( 'admin/scripts-instances-edit', {
				items : instance[0]
			});
			res.end('done');
		}	
	});
};


/*
 *
 **/
exports.activateInstanceByID = function(req, res){
	Instances.update({ '_id':req.params.id}, { status: 'running' }, function ( err, instance ){
		if(err){
			console.log(err)
		}else{
			console.log('set Instance active'); //console.log(instance);
			res.redirect('/admin/scripts/instances');
			res.end();
		}
	});	
}


/*
* 
* see also https://github.com/ncb000gt/node-cron
**/
exports.startScriptSession = function(){
	
	// start cron jobs for each job
	var now = new Date();
	var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

	var t = new Date();
	var inte = [1, 2, 3, 4]
	var tt = 0;

	for(var i=0; i < inte.length; i++){ 
		t.setSeconds(t.getSeconds() + inte[i]);
	
		var CronJob = require('cron').CronJob;
		var job = new CronJob( t, 
			function() { 
				tt++;
				console.log('start cron '+tt);
				//job.stop();
			}, 
			function () {
				console.log('fin cron');
			},
			true//, // Start the job right now /
		//  timeZone // Time zone of this job. /
		);
	}

}


/*
 * Saves an script instance to the database. Furthermore it prepares the script for being interpretet in the run-time environment
 * status
 **/
exports.updateInstanceByID = function(req, res){
	Groups.remove({}, function ( err, ggg ){});
	// save instance
	delete req.body["_id"];
	Instances.findOneAndUpdate(req.params.id, req.body, function ( err, instance ){
		if(err){
			console.log(err)
		}
		
		// get group formation
		var allFormations = [];
		for(var i = 0; i < instance.phases.length; i++){
			allFormations.push( instance.phases[i].groupformation );
		}
		
		// define groups considering the video files and group formations
		// build inverted index
		
		var Formations = mongoose.model( 'GroupFormations' );		
		Formations.find( {'_id': { $in: allFormations }}, function ( err, docs ){
			if(err){ console.log(err); 
			}else{
				var 
					user_index = {},
					video_id = 1,
					getFormation = function(p){
						for(var d=0; d < docs.length;d++){ 
							if(String(docs[d]._id) === String(allFormations[p])){ 
								return docs[d].formation;
							}
						}
					}
					;	
				Videos.remove({}, function ( err, ggg ){		
				// iterate phases
				for(var p=0; p < instance.phases.length; p++){
					var f = getFormation(p);
					//Groups.remove({}, function ( err, ggg ){
					
						// iterate groups 
						var group_id = 1;
						for(var i=0; i < f.length; i++){
							// generate video instances
							var 
								files = instance.phases[p].video_files,
								video_ids = []
								;
							for(var l = 0; l < files.length; l++){
								video_ids[l] = video_id;
								video_id++;
							}	//console.log(video_ids)
							videos.createMultipleFileInstance(files, video_ids);
							// new group
							var group = {
								id: String.fromCharCode(96 + group_id)+''+p,
								description: 'phase_'+p+'__group_'+i,
								phase: p,
								persons: f[i].length, // number of persons
								videos : video_ids
							};
						
							// save group
							new Groups( group ).save();
							// create index of users in a group
							for(var j=0; j < f[i].length; j++){
								if( f[i][j].id in user_index === false){
									user_index[f[i][j].id] = []; // i=group; j=user
								}
								user_index[f[i][j].id].push( String.fromCharCode(96 + group_id)+''+p )  
							}
							group_id++;
						}//end for groups
				
				}// end for phases
		
				// update users with the new group-indexs
				// console.log(user_index);
				var 
					configs = {},
					async = require('async')
					;
				async.forEachOf(user_index, function (value, key, callback) {
						Users.update({id: key}, {groups: value} ,function (err, user) {
							if(err){ 
								console.log('@user_update'); console.log(err); 
							}else{
								console.log('updated group for user')
								//configs[key] = user; // collect results
							}
						});	
					}, function (err) {
							if (err){ console.log('@user_update2'); console.error(err.message); }
							//console.log(configs); // so something with the results
							console.log('updated instance')
							res.redirect( '/admin/scripts/instances' );
							res.end()
				});// end async	
			});// end videos remove	
			}	
		}); // end formations find
	});	// end instance update
}


/*
* Removes a script instance
* status: finished
**/
exports.destroyInstanceByID = function(req, res) {
	Instances.findById( req.params.id, function ( err, instance ){
	  instance.remove( function ( err, instance ){
	    res.redirect( '/admin/scripts/instances' );
	    res.end('done');
	 	});
	});
}



/*************************************************/
/* SCRIPT MODELING*/


/*
 * @todo deprecated function xxx
 **/
exports.getScriptInfo = function ( req, res ){ // xxx editor
	Scripts.find({}).exec( function ( err, scripts ){
		Groups.find({}).exec( function( err, groups){
			Videos.find({}).select('id metadata video').exec( function( err, videos ){
				if(err){ 
					console.log(err); 
				}else{
					res.type('application/json');
					res.jsonp( {
						scripts : scripts,
						groups : groups,
						videos:	videos
					});
					res.end('done');
				}	
			}); // end video
		});// end group
	});//end script	
}































