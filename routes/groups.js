
var 
	mongoose = require( 'mongoose' ),
	server = require('../server'),
	ScriptInstance = mongoose.model( 'ScriptInstance' ),
	Groups = mongoose.model( 'Groups' ),
	Formations = mongoose.model( 'GroupFormations' ),
	Users = mongoose.model( 'Users' ),
	Log = mongoose.model( 'Log' ),
	fs = require('node-fs'),
	csv = require('csv')
	;
	

/***************************************************/
/* GROUP MGMT */

	var groups = [];
	
exports.csvImportFromJSON = function ( req, res ){
	// destroy dataset first
	Groups.remove({}, function ( err, docs ){
		console.log('Removed all groups to replace them by a JSON file.');
		var vi = require('../data/' + server.application() + '/groups.json');

		for(var j = 0; j < vi.length; j++){
			var t = new Groups(vi[j])
				.save( function( err, video, count ){
					if(err){
						console.log(err)
					}else{
						console.log('Imported group '+video.id+' '+video.id);
					}	
				});
		}	
	});
	//	
	
	return;				
};	


/* Load groups data from csv file. Insert data into database **/
exports.csvImport = function ( req, res ){
	// read file
	fs.readFile(__dirname+'/../data/' + server.application() + '/groups.csv', function read(err, data) {
		Groups.remove({}, function(err) { 
			console.log('Removed Groups from DB') 
			csv().from.string(data, {comment: '#'} )
				.to.array( function(data){
				// define group for each line
				for(var i = 1; i < data.length; i++){
					new Groups({
						id: data[i][0],
						description: data[i][1],
						persons: data[i][2],
						hs: data[i][3], 
						videos : data[i][4].split(';') // data[i][3],	"videos" : ["5294bc22985254e831000002", "2", "3"]
					})
					.save( function( err, videos, count ){
						if(err){
							console.log(err)
						}
					});	
				}
				console.log('Imported Groups from data/groups.js to DB');
			});// end read
		});// end csv	
	}); // end remove
};





/**
	* @todo need to distinguish the groups per phase
	* log per current group
	* log per group over all phases, if group constellation does not change
	*/
	exports.getGroupActivityLog = function(req, res) { // users.authCallback(['editor']), xxx
		if (req.user !== undefined ) {
		  // get current script phase
		  ScriptInstance.find().select('current_phase').exec(function(err, script) {
		  	var phase = script[0].current_phase; 
		  	// get group of current user // req.user.username
			  Users.find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, groups ){
			  	var group = groups[0].groups[Number(phase)]; 
			  	var query = {};
					query['groups.'+phase] = group;
					// gext users of group 
					Users.find( query ).select('groups username id firstname name status').exec(function ( err, users ){  	  	
			  		query=[];
			  		for(var i=0; i <users.length; i++){
			  			query.push( users[i].id );
			  		}
			  		Log
		  				.find( { user: { $in: query }, 'action.action': 'added-new-annotation' } )
		  				.select('action utc user')
		  				.sort( 'utc' )
		  				.exec(function (err, logs) {
							if(err){ 
								console.log(err); 
							}else{
								res.type('application/json');
								res.jsonp( logs );
								res.end('done');
							}	
						});
			  	});
		  	});
		  });
		}else {
		  res.type('application/json');
		  res.jsonp({user:false, msg:'you are not logged in'});
		  res.end();
		}
} // end function













/**************************************************************************/
/* GROUP FORMATION */


/*
 * Renders a form to create new group formations
 **/
exports.renderNewFormation = function ( req, res ){
	Users.find().exec( function ( err, users ){
		if(err){ 
			console.log(err);
			res.end('error'); 
		}else{
 			res.render('admin/users-groups-formations-create', { items:users });
 			res.end();
 		}
 	});		
} 

/*
Group formation
status: unfinished
- seperate sub routines
- treat special cases, e.g. when number of people can not be devided by the number of groups
- implement Kohnert
- consider merging or splitting groups
- save groups
**/
exports.createFormation = function ( req, res ){
	// exclude users
	var query = {};
	if( req.body.excluded_users !== undefined ){
		query['id'] = { $nin: req.body.excluded_users }
	}
	
	Users.find( query ).exec( function ( err, users ){
		if(err){ 
			console.log(err);
			res.end('error'); 
		}else{ 
			var groups = [];
			var n = req.body.group_algorithm_val;
			var method = req.body.group_algorithm;
			switch( method ){
				case "method1" :
					/**/// methode 1: divide users in n groups as they are
					var numberOfGroups = n;
					for(var i = 0; i < users.length; i++){
						var num = i % numberOfGroups; 
						if ( num in groups == false){ groups[ num ] = []; }
						groups[ num ].push(users[i]); 
					}
					break;
				case "method2" :	
					/**/// methode 2: divide users in n groups randomly
					var numberOfGroups = n;
					users = shuffle(users);
					for(var i = 0; i < users.length; i++){
						var num = i % numberOfGroups;
						if ( num in groups == false){ groups[ num ] = []; }
						groups[ num ].push(users[i]); 
					}
					break;
				case "method3" :			
					/**/// methode 3: distribute users in groups of n people as they are 
					var groupSize = n;
					for(var i = 0; i < users.length; i++){
						var num = Math.floor(i / groupSize); 
						if ( num in groups == false){ groups[ num ] = []; }
						groups[ num ].push(users[i]); 
					}
					break;
				case "method4" :
					/**/// methode 4: distribute users in groups of n people randomly
					users = shuffle(users);
					var groupSize = n;
					for(var i = 0; i < users.length; i++){
						var num = Math.floor(i / groupSize); 
						if ( num in groups == false){ groups[ num ] = []; }
						groups[ num ].push(users[i]); 
					}
					break;
				case "method5" :
					/**/// methode 5: distribute users in groups of n people by multiple (homogene or heterogene) crtierias
					 // Kohnert2013
			}
		
			// save Groups
			res.type('application/json');
			res.jsonp( groups );
			res.end()
		}
	});
}

