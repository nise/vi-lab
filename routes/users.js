

var 
	mongoose = require( 'mongoose' ),
	server =  require('../server'),
	Users  = mongoose.model( 'Users'),
	ScriptInstance = mongoose.model('ScriptInstance'),
	Groups = mongoose.model('Groups'),
	fs = require('node-fs'),
	csv = require('csv')
//	,identicon = require('identicon/identicon.js')
	;

/*********************************/
/* USER MGMT */
	var users = [];
 
/*
Import User data from csv
**/
exports.csvImport = function ( req, res ){
	// load data
	fs.readFile(__dirname+'/../data/' + server.application() + '/users.csv', function read(err, data) {
		if(err){
			console.log(err);
		}
		// get Video dataset in order to extract toc data
		/*
		var toc = [];
		Videos  = mongoose.model( 'Videos' );
		Videos.findOne({_id: '52a13d2e2aa9d35f24000078'}, function(err, video) { 
			for(var i=0; i < video.toc.length; i++){
				toc[video.toc[i].number] = video.toc[i].start;
			}
			*/
			// destroy dataset first
			Users.remove({}, function(err) { console.log('Removed Users from DB') });
			csv().from.string(data, {comment: '#'} )
				.to.array( function(data){
					// define scene for each line
					for(var i = 1; i < data.length; i++){
						new Users({
							id: i,
							firstname: data[i][0],
							name : data[i][1],
							password: data[i][2],
							hs: data[i][3],
							email: data[i][12],
							role: data[i][13],
							username: data[i][14] === '' ? (data[i][0]).replace(/\ /g,'.').toLowerCase() + '.' + (data[i][1]).toLowerCase() : data[i][14],//data[i][13], 
							icon : 'img/usericons/user-'+i+'.png', 
							trace : 1,
							status: { online:false, location:'default' },
							experimental: '',
							attribute: Number( data[i][5] ),
							groups : [],//[data[i][6], data[i][7], data[i][8],data[i][9], data[i][10], data[i][11]],	
							updated_at : Date.now()
						}).save( function( err, todo, count ){
							//res.redirect( '/users' );
						});
						generateIdenticon((data[i][1]).toLowerCase(), i);
					}
				});// end array()
			//});// end video call	
			console.log('Imported Users from data/users.csv to DB');
	});// end fs				
};



/* Generate user Icons for each user **/
var generateIdenticon = function(name, id){
	 // can't be installed on ubuntu 10.04 server
	/*
	identicon.generate(name, 10, function(err, buffer) {
		 if(err){ console.log('## ERROR while generating identicon')}
			fs.writeFileSync(__dirname+'/../public/' + server.application() + '/static/img/user-icons/user-'+id+'.png', buffer);
	});
	
	identicon.generate(name, 40, function(err, buffer) {
		 if(err){ console.log('## ERROR while generating identicon')}
			fs.writeFileSync(__dirname+'/../public/' + server.application() + '/static/img/user-icons/user-'+id+'_big.png', buffer);
	});*/
};




/* Check wether a user is logged in or not. If logged in give out the username. If not redirect to the login page. **/
exports.getUserData = function(req, res, next) {  

  if (req.user !== undefined) {
  	res.type('application/json');
		res.jsonp({user:true, username: req.user.username, role: req.user.role, id: req.user.id /*, videoid: item[0].videos */ });
		res.end();
				/*			
    res.type('application/json');
    	var t = -1;
    	ScriptInstance.find().exec(function(err, script) {
    		if(err){ 
		  		console.log(err); 
		  	}else if( script[0] !== undefined ){
					var phase = script[0].current_phase;
					Groups.find({id: req.user.groups[phase]}).lean().exec(function(err, item) {
						if(err){
							console.log(err);
						}else if(item.length === 0){
							//console.log('ERROR: empty user @ getUserData');
							res.redirect('/login')
						}else{	
					
							res.type('application/json');
							res.jsonp({user:true, username: req.user.username, role: req.user.role, id: req.user.id, videoid: item[0].videos});
							res.end();
						}
					});
				}else{
					res.end();
				}	
			});	
    */
  }else {
    res.type('application/json');
    res.jsonp({user:false, msg:'you are not logged in'});
    res.end();
  }
};  

