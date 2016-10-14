
/*
 * @todo:

- phasenübergänge:
-- schedule .. exact date/time, rythm, e.g. 2 day
-- condition .. #contributions, #taks-solutions, #word-count, ...

*/

var 
	l = require('winston'),
	mongoose = require( 'mongoose' ),
	server =  require('../server'),
	videos =  require('./videos'),
	Templates = mongoose.model('ScriptTemplate'),
	Instances = mongoose.model('ScriptInstance'),
	Groups = mongoose.model('Groups'),
	Formations = mongoose.model( 'GroupFormations' ),	
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
			l.log('info', err); 
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
			l.log('info', err); 
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
			l.log('info',  'Created empty template '+template.title )
			res.render('admin/scripts-template-edit', { items: template });//'/admin/scripts/templates/edit/'+template._id );
			res.end();
		});
}

/*
 * Get JSON of all script templates
 * status: finished
 **/
exports.getTemplates = function(req, res) {
	Templates.find().exec(function(err, items) {
    	res.type('application/json');
		 	res.jsonp(items); 
		});
};

	
/*
 * Duplicates a script template
 * status: finished
 **/
exports.duplicateTemplateByID = function(req, res) {
	Templates.find({_id: req.params.id}).lean().exec(function (err, template) {
		if(err){ 
			l.log('info', err); 
		}else{
			var template2 = template;
			template2[0].title = template2[0].title + '-' + Math.floor(Math.random()*100);
			delete template2[0]["_id"];
			new Templates( template2[0] )
				.save( function( err, newtemplate, count ){
					if(err){ l.log('info', err); }
					l.log('info',  'Duplicated Script Template ' + newtemplate.title )
					res.redirect( '/admin/scripts/templates' );
				});
			
		}	
	});
}	


/*
 * Update Template
 * status: finished
 **/
exports.updateTemplateByID = function(req, res) { 
	Templates.findOne( {"_id": req.params.id}, function ( err, template ){
		if(err){
			l.log('info', err);
		}else{

			var template = MergeRecursive(template,req.body);
			template.markModified('phases');
			var now = new Date();
			template.updated_at = now;
			template.save();
			res.end()
		}
	});
}


