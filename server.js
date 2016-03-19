/*
author: niels.seidel@nise81.com
titel: Vi-Lal
description: Video learning environment with support for real-time annotations and collaborative work structured by scripts.
**/

require( './db' );

var 
	express = require('express'),
	expressValidator = require('express-validator'),
	app = express(),
	path = require('path'),
	flash = require('connect-flash'),
	server = require('http').createServer(app),
	fs = require('node-fs'),
	application = 'etutor', // default 
	mongoose = require( 'mongoose' ),

	// database entities
	videos = require('./routes/videos'),
	users = require('./routes/users'),
	images = require('./routes/images'),
	scripts = require('./routes/scripts'),	
	groups = require('./routes/groups'),
	// terzin specific entities
	scenes = require('./routes/scenes'),
	persons = require('./routes/persons')
	;


	/* 
		* catch arguments 
		* test: $ node process-2.js one two=three four
		**/ 
	process.argv.forEach(function (val, index, array) {
		if( array.length > 2 ){
			application = array[3];
		}
		//console.log(index + ': ' + val);
	});


	/* 
		*	make it a plattform for multiple applications
		**/
	exports.application = function ( req, res ){
			return application;
	};

	/*
		*
		**/
	exports.server = function ( req, res ){
		return server;
	};
	

/* configure application **/
 	app.set('port', process.env.PORT || port);
 	app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
  app.use(express.static(path.join(__dirname, 'public/'+ application)));
 	app.set('views', __dirname + '/public/' + application + '/static/views');
	app.set('view engine', 'ejs');
	app.engine('ejs', require('ejs-locals'));
		
	var cookieParser = require('cookie-parser');
	app.use(cookieParser());
	//	app.use(express.cookieSession({ secret: 'tobo!', maxAge: 360*5 }));
		
	var json = require('express-json');
	app.use( json());
	
	var bodyParser = require('body-parser');
	app.use(expressValidator());	
	app.use( bodyParser.urlencoded({ extended: true }));
	app.use( bodyParser.json());
		
	var methodOverride = require('method-override');
	app.use( methodOverride());
		
	var session = require('express-session');
	app.use(session({
	  secret: 'keyb22oar4d cat', 
	  saveUninitialized: true,
	  resave: true
   }));
	
	app.use(flash());
	app.use(users.passport.initialize());
	app.use(users.passport.session());
	//app.use(app.router); // ?
	app.set("jsonp callback", true); // ?????



/* 
	* Init database, load data, and init ACL 
	**/
var conn = mongoose.connect( 'mongodb://localhost/' + application , function(err, db){
	if(err){
		console.log(err);
	}else{
		/* Import data */
		
		if( application === 'terezin' ){
			persons.csvImport();
			scenes.csvImport();
			videos.csvImport(); // !!! caution
			users.csvImport();
			scripts.importScript();
			groups.csvImport();
			//groups.csvImportFromJSON();
			//require('./routes/etherpad').generatePadGroups(); // !!!
			
			/*var ffmpeg = require('fluent-ffmpeg');
			var proc = new ffmpeg('/home/abb/Documents/www2/theresienstadt-explained/public/terezin/static/videos/theresienstadt.mp4')
				.takeScreenshots({
						count: 3,
						timemarks: [ '100','300','400' ] // number of seconds
				}, '/home/abb/Documents/www2/theresienstadt-explained/public/terezin/static/img/video-stills/theresienstadt', function(err) {
						console.log('screenshots were saved')
			});
			*/
		}
		
		if( application === 'etutor' ){	
			//videos.csvImport(); // !!! caution
			//users.csvImport();
			
			//groups.csvImport();
			
			//groups.csvImportFromJSON();
			// 
			//var lec = require('./utils/lecturnity');

		}
		
		/* Access Control List */
		var ACL = require('./routes/aclrouts')(db, app, io);
		
		//
		/*
		var e =	require('exec');
		exec('sh ./utils/ocr.sh',
				function (error, stdout, stderr) {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (error !== null) {
						console.log('exec error: ' + error);
					}
		});
		*/			
	}	
});



/*
* Vi-Analytics

var va = require('../vi-analytics/index.js');


va.init( { 
		app: app, 
		path:'/analytics/perception-per-video'
	}, null, function(data){
		console.log( data ); 	
	});

	**/








/* 
* Setup socket.io 
**/
var 
	io = require('socket.io')(server) /*, { rememberTransport: false }*/
	events = require('events'),
	serverEmitter = new events.EventEmitter(),
	ioConnected = false
	;

exports.serverEmitter = function(req, res){
	return serverEmitter;
}
io.sockets.on('connection', function (client) { 
	if( ! ioConnected ){
	ioConnected=true;
	serverEmitter.on('user.connected', function (data) {
    console.log('++ user.connected ' + data.id );
    client.broadcast.emit( 'user.goes.online', {user: data.id, online:true } );
  });
	
	serverEmitter.on('user.disconnected', function (data) { 
		console.log('++ user.disconnected ' + data.id );
		client.broadcast.emit( 'user.goes.offline', {user: data.id, online:false } );
	});
	
	serverEmitter.on('video.updated', function (data) {
    console.log('++ video.updated ' + data.videoid);
    client.broadcast.emit('video.refresh.annotations',{ video: data.videoid });
  });
	
	// not working ?
	client.on('video.updated', function (data) { console.log(data)
		console.log('+++++ video.updated ' + data.videoid +'__received by the client');
		client.broadcast.emit('video.refresh.annotations',{ video: data.videoid }); 
	});	
	}
});		



var port = 3033;
server.listen(port);
server.setMaxListeners(0); // xxx: untested: unfinite number of listeners, default: 10;
// http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
	
console.log('\n\n************************************************');
console.log('Started server for application '+ application +' on port: '+ port);	
console.log('************************************************\n\n');
	
	

	



				





/***************************************************/
/* maintainance */


/*
Lists als packages that are inside the node_packages folder. 
To remove unused packages: rm -rf node_modules && npm install
**/
var fs = require("fs");

function main() {
  fs.readdir("./node_modules", function (err, dirs) {
    if (err) {
      console.log(err);
      return;
    }
    dirs.forEach(function(dir){
      if (dir.indexOf(".") !== 0) {
        var packageJsonFile = "./node_modules/" + dir + "/package.json";
        if (fs.existsSync(packageJsonFile)) {
          fs.readFile(packageJsonFile, function (err, data) {
            if (err) {
              console.log(err);
            }
            else {
              var json = JSON.parse(data);
              console.log('"'+json.name+'": "' + json.version + '",');
            }
          });
        }
      }
    });

  });
}
//main();