/*
Returns a jsonp object that contains all users that are in the same group as the current user
**/
exports.getGroupData = function(req, res, next) {  
  if (req.user !== undefined) {
    // get current script phase
    ScriptInstance.find().exec(function(err, script) {
    	if(err){ 
    		console.log(err); 
    	}else if( script[0] !== undefined ){
		  	var phase = script[0].current_phase; 
		  	// get group of current user
			  Users.find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, groups ){
			  	var group = groups[0].groups[Number(phase)]; 
			  	var query = {};
					query['groups.'+phase] = group;
			  	// get users of group 
					Users.find( query ).select('groups username id firstname name status').exec(function ( err, users ){  	  	
			  		//for(var i = 0; i < users.length; i++){ console.log(users[i]); }
			  		res.type('application/json');
		  			res.jsonp({user:true, username: req.user.username, id: req.user.id, group: users } );
		  			res.end();
			  	});
		  	});
		  }else{
		  	res.end();
		  }	
    });
  }else {
    res.type('application/json');
    res.jsonp({user:false, msg:'you are not logged in'});
    res.end();
  }
}; 

//
exports.showAccountDetails = function(req, res){
  res.render('user-account', { user: req.user });
};





/******************************************************/
/* PASSPORT */
/*****************************************************/


var 
	passport = require('passport'), 
	flash = require('connect-flash'),
	LocalStrategy = require('passport-local').Strategy
	;
	
exports.passport = passport;


/*
 * Renders the loigin page
 **/
exports.openLoginPage = function(req, res){ 
  res.render('user-login', 
  	{ 
  		user: req.user, 
  		username: false, 
  		password: false, 
  		message: req.flash('error') 
  	});
};


/*
 * Handles logout and changes the online status of the user
 **/
exports.handleLogout = function(req, res){
	req.session.regenerate(function(){
    setOnlineStatus( req.user._id, { online: false, location:'video' } );
    console.log('User logged out: '+req.user._id);
    req.logout();
    res.redirect('/login');   
  })
}; 


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) { 
  Users.findById(id, function (err, user) {
  	if(err){
  		console.log(err)
  	}else{
    	done(err, user);
    }
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
// xxxx this function needs to be improved!
passport.use(new LocalStrategy( 
  function(username, password, done) {   
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) { 
      	//console.log(require('../server').getServer())
        if (err) { return done(err); }
        
        if(user[0] !== undefined){
		      if (user[0].password !== password) { 
		      	return done(null, false, { message: 'Invalid password' }); 
		      }else{
		      	//require('../server').socketio('user.connected', user);
		      	return done(null, user[0]);
			    } 
		    }else if(user.password !== undefined){ 
		    	if (user.password !== password) { 
		      	return done(null, false, { message: 'Invalid password' }); 
		      }else{
		      	
		      	return done(null, user);
			    }
		    }else{ 
		    	 return done(null, false, { message: 'Unknown user ' + username }); 
		    }
        
		   });
    });
  }
));



/*
 * Handles redirects after try to login
 **/
exports.authenticate = function(req, res, next){ 
  passport.authenticate( 'local', function(err, user, info){ 
    var redirectUrl = '/home';
    if (err) { return next(err); }
    if (!user) { console.log(user); return res.redirect('/login'); }
    
    if (req.session.redirectUrl) {
      redirectUrl = req.session.redirectUrl;
      req.session.redirectUrl = null;
    }
    req.logIn(user, function(err){
      if (err) { return next(err); }
    });
    res.redirect(redirectUrl);
  })(req, res, next);
  
};


/*
 * Function that authenticates guest users when calling /login-guest
 * In case there is no user called 'guest' in the datebase this functions will not work.
 **/
exports.authenticateGuest = function(req, res){
	Users.findOne({ username : 'guest' }, function(err, user){
		req.login(user, function (err) {
			if( ! err ){
				try{
				 res.redirect('/videos/view/57317b7243717cbb3c9df9ed');
				}catch(e){
					console.log(e);
				} 
				//res.redirect('/home');
			}else {
				res.redirect('/login');
			}
		});
	});	
} 

