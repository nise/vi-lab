/*
 * @author: niels.seidel@nise81.com
 * @titel: Vi-Lab
 * @description: Video learning environment with support for real-time annotations and collaborative work structured by scripts.
 **/

require( './db' );

var 
	l = require('winston'),
	express = require('express'),
	expressValidator = require('express-validator'),
	app = express(),
	compression = require('compression'),
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
mongoose.Promise = require('bluebird');

	/* 
	 * catch arguments 
	 * test: $ node process-2.js one two=three four
	 **/ 
	process.argv.forEach(function (val, index, array) {
		if( array.length > 2 ){
			application = array[3];
		}
		//l.log('info', index + ': ' + val);
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
 	app.use(compression())
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
		l.log('info', err);
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
		}
		
		if( application === 'etutor' ){	
			//videos.csvImport(); // !!! caution
			//users.csvImport(); // !! caution
			scripts.startScriptSession();
			//groups.csvImport();
			//groups.csvImportFromJSON();
			//var lec = require('./utils/lecturnity');	
			
			
		}
		
		/* Access Control List */
		var ACL = require('./routes/aclrouts')(db, app, io);
		
		//
		/*
		var e =	require('exec');
		exec('sh ./utils/ocr.sh',
				function (error, stdout, stderr) {
					l.log('info', 'stdout: ' + stdout);
					l.log('info', 'stderr: ' + stderr);
					if (error !== null) {
						l.log('info', 'exec error: ' + error);
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
		l.log('info',  data ); 	
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
    l.log('info', '++ user.connected ' + data.id );
    client.broadcast.emit( 'user.goes.online', {user: data.id, online:true } );
  });
	
	serverEmitter.on('user.disconnected', function (data) { 
		l.log('info', '++ user.disconnected ' + data.id );
		client.broadcast.emit( 'user.goes.offline', {user: data.id, online:false } );
	});
	
	serverEmitter.on('video.updated', function (data) {
    l.log('info', '++ video.updated ' + data.videoid);
    client.broadcast.emit('video.refresh.annotations',{ video: data.videoid });
  });
	
	// not working ?
	client.on('video.updated', function (data) { l.log('info', data)
		l.log('info', '+++++ video.updated ' + data.videoid +'__received by the client');
		client.broadcast.emit('video.refresh.annotations',{ video: data.videoid }); 
	});	
	}
});		



var port = 3033;
server.listen(port);
server.setMaxListeners(0); // xxx: untested: unfinite number of listeners, default: 10;
// http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
	
l.log('info', '\n\n***********************************************************');
l.log('info', 'Started server for application __'+ application +'__ on port: '+ port);	
l.log('info', '***********************************************************\n\n');
	
	

	



				





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
      l.log('info', err);
      return;
    }
    dirs.forEach(function(dir){
      if (dir.indexOf(".") !== 0) {
        var packageJsonFile = "./node_modules/" + dir + "/package.json";
        if (fs.existsSync(packageJsonFile)) {
          fs.readFile(packageJsonFile, function (err, data) {
            if (err) {
              l.log('info', err);
            }
            else {
              var json = JSON.parse(data);
              l.log('info', '"'+json.name+'": "' + json.version + '",');
            }
          });
        }
      }
    });

  });
}
//main();





