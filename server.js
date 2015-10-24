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


/* run server with some arguments */
// test: $ node process-2.js one two=three four
process.argv.forEach(function (val, index, array) {
  //console.log(index + ': ' + val);
});	
	
	
	

	
	exports.server = function ( req, res ){
		return server;
	};
	// make it a plattform for multiple applications
	var application = 'etutor'; //'terezin'; 'etutor'
	exports.application = function ( req, res ){
			return application;
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
	// Initialize Passport!  Also use passport.session() middleware, to support
	// persistent login sessions (recommended).
	app.use(users.passport.initialize());
	app.use(users.passport.session());
	//app.use(app.router);
	app.set("jsonp callback", true); // ?????


console.log('\n\n************************************************');
console.log('Started server for application '+ application +' on port: '+ port);	
console.log('************************************************\n\n');



/* Init database, load data, and init ACL */
var mongoose = require( 'mongoose' );
var conn = mongoose.connect( 'mongodb://localhost/' + application , function(err, db){
	if(err){
		console.log(err);
	}else{
		/* Import data */
		
		if( application == 'terezin' ){
			persons.csvImport();
			scenes.csvImport();
			videos.csvImport(); // !!! caution
			users.csvImport();
			scripts.importScript();
			groups.csvImport();
			//groups.csvImportFromJSON();
			//require('./routes/etherpad').generatePadGroups(); // !!!
			
			var ffmpeg = require('fluent-ffmpeg');
			var proc = new ffmpeg('/home/abb/Documents/www2/theresienstadt-explained/public/terezin/static/videos/theresienstadt.mp4')
				.takeScreenshots({
						count: 3,
						timemarks: [ '100','300','400' ] // number of seconds
				}, '/home/abb/Documents/www2/theresienstadt-explained/public/terezin/static/img/video-stills/theresienstadt', function(err) {
						console.log('screenshots were saved')
			});
			
			
		}
		
		if( application === 'etutor' ){	
			//videos.csvImport(); // !!! caution
			users.csvImport();
			scripts.importScript();
			groups.csvImport();
			//groups.csvImportFromJSON();
		}
		
		/* Access Control List */
		var ACL = require('./routes/aclrouts')(db, app, io);
	}	
});









/* 
* Setup socket.io 
**/
var 
	io = require('socket.io'/*, { rememberTransport: false }*/).listen(server)
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

	client.on('video.updated', function (data) { 
		console.log('++ video.updated ' + data.videoid);
		client.broadcast.emit('video.refresh.annotations',{ video: data.videoid }); 
	});	
	}
});					

var port = 3033;
server.listen(port);
server.setMaxListeners(0); // xxx: untested: unfinite number of listeners, default: 10;
// http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
	


/*
client.on('user.connected22', function (data) { 
		console.log('++ user.connected ' + data.id );
		client.broadcast.emit( 'user.goes.online', {user: data.id, online:true } );
	});	
	
*/
//var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(server);
//io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
//io.set('heartbeat interval', 1);
//io.set('transports', ['xhr-polling']);
//{ rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] }).listen(server),

exports.socketio = function (event, data){ }
	//var io = require('socket.io')(server);//, {'transports': ['websocket', 'polling']});
	//	io.sockets.setMaxListeners(0); 
	//io.set('heartbeat interval', 1);
	//io.set('transports', ['xhr-polling']);
			/*
		switch(event){
			case "user.connected" : 
				console.log('got conn from ' + data.id);
				client.broadcast.emit( event, {user: data.id, online:true, bla:'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh' } );
				//require('routes/users').setOnlineStatus({params:{ id: data[0].id}, body:{online_status:true, online_location:'index'}}, {});
				break;
			case "user.disconnected" :  console.log('drin2 '+event)
				console.log('got disconn from ');
				client.broadcast.emit( event, {user: data.id, online:false, bla:'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh' } );
				//require('routes/users').setOnlineStatus({params:{ id: data[0].id}, body:{online_status:true, online_location:'index'}}, {});
				break;	
		}
		*/
	
	



				


// 
//var lec = require('./utils/lecturnity');



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