// shuffle array using the Fisher-Yates shuffle algorithm
shuffle = function (array) {
	for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
	}
	return array;
}


/**************/
splitGroups = function(){}
joinGroups = function(){}


/*
 * Renders a list of all defined group formations
 **/
exports.renderFormationsIndex = function(req, res){
	Formations.find({}).exec(function (err, formations) {
		if(err){ 
			console.log(err); 
		}else{ console.log(formations)
			res.render( 'admin/users-groups-formations-index', {
				items : formations
			});
			res.end('done');
		}	
	});
}

/*
 * Returns a JSON with all named group formations
 **/
exports.getFormations = function(req, res){
	Formations.find({}).exec(function (err, formations) {
		if(err){ 
			console.log(err); 
		}else{ 
			res.type('application/json');
			res.jsonp(formations);  
			res.end('done');
		}	
	});
}


/*
 * Get group formation by ID
 
 **/
exports.renderFormationByID = function(req, res) { 
	Formations.find({_id: req.params.id}).lean().exec(function (err, formation) {
		if(err){ 
			console.log(err); 
		}else{
			res.render( 'admin/users-groups-formations-edit', {
				items : formation[0]
			});
			res.end('done');
		}	
	});
};


/*
 * Save formation to DB
 **/
exports.saveFormation = function(req, res) {
	new Formations( req.body ).save(function(err, formation){
		if(err){
			console.log(err);
		}else{
			console.log('saved group formation')
			//res.redirect( '/admin/users/groups/formations' );
			res.send({ok:true});
		}
	});
}

/*
* Removes a Formation
**/
exports.destroyFormationByID = function ( req, res ){
  Formations.findByIdAndRemove( req.params.id, function ( err, user ){
  	if(err){
  		console.log(err)
  	}else{
	  	res.redirect( '/admin/users/groups/formations' );
	  	res.end();
	  }	
  });
};



/**************************************************************************/
/* GROUPS */


/*
 * Renders a list of all groups in the admin area
 **/
exports.renderIndex = function(req, res) {
  Groups.find().sort( 'id' ).lean().exec(function (err, items) {
	  if(err){ 
			console.log(err); 
		}else{
			res.render('admin/users-groups', {items: items}); 
			res.end('done');
		}	 
  });
};


/*

**/
exports.getGroups = function(req, res) {
	Groups.collection.find().sort( 'id' ).toArray(function(err, items) {
		if(err){
			console.log(err)
		}else{
      res.type('application/json');
			res.jsonp(items);  
			res.end('done');
		}	
  });
};




/*******************************************/
/* GroupAL */

/*
Pair Performance Index, Manhattan-Metrik
criteria: { name: "xy", type: "homogene", weight:0.4 }
**/
pairPerformanceIndex = function(user1, user2){
	var sum_homo = 0;
	var sum_hetero = 0;
	for(var i = 0; i < user1.criteria.length; i++){
		// different eines Kriterium zw. den usern
	}
	return sum_hetero - sum_homo;
}

/*
Group Performance Index
 = Mittelwert aller npi-Paare innerhalb einer Gruppe
**/
groupPerformanceIndex = function(){
	
}


/*
Kohorten Performanz Index
**/
cohortPerformanceIndex = function(){

}

/*
Matcher, participant by participant

	for all t ∈ N GT do
best esDel t a ← 0
best eGruppeI nd e x ← −1
for all g ∈ G ruppen do
GP I ← ber echneG P I(g)
GP I t mp ← ber echneG P I(g ∪ t)
G P I t mp
δ ← GPI
if best esDel t a < δ then
best esDel t a ← δ
best eG ruppeI nd e x ← G r oups.index(g)
end if
end for
if best eG ruppeI nd e x > −1 then
Gruppen[best eG ruppeI nd e x] ← Gruppen[best eGruppeI ndex] ∪ t
end if
end for

**/
matcher = function(){

}


/*
Optimizer
**/
optimizer = function(){}