/*passport.authenticate(
		'local', 
		{ 
			//successRedirect: '/home', 
			successRedirect : 'back',
			failureRedirect: '/login', 
			failureFlash: true 
		});*/


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function(req, res, next) {  
  if (req.isAuthenticated()) {
  	setOnlineStatus( req.user._id, { online: true, location:'video' }); 
  	return next(); 
  }else{
  	//console.log('Error: User tried to access contents that requires an authentication')
  	req.session.redirectUrl = req.url;
  	res.redirect('/login');
  }
}


/*
 * Middleware to check for multiple roles for its permission to access the requested route
 **/
exports.authCallback = function(roles) { 
	return function (req, res, next) {
		if (req.isAuthenticated()) {
			//Check if the logged in user is an admin
			Users.findOne( { username : req.user.username },function ( err, user, count ){
				  if(!err && roles.indexOf(user.role) >= 0){
				  	setOnlineStatus( req.user._id, { online: true, location:'video' }); 
				  	next();
				  }else{
				  	res.send(403); 
				  	//res.redirect('/videos')
				  }
			});
		}else{
			req.session.redirectUrl = req.url;
  		res.redirect('/login');
		}
	}	
}


/*
 * Helper for passport authentification
 **/
function findByUsername(username, fn) {
  Users.find({ username: username }).setOptions({lean:true}).exec(function ( err, user ){
//  .findOne({username: username}, function ( err, user ){
  	if(err){
  		return fn(err, null);
  	}else{ 
      return fn(null, user);
    }
  });
  
}


/*
 * Helper for passport authentification
 **/
function findById(id, fn) {
  Users.findOne({id: id}, function ( err, user ){ 
    if(err){
    	fn(new Error('User ' + id + ' does not exist'));
    }else{
    	fn(null, user);
 		}
  });
}


/*
 **/
exports.updateUsers = function(req, res) {
  var id = req.params.id;
  var user = req.body;
  Users.update({'_id':new BSON.ObjectID(id)}, {$set:{trace:user.data}}, {safe:true}, function(err, result) {
	  if (err) {
	      console.log('Error updating user: ' + err);
	      res.send({'error':'An error has occurred'});
	  } else {
	      console.log('' + result + ' document(s) updated');
	      res.send(user);
	  }
  });
}  






/********************************************************/
/* USERS */
/********************************************************/


/*
 * Renders a list of all registered users in the admin area
 **/
exports.renderIndex = function(req, res) {
  Users.find().sort( 'username' ).lean().exec(function (err, items) {
	  if(err){ 
			console.log(err); 
		}else{
			res.render('admin/users-index', {items: items}); 
			res.end('done');
		}	 
  });
};


//
exports.create = function ( req, res ){
  new Users( req.body ).save( function( err, todo, count ){
    res.redirect( '/admin/users' );
  });
};


/*
 * Renders date about a single user
 **/
exports.renderByUsername = function ( req, res ){ 
  Users.findOne({username: String(req.params.username)}, function ( err, persons ){
  	if(err){
  		console.log(err)
  	}else{ 
		  res.render( 'users-single', {
		      title   : 'Express Users Example',
		      item   : persons,
		      current : req.params.username
		  });
		} 
  });
};


/*
 * Renders form to create a new user
 **/
exports.renderCreate = function ( req, res ){ 
	res.render( 'admin/users-new', {});
};


/*
 * Remove the user with the given ID from database
 **/
exports.destroy = function ( req, res ){
  Users.findByIdAndRemove( req.params.id, function ( err, user ){
  	if(err){
  		console.log(err)
  	}else{
	  	res.redirect( '/admin/users' );
	  	res.end();
	  }	
  });
};


/*
 * Render the form to edit user data
 **/
exports.renderEdit = function ( req, res ){
  Users.findOne({ '_id': req.params.id}, function ( err, item ){
    res.render( 'admin/users-edit', {
        items   : item,
        current : req.params.username
    });
    
  });
};


