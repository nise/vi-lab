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
	app.get(	'/admin', 			admin.index )
	app.get(	'/admin/users', admin.getUsers );


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
	app.get( 	'/json/videos' , 			videos.getJSON );
	app.get( 	'/json/videos/:id' , 	videos.getOneJSON );
	app.get( 	'/json/film' , 				videos.getJSON );


	// routes for images
	app.get( '/json/images' , images.getJSON );
	images.folderImport();
	
	
	
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
			group:  					d.group, 
			user:  						d.user, 
			//user_name:  			String,
			//user_gender:			String,
			//user_culture:			String,
			//user_session:			Number,
			video_id:  				d.video_id,
			//video_file:  			String,
			//video_length:  		String,
			//video_language:  	String,
			action:  					d.user_agent,
			//action_details: 	[Schema.Types.Mixed],
			playback_time:		d.playback_time,
			user_agent:  			d.user_agent,
			ip: 							get_ip(req)
			//flag: 						Boolean
		});
		// todo: complete missing fields
		// save it
		Log.save( entry )
		
		// write to logfile
		// todo: transform log into flat log file
		//log.write( req.param('data') );	
		res.send('terminated logging');
	});
	app.get('/log', users.ensureAuthenticated, function(req, res) { // users.authCallback(['editor']), xxx
		
		res.send('terminated request');
	});	
	
	var log = fs.createWriteStream('logfile.debug', {'flags': 'a'}); // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
	

	// routes related to User Management and Passport - Local Authentication
	app.get(	'/users/view/:username', 	users.show );// showAccountDetails);
	app.get(	'/admin/users/new', 						users.addUserForm ); // opens input form
	app.get(	'/users/register', 				users.registrationForm ); // opens input form
	app.post(	'/users/register', 				users.registerUser ); // saves user
	app.post(	'/users/create', 					users.create ); // saves user
	app.post(	'/users/update/:id', users.authCallback(['editor']),		users.update );//users.updateUsers);	
	app.post(	'/admin/users/destroy/:id',		users.destroy );
	app.get(	'/admin/users/edit/:username', 	users.edit );
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
	app.get('/json/assessment', assess.getTest);
	app.get('/assessment', assess.index);
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
