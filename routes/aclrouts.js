/*
author: niels.seidel@nise81.com
module:
description: 

**/

module.exports = function(db, app) {
	var module = {};

	mongoose = require( 'mongoose' ),
	admin = require('./admin'),
	scripts = require('./scripts'),
	videos = require('./videos'),
	images = require('./images'),	
	users = require('./users'),
	groups = require('./groups'),
	// terzin specific
	scenes = require('./scenes'),
	persons = require('./persons')
	// mongoose models
	Videos  = mongoose.model( 'Videos' ),
	Users  = mongoose.model( 'Users' ),
	Scripts  = mongoose.model( 'Scripts' ),
	Groups  = mongoose.model( 'Groups' )
	;
	

//if (req.isAuthenticated()) { return next(); }
//res.redirect('/login')
	
/* define routes **/

// routes for files
app.get('/myfile', users.ensureAuthenticated, function(req, res){ 
	//console.log('öööööööööööö'+'___public/vi-lab'+req.params.id)
  var file = 'todo.md';//'public/vi-lab'+req.params.id;
  res.download(file); // Set disposition and send it.
});


	app.get(	'/home',  users.ensureAuthenticated, function ( req, res ){
		res.render( 'intro' );
	});
	
		app.get(	'/test', function ( req, res ){ res.render( 'test', { title : 'Test' }); });

	// routes related to admin area
	app.get(	'/admin', 	users.authCallback(['editor']),		admin.index )
	app.get(	'/admin/users', users.authCallback(['editor']), admin.getUsers );


	// routes for scenes
	app.get(	'/scenes', 						users.ensureAuthenticated, scenes.list );
	app.get(	'/scenes/new', 				users.ensureAuthenticated, scenes.new_one );
	app.post(	'/scenes/create', 		users.ensureAuthenticated, scenes.create );
	app.get(	'/scenes/destroy/:id',users.ensureAuthenticated, scenes.destroy );
	app.get(	'/scenes/edit/:id', 	users.ensureAuthenticated, scenes.edit );
	app.post(	'/scenes/update/:id', users.ensureAuthenticated, scenes.update );
	app.get(	'/json/scenes', 			users.ensureAuthenticated, scenes.getJSON );


	// routes for persons
	app.get( '/persons', 								users.ensureAuthenticated, persons.list );
	app.get( '/persons/:shortname', 		users.ensureAuthenticated, persons.show );
	app.get( '/persons/new', 						users.ensureAuthenticated, persons.new_one );
	app.post( '/persons/create', 				users.ensureAuthenticated, persons.create );
	app.get( '/persons/destroy/:id',		users.ensureAuthenticated, persons.destroy );
	app.get( '/persons/edit/:id', 			users.ensureAuthenticated, persons.edit );
	app.post( '/persons/update/:id',		users.ensureAuthenticated, persons.update );
	app.get('/json/persons', 						users.ensureAuthenticated, persons.getJSON );
	app.get( '/json/persons/:shortname',users.ensureAuthenticated, persons.getOneJSON );

	
	// routes for videos
	// http://localhost:3000/popcorn-maker/popcorn-maker/#
	app.get(	'/videos' , 	users.ensureAuthenticated,		videos.list );
	app.get(	'/videos/view/:id' , users.ensureAuthenticated, videos.show );
	app.get(	'/admin/videos',  admin.getVideos )
	app.get(	'/admin/videos/new' , 	users.authCallback(['user','editor']), videos.new_one );
	app.get(	'/admin/videos/metadata/edit/:id' , 	videos.editMetadata );
	app.get(	'/admin/videos/annotations/edit/:id' , 	videos.editAnnotations );
	app.get(	'/videos/destroy/:id' ,videos.destroy );
	app.post(	'/videos/update/:id' ,videos.update );
	app.post(	'/videos/create' , 		videos.create );
	app.post(	'/videos/annotate', users.ensureAuthenticated, videos.annotate);
	app.get( 	'/json/videos' , 	users.ensureAuthenticated,		videos.getJSON );
	app.get( 	'/json/admin/videos' , 	users.authCallback(['editor']),		videos.getAllJSON );
	app.get( 	'/json/videos/:id' , 	videos.getOneJSON );
	app.get( 	'/json/film' , 				videos.getJSON );


	// routes for images
	app.get( '/json/images' , images.getJSON );
	//images.folderImport();
	
	
	
	///////xxx todo :: app.get('/related-videos/:id' , users.ensureAuthenticated, wine.getRelatedVideos);

	// routes related to scripts	
	app.get('/json/script', users.ensureAuthenticated, scripts.getScript);


	// routes for user management
	app.get('/groups', groups.getGroups);
	app.get('/json/groups', groups.getGroups);
	app.get('/json/group-formation', groups.formGroups);
	
	//	app.get('/messages', users.ensureAuthenticated, wine.getMessages);
	//	app.post('/messages', users.ensureAuthenticated, wine.addMessage);
	
	/*
	Logging
	**/	
	var 
		Log  = mongoose.model( 'Log' ),
	 	get_ip = require('ipware')().get_ip
	 	;
	
	app.post('/log', users.ensureAuthenticated, function(req, res) {
		var 
			d = req.param('data')
			;
			
		var entry = {
			utc: 							d.utc, 
			//phase: 						Number,
			//date:  						String, 
			//time:  						String, 
			//group:  					d.group, 
			user:  						d.user, 
			user_name:  			req.user.username,
			//user_gender:			String,
			//user_culture:			String,
			//user_session:			Number,
			video_id:  				d.video_id,
			//video_file:  			String,
			//video_length:  		String,
			//video_language:  	String,
			action:  					{
				context: d.action.context,
				action: d.action.action,
				values: d.action.values
			},	
			//action_details: 	[Schema.Types.Mixed],
			playback_time:		d.playback_time === undefined ? '-99' : d.playback_time,
			user_agent:  			d.user_agent,
			ip: 							get_ip(req).clientIp
			//flag: 						Boolean
		}
		// todo: complete missing fields
		// save it
		new Log(entry).save( function( err, logs, count ){
			console.log(logs);
			res.end('done');
		} );
	
		// write to logfile
		// todo: transform log into flat log file
		//log.write( req.param('data') );	
		res.send('terminated logging');
	});
	
	
	app.get('/json/log',  users.authCallback(['editor']), function(req, res) { // users.authCallback(['editor']), xxx
		Log.find().select('action utc user').sort( 'utc' ).exec(function (err, logs) {
			if(err){ 
				console.log(err); 
			}else{
				res.type('application/json');
				res.jsonp( logs );
				res.end('done');
			}	
		});
		//res.send('terminated request');
	});	
	
	
	/**
		* @todo need to distinguish the groups per phase
		* log per current group
		* log per group over all phases, if group constellation does not change
		*/
	app.get('/json/group-activity-log', users.ensureAuthenticated, function(req, res) { // users.authCallback(['editor']), xxx
		if (req.user !== undefined ) {
		  // get current script phase
		  Scripts.find().select('current_phase').exec(function(err, script) {
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
			  		// get final log 
		  			Log.find( { user: { $in: query } } ).select('action utc user').sort( 'utc' ).exec(function (err, logs) {
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
	});
	
	
	/**
		* @todo need to distinguish the groups per phase
		* log per current group
		* log per group over all phases, if group constellation does not change
		*/
	app.get('/json/user-activity-log', users.ensureAuthenticated, function(req, res) { // users.authCallback(['editor']), xxx
		if (req.user !== undefined ) {
		  // filt log for entries of the given user	
			Log.find( { user: req.user.id } ).select('action utc user').sort( 'utc' ).exec(function (err, logs) {
				if(err){ 
					console.log(err); 
				}else{
					res.type('application/json');
					res.jsonp( logs );
					res.end('done');
				}	
			});

		}else {
		  res.type('application/json');
		  res.jsonp({user:false, msg:'you are not logged in'});
		  res.end();
		}
	});
	
	var log = fs.createWriteStream('logfile.debug', {'flags': 'a'}); // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
	

	// routes related to User Management and Passport - Local Authentication
	app.get(	'/users/view/:username', users.ensureAuthenticated,	users.show );// showAccountDetails);
	app.get(	'/admin/users/new', users.authCallback(['editor']),						users.addUserForm ); // opens input form
	app.get(	'/users/register', 	users.authCallback(['editor']),			users.registrationForm ); // opens input form
	app.post(	'/users/register', 	users.authCallback(['editor']),			users.registerUser ); // saves user
	app.post(	'/users/create', 	users.authCallback(['editor']),				users.create ); // saves user
	app.post(	'/users/update/:id', users.authCallback(['editor']),		users.update );//users.updateUsers);	
	app.post(	'/admin/users/destroy/:id',	users.authCallback(['editor']),	users.destroy );
	app.get(	'/admin/users/edit/:username', users.authCallback(['editor']),	users.edit );
//	app.post(	'/users/online/:username', 	users.setOnlineStatus );
	app.get(	'/users/online/:username', 	users.getOnlineStatus );
	// api
	app.get('/json/users', users.ensureAuthenticated, users.getJSON);
	app.get('/json/user-data', users.getUserData );
	app.get('/json/group-data', users.getGroupData );

	// login
	app.get('/logout', users.ensureAuthenticated, users.handleLogout );
	app.get('/login',  users.openLoginPage ); //curl -v -d "username=bob&password=secret" http://localhost:3000/login
	app.post('/login', users.authenticate );

	
	// routes related to E-Assessment
	var assess = require('./assessment');
	app.get('/json/assessment', users.ensureAuthenticated, assess.getTest);
	app.get('/assessment', users.ensureAuthenticated,assess.index);
	app.get('/assessment/results', users.ensureAuthenticated, assess.getResults );
	app.post('/assessment/results', users.ensureAuthenticated , assess.setResults );
	app.get('/assessment/fill-in/:field', users.ensureAuthenticated, assess.getFillins );
	app.post('/assessment/fill-in/:field', users.ensureAuthenticated, assess.setFillins );
	app.get('/assessment/written/:field', users.ensureAuthenticated, assess.getWrittenAssessment );
	app.post('/assessment/written/:field', users.ensureAuthenticated, assess.setWrittenAssessment );
	
	// post test
	app.get('/prepost', users.ensureAuthenticated, assess.prePostTest );
	app.get('/json/assessment-prepost', users.ensureAuthenticated, assess.getPrePostTest);
	app.post('/assessment/pre-post-results', users.ensureAuthenticated , assess.setPrePostResults );
	app.get('/assessment/pre-post-results', users.ensureAuthenticated , assess.getPrePostResults );
	// routes related to etherpad
	var etherpad = require('./etherpad');
	
	app.get('/collaborative-writing', users.ensureAuthenticated, etherpad.createSession )
	app.get('/collaborative-writing2', users.ensureAuthenticated, etherpad.createSession2 )
	app.get('/json/etherpad', etherpad.getJSON )
	app.get('/admin/etherpad', users.ensureAuthenticated, etherpad.listPadInput )



} // end module