/*
 * Updates user data send from form
 **/
exports.update = function ( req, res ){
  Users.findOneAndUpdate( {'_id': req.params.id }, req.body, { upsert:true }, function ( err, doc ){
 		res.redirect( '/admin/users' );
 		res.end()
  });
};


/*
 * Returns JSON object containing data of all users. Password and email fields will be hidden.
 **/
exports.getJSON = function(req, res) {
  Users.find().sort( 'username' ).lean().exec(function (err, items) {
	  if(err){ 
			console.log(err); 
		}else{
			if(req.user.role === 'student'){
				for (var i = 0; i < items.length; i++){
					items[i].email = '<hidden>';
					items[i].password = '<hidden>';
				}
			}	  
			res.type('application/json');
			res.jsonp(items); 
			res.end();
		}	 
  });
};



// register new user ... done by anonymous user
exports.registrationForm = function ( req, res ){ 
	res.render( 'user-register', {
	  title : 'Express Users Example',
	  errors : false,
	  email: false,
	  username: false,
	  password: false,
	});
};

//
exports.registerUser = function ( req, res ){
	req.checkBody('email', 'Bitte geben Sie eine gültige E-Mail-Adresse an.').isEmail();
	req.checkBody('username', 'Bitte geben Sie einen Benutzernamen ein.').notEmpty();
	req.checkBody('username', 'Bitte geben Sie einen Benutzernamen an, der zwischen 3 und 15 Zeichen lang ist.').len(3, 15);
	req.checkBody('password', 'Das Passwort sollte 6 bis 20 Zeichen umfassen.').len(6, 20);
	
	var errors = req.validationErrors();
  if (errors) {
    res.render('user-register', { 
    	errors: errors,
    	email: req.body.email,
    	username: req.body.username,
    	password: req.body.password
    });

    //res.send('There have been validation errors: ', 400);
    return;
  }
	
	var uname = 'uname-'+Math.random()*1000;
	// check existenz of user name

	//
  new Users({
    id: Math.random()*10000,
		username: req.body.username,//uname,//req.body.username,
		password: req.body.password,
		email: req.body.email,
		name: '<blanc>',
		firstname: '<blanc>',
		hs: '',
		role: 'user',
		status: 'pending',
	  icon: '',
  	trace: true,
  	experimental: false,
  	groups: ['x','x','x'],//[Schema.Types.Mixed],
    updated_at : Date.now()
  }).save( function( err, todo, count ){
  	if(err){
  		console.log('ERROR: could not register user')
  	}else{
  		console.log('Saved user')
  		res.render('user-login', { user: req.user, username: req.body.username, password: req.body.password, message: 'Ihre Registrierung war erfolgreich. Sie können sich jetzt einloggen.' });
    	//res.redirect('/login');
    }
    //res.redirect( '/users/edit/'+uname );
  });
};


/*
 * Get user online status
 **/
exports.getOnlineStatus = function ( req, res ){
	Users.find({ username: req.params.username }).exec( function ( err, user ){
		if(err){ 
			console.log(err);
			res.end('error'); 
		}else{
			res.type('application/json');
			res.jsonp( user );
			res.end();
		}
	});
}


/*
 * Set user online status
 * @todo take care of 'location'
 **/
function setOnlineStatus( user_id, stat ){ 
  Users.findById( user_id ).select('id status').exec( function ( err, user ){
		if(err){
			console.log(err);
		}
		if( user ){
		  user.status.online = stat.online;
		  user.status.location = stat.location;
		  user.status.updated_at = Date.now();
		  user.save( function ( err, user, count ){
		   	// emit
		 		
					if( stat.online === true){
						console.log('# Online: ' + user_id)
						require('../server').serverEmitter().emit('user.connected', { id: user.id });
					}else{
						console.log('# Offline: ' + user_id)
						require('../server').serverEmitter().emit('user.disconnected', { id: user.id });
					}	
				
		  });
    }else{
    	console.log( 'ERROR @ user.setOnlineStatus');
    	//console.log( user );
    }
  });
}