function MergeRecursive(obj1, obj2) {

				for (var p in obj2) {
					try {
						// Property in destination object set; update its value.
						if ( obj2[p].constructor==Object ) {
						  obj1[p] = MergeRecursive(obj1[p], obj2[p]);

						} else {
						  obj1[p] = obj2[p];

						}

					} catch(e) {
						// Property in destination object not set; create it and set its value.
						obj1[p] = obj2[p];

					}
				}
				return obj1;
			}// end fn MergeRecursive




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
  		script.phases[i].widgets = template.phases[i].widgets;
	  }

	  new Instances( script ).save(function(err, instance){
	  	if(err){ 
	  		l.log('info', err)
	  	}else{
				l.log('info', '-----------------')
				l.log('info', instance.phases[0].widgets[0])
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
			l.log('info', err); 
		}else{  
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
	Instances.find().exec(function(err, items) {
    	res.type('application/json');
		 	res.jsonp(items); 
		});
};

/*
 * Get JSON of a given script instance
 * status: finished
 **/
exports.getInstanceByID = function(req, res) {
	Instances.find({_id: req.params.id}).exec(function(err, items) {
  	res.type('application/json');
	 	res.jsonp(items); 
	});
};

/*
 * Get JSON of the running script instance
 * status: finished
 **/
exports.getRunningInstance = function(req, res) {
	Instances
	 .findOne( { status: 'running' } )
	 .lean()
	 //.populate('widgets')
	 .exec(function(err, items) {
    	res.type('application/json');
    	res.jsonp(items);
		});
};


/*
 * Renders an instance of a script for editing
 * status: finished
 **/
exports.renderInstanceByID = function(req, res) { 
	Instances.findOne({'_id': req.params.id}).lean().exec(function (err, instance) {
		if(err){ 
			l.log('info', err); 
		}else{
			res.render( 'admin/scripts-instances-edit', {
				items : instance
			});
			res.end('done');
		}	
	});
};


/*
 * Activates a give script instance by setting its status.
 **/
exports.activateInstanceByID = function(req, res){
	Instances.update({ '_id':req.params.id}, { status: 'running', current_phase: 0 }, function ( err, instance ){
		if(err){
			l.log('info', err)
		}else{
			l.log('info', 'set Instance active'); 
			startScriptSession();
			res.redirect('/admin/scripts/instances');
			res.end();
		}
	});	
}


/*
 * 
 * see also https://github.com/ncb000gt/node-cron
 * @todo failure when scheduling multiple dates
**/
var 
		//CronJob = require('cron').CronJob, // not used
		schedule = require('node-schedule'),
		moment = require('moment')
		;

exports.startScriptSession = startScriptSession;

function startScriptSession(){ 
	Instances.findOneAndUpdate( {'status': 'running' }, { $set: {current_phase: 0 }}, function ( err, ins ){
		if(err){ 
			l.log('info', err); 
		}else{
			
		}
	});

	/*

	//var date = new Date(2016, 2, 20, 12, 28, 0);
	
	Instances.find({ status:'running' }, function(err, instance){ 
		instance = instance[0];
		for(var phase = 0; phase < instance.phases.length; phase++){
			l.log('info', 'Set schedule for '+phase);
			if( instance.phases[phase] !== undefined){
				// change to now if ..
				var 
					a = moment(instance.phases[phase].start),
					b = moment(),
					the_phase = 0
					;
					l.log('info', a.diff(b, 'seconds'))
				if( a.diff(b, 'seconds') < 0 ){
					l.log('info', '+++++++++++++++CURRENT++++'+phase+'+++++++++++');
					the_phase = phase;
				}
				//l.log('info', 'start: '+instance.phases[phase].start+ '__' + moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))
				var m = moment(instance.phases[phase].start);
				var date = new Date(m.format('YYYY'), m.format('MM')-1, m.format('DD'), m.format('h'), m.format('mm'), 0);
				l.log('info', date)
				// start schedule
				var j = schedule.scheduleJob( date , function(){
					l.log('info', 'Phase '+phase+' started. ');
					// update current phase
					Instances.findOneAndUpdate( {'_id': instance._id }, { $set: {current_phase: phase }}, function ( err, ins ){
						if(err){ 
							l.log('info', err); 
						}else{
							
						}
					});// end instance
					
				});	// end schedule
				
			}else{
				l.log('info', 'ERRRRRO')
				//l.log('info',  instance.phases )
			}	
		}
	});
	*/
	/*var job = new CronJob( 
				new Date( ins.phases[i].start ), 
				function() { 
					l.log('info', 'start cron of phase '+i);
					//job.stop();
				}, 
				function () {
					l.log('info', 'fin cron');
				},
				true//, // Start the job right now /
			//  timeZone // Time zone of this job. /
			);
	
	// start cron jobs for each job
	var now = new Date();
	var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

	var t = new Date();
	var inte = [1, 2, 3, 4]
	var tt = 0;

	for(var i=0; i < inte.length; i++){ 
		t.setSeconds(t.getSeconds() + inte[i]);
	
		
		var job = new CronJob( t, 
			function() { 
				tt++;
				l.log('info', 'start cron '+tt);
				//job.stop();
			}, 
			function () {
				l.log('info', 'fin cron');
			},
			true//, // Start the job right now /
		//  timeZone // Time zone of this job. /
		);
	}
*/
}





/*
 * Saves an script instance to the database. Furthermore it prepares the script for being interpretet in the run-time environment
 * status
 **/
exports.updateInstanceByID = function(req, res){ 
	//l.log('info', '+++++++++++++++++++++++++++++++++++++++++++++')
	// save instance
	delete req.body.instance["_id"];
	Instances.findOneAndUpdate( {'_id': req.params.id }, req.body.instance, function ( err, instance ){
		if(err){
			//l.log('info', err)
		}else{	    
		    instance.phases[0] = req.body.instance.phases[0];
					if( req.body.overwrite === 'false' ){	
						//l.log('info', 'Updated instance without changing groups and video instances');
						//res.redirect( '/admin/scripts/instances' );
						res.end(); 
					}else{
						// overwrite groups and generate new video instances
						Groups.remove({}, function ( err, ggg ){});
						// get group formation
						
						var allFormations = [];
						for(var i = 0; i < instance.phases.length; i++){
							allFormations.push( instance.phases[i].groupformation );
						}
		
						// define groups considering the video files and group formations
						// build inverted index
						Formations.find( {'_id': { $in: allFormations }}, function ( err, docs ){
							if(err){ 
								//l.log('info', err); 
							}else{
								var 
									user_index = {},
									video_id = 1,
									getFormation = function(p){
										for(var d=0; d < docs.length;d++){ 
											if(String(docs[d]._id) === String(allFormations[p])){ //l.log('info', docs[d].formation)
												return docs[d].formation;
											}
										}
										return false;
									}
									;	
								Videos.remove({}, function ( err, ggg ){		
								// iterate phases
								for(var p=0; p < instance.phases.length; p++){
									var f = getFormation(p);
									//Groups.remove({}, function ( err, ggg ){
									if(f !== false || f === undefined){
										// iterate groups 
										var group_id = 1;
										for(var i=0; i < f.length; i++){
											// generate video instances
											var 
												files = instance.phases[p].video_files,
												video_ids = []
												;
											for(var lll = 0; lll < files.length; l++){
												video_ids[lll] = video_id;
												video_id++;
											}	
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
									}
								}// end for phases
								// update users with the new group-indexs
								var 
									configs = {},
									async = require('async')
									;
								async.forEachOf(
									user_index, 
									function (value, key, callback) {
										Users.update({id: key}, {groups: value} ,function (err, user) {
											console.log('try update user');
											if(err){ 
												console.log( err); 
											}else{
												console.log('try update user group '+value)
												console.log('updated group for user')
												//configs[key] = user; // collect results
											}
										});	
									}, 
									function (err, e) {
											if (err){ 
												//l.log('info',  'ERRRO '); l.log('info', err); 
											}
											//l.log('info', configs); // so something with the results
											//l.log('info',  'End');
											//l.log('info', 'Updated instance and created new groups and video instances')
											res.end();
									}
								);// end async	
							});// end videos remove	
							res.end();
							}	
						}); // end formations find
					} // end if overwrite
			//}); // end save instance	
		}// end err			
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
	Instances.find({}).exec( function ( err, scripts ){
		Groups.find({}).exec( function( err, groups){
			Videos.find({}).select('id metadata video').exec( function( err, videos ){
				if(err){ 
					l.log('info', err); 
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































