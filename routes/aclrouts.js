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
	

// routes for files
app.get('/myfile', users.ensureAuthenticated, function(req, res){ 
	//console.log('öööööööööööö'+'___public/vi-lab'+req.params.id)
  var file = 'todo.md';//'public/vi-lab'+req.params.id;
  res.download(file); // Set disposition and send it.
});
app.get(	'/test', function ( req, res ){ res.render( 'test', { title : 'Test' }); });






	/************************************************************/
	/* ADMIN  */

	app.get(	'/admin', 	users.authCallback(['editor']),		admin.renderIndex )
	app.get('/admin/dashboard', users.ensureAuthenticated, admin.renderDashboard );
	app.get(	'/home',  users.ensureAuthenticated, function ( req, res ){
		res.render( 'intro' );
	});

	

	/************************************************************/
	/* VIDEO  */


	// http://localhost:3000/popcorn-maker/popcorn-maker/#
	app.get(	'/videos' , 	users.ensureAuthenticated,		videos.list );
	app.get(	'/videos/view/:id' , users.ensureAuthenticated, videos.show );
	app.post(	'/videos/annotate', 	users.ensureAuthenticated, videos.annotate);
	
	app.get( 	'/json/videos' , 	users.ensureAuthenticated,		videos.getJSON );
	app.get( 	'/content' , 	users.ensureAuthenticated,		videos.renderScriptVideo );
	app.get( 	'/json/admin/video-instances', users.authCallback(['editor']), videos.getAllJSON );
	app.get( 	'/json/videos/:id' , 	videos.getOneJSON );
	app.get( 	'/json/film' , 				videos.getJSON );
	
	// instances
	app.get(	'/admin/videos/instances', videos.renderVideoInstances )
	
	// files
	app.get(	'/admin/videos/files', videos.renderVideoFiles )
	app.get(	'/admin/videos/files/create', users.authCallback(['user','editor']), videos.renderFileUpload );
	app.get(	'/admin/videos/files/create-stills/:id', users.authCallback(['user','editor']), videos.generateStillImages );
	app.get(	'/admin/videos/files/edit/:id', users.authCallback(['editor']), videos.renderFileEdit );
	app.post(	'/admin/videos/files/update/:id', users.authCallback(['editor']), videos.updateFile );
	app.get(	'/admin/videos/files/instantiate/:id', users.authCallback(['editor']), videos.createFileInstance );
	app.get(	'/admin/videos/files/destroy/:id', users.authCallback(['editor']), videos.destroyFile );
	app.get( 	'/json/admin/video-files', users.authCallback(['editor']), videos.getAllFilesJSON );
	
	// ??
	app.post(	'/admin/videos/create-file',	 				videos.createFile );
	app.get(	'/admin/videos/destroy/:id',					videos.destroy );
	app.post(	'/admin/videos/update/:id',						videos.update );
	app.get(	'/admin/videos/metadata/edit/:id',		videos.editMetadata ); // ??
	app.get(	'/admin/videos/annotations/edit/:id', videos.editAnnotations );
	
	
	
	
	/************************************************************/
	/* VIDEO UPLOAD */
	
	var 
		multer = require('multer'),
		crypto = require ("crypto"),
		mime = require('mime')
		;
	var file_types = ['mp4','avi','webm','mov','ogv'];	//xxx part of a settings file/page
	var upload_path = './public/etutor/static/videos/';
	
	var storage = multer.diskStorage({
  destination: function (req, file, cb) {
	    cb(null, upload_path)
		},
		filename: function (req, file, cb) {
		  crypto.pseudoRandomBytes(16, function (err, raw) {
		    if (err) return cb(err);
		    var ext = mime.extension( file.mimetype );
		    if( file_types.indexOf( ext ) === -1 ){ return cb('MimeType ' + ext + ' not supported for uploads.'); }
		    cb(null, raw.toString('hex') + Date.now() + '.' + ext );
    	});
    }	
	});
	var upload = multer({ storage: storage });
	// rout
	app.post('/admin/videos/upload', upload.single('uservideo'), function(req,res){
    console.log(req.body); // log other form data
  	console.log( req.file ); // log file data
  	// processing: geneate thumbnails
  	// processing: generate differen formats
  	// respons
    res.json({ file: req.file, fields: req.body }); // return data about the stored file
	});

	

	
	///////xxx todo :: app.get('/related-videos/:id' , users.ensureAuthenticated, wine.getRelatedVideos);



	
	/************************************************************/
	/* SCRIPTS */
	

	// scripts general
	app.get('/admin/scripts', users.ensureAuthenticated, scripts.renderIndex );
	// script templates
	app.get('/admin/scripts/templates', users.ensureAuthenticated, scripts.renderTemplates );
	app.get('/admin/scripts/templates/edit/:id', users.ensureAuthenticated, scripts.renderTemplateByID );
	app.get('/admin/scripts/templates/duplicate/:id', users.ensureAuthenticated, scripts.duplicateTemplateByID );
	app.get('/admin/scripts/templates/instantiate/:id', users.ensureAuthenticated, scripts.instantiateTemplateByID );
	app.get('/admin/scripts/templates/destroy/:id', users.ensureAuthenticated, scripts.destroyTemplateByID );
	app.post('/admin/scripts/templates/update/:id', users.ensureAuthenticated, scripts.updateTemplateByID );
	
	// script instances
	app.get('/admin/scripts/instances', users.ensureAuthenticated, scripts.renderInstances );
	app.get('/admin/scripts/instances/edit/:id', users.ensureAuthenticated, scripts.renderInstanceByID );
	app.post('/admin/scripts/instances/update/:id', users.ensureAuthenticated, scripts.updateInstanceByID );
	app.get('/admin/scripts/instances/activate/:id', users.ensureAuthenticated, scripts.activateInstanceByID );
	app.get('/admin/scripts/instances/destroy/:id', users.ensureAuthenticated, scripts.destroyInstanceByID );
	app.get('/json/admin/scripts/instances', users.ensureAuthenticated, scripts.getInstances );
	
	// ??
	app.post('/templates/add', users.ensureAuthenticated, scripts.addTemplate ); // xxx

	
	// json
	app.get('/json/script', users.ensureAuthenticated, scripts.getScript);
	app.get('/json/admin/script-info', users.ensureAuthenticated, scripts.getScriptInfo ); // xxx
	
	

	
	/************************************************************/
	/* USERS / Groups */
		
	// groups
	app.get('/admin/users', users.authCallback(['editor']),	users.renderIndex );
	app.get('/admin/users/groups', users.authCallback(['editor']),	groups.renderIndex );
	app.get('/groups', groups.getGroups);
	app.get('/json/groups', groups.getGroups);
	app.get('/json/group-activity-log/', groups.getGroupActivityLog );

	// formations
	app.get('/admin/users/groups/formations', users.authCallback(['editor']),	groups.renderFormationsIndex );
	app.get('/admin/users/groups/formations/create', users.authCallback(['editor']),	groups.renderNewFormation );
	app.post('/json/admin/users/groups/formations/create', users.authCallback(['editor']),	groups.createFormation );
	app.get('/admin/users/groups/formations/edit/:id', users.authCallback(['editor']),	groups.renderFormationByID );
	app.post('/admin/users/groups/formations/save', users.authCallback(['editor']),	groups.saveFormation );
	app.get('/admin/users/groups/formations/destroy/:id', users.authCallback(['editor']),	groups.destroyFormationByID );
	app.get('/json/admin/groups/formations', users.authCallback(['editor']),	groups.getFormations );

	// users	
	app.get('/admin/users/new', users.authCallback(['editor']),	users.addUserForm ); // opens input form
	app.post('/admin/users/destroy/:id',	users.authCallback(['editor']),	users.destroy );
	app.get('/admin/users/edit/:id', users.authCallback(['editor']),	users.edit );
	
	
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

	// routes related to User Management and Passport - Local Authentication
	app.get(	'/users/view/:username', users.ensureAuthenticated,	users.show );// showAccountDetails);

	app.get(	'/users/register', 	users.authCallback(['editor']),			users.registrationForm ); // opens input form
	app.post(	'/users/register', 	users.authCallback(['editor']),			users.registerUser ); // saves user
	app.post(	'/users/create', 	users.authCallback(['editor']),				users.create ); // saves user
	app.post(	'/users/update/:id', users.authCallback(['editor']),		users.update );//users.updateUsers);	

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




	
	/************************************************************/
	/* LOGGING */
	
	var 
		Log  = mongoose.model( 'Log' ),
	 	get_ip = require('ipware')().get_ip
	 	;
	var log = fs.createWriteStream('logfile.debug', {'flags': 'a'}); // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
	var log2 = fs.createWriteStream('logfile2.debug', {'flags': 'a'}); // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
	 	
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
		//log2.write( JSON.stringify(req.param('data')) );	
		new Log(entry).save( function( err, logs, count ){
			console.log(logs);
			res.end('done');
		} );
		// write to logfile
		// todo: transform log into flat log file
		
		res.send('terminated logging');
	});
	
	
	// not working with big data !!!
	app.get('/json/log', function(req, res) { // users.authCallback(['editor']), xxx
		
		Log.find({}, {}, function(err, data){
			if(err){
				res.send(err)
			}
			res.json( data ); 
			
		});
		
		return;	
		
		var query = Log.find({}).stream();
		query.on('data', function (doc) {
				console.log(doc)
				//log.write( JSON.stringify( doc ) );
		}).on('error', function (err) {
				console.log(err);
		}).on('close', function () {
				console.log('@Log :: closed stream');
				res.send('streams data');
		});
		return;
		
		Log.find().exec(function (err, logs) {
			if(err){ 
				console.log(err); 
			}else{
				require('jsonfile').writeFile( './log.json', logs, function (err) {
					console.error(err)
				});
				res.end();
				//res.type('application/json');
				//res.jsonp( logs );
				//res.end('done');
			}	
		});
		//res.send('terminated request');
	});	
	




	/************************************************************/
	/* RESULTS */
		
	app.get('/admin/results/peer-assessment', users.authCallback(['editor']) , admin.renderResultsPeerAssessment);
	app.get('/admin/results/comments', users.authCallback(['editor']) , admin.renderResultsComments);



	
	/************************************************************/
	/* ASSESSMENT */
		
	app.get('/stats/assessment', function ( req, res ){ res.render( 'admin-analytics', {}); });
	app.get('/json/stats/assessment', function ( req, res ){ // xxx editor
		Videos
			.find( {"assessment": {$exists: true, $not: {$size: 0}}} )
			.select( 'id metadata assessment video' )
			.sort( 'id' )
			.exec( function ( err, videos ){
				// obtain log
				var query = {};
				query['action.context'] = { $in: ['player','assessment'] }; // 
				Log.find( query ).select('utc user user_name video_id playback_time action').exec(function (err, logs) {
					if(err){ 
						console.log(err); 
					}else{
						res.type('application/json');
						res.jsonp( {
							videos:	videos,
							logs: logs
						});
						res.end('done');
					}	
				});				
			});
	});	

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
	app.get('/pre-test', users.ensureAuthenticated, assess.renderPreTest );
	app.get('/post-test', users.ensureAuthenticated, assess.renderPostTest );
	app.get('/json/assessment-pretest', users.ensureAuthenticated, assess.getPreTest);
	app.get('/json/assessment-posttest', users.ensureAuthenticated, assess.getPostTest);
	app.post('/assessment/pre-post-results', users.ensureAuthenticated , assess.setPrePostResults );
	app.get('/assessment/pre-post-results', users.ensureAuthenticated , assess.getPrePostResults );
	app.get('/admin/assessment/pre-post-results', users.authCallback(['editor']) , assess.getAllPrePostResult );
	
	// routes related to etherpad
	var etherpad = require('./etherpad');
	
	app.get('/collaborative-writing', users.ensureAuthenticated, etherpad.createSession )
	app.get('/collaborative-writing2', users.ensureAuthenticated, etherpad.createSession2 )
	app.get('/json/etherpad', etherpad.getJSON )
	app.get('/admin/etherpad', users.ensureAuthenticated, etherpad.listPadInput )







	/************************************************************/
	/* MISC */

	//	app.get('/messages', users.ensureAuthenticated, wine.getMessages);
	//	app.post('/messages', users.ensureAuthenticated, wine.addMessage);

	// routes for images
	app.get( '/json/images' , images.getJSON );
	//images.folderImport();
	
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


} // end module
