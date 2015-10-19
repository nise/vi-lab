/*
Etherpad

* name: etherpad.js
* description:
* corresponding template: group-etherpad.ejs

**/


var
	api = require('etherpad-lite-client'),
	async = require('async'), 
	mongoose = require( 'mongoose' ),
	Scripts = mongoose.model('Scripts'),
	Users = mongoose.model('Users'),
	Groups = mongoose.model('Groups'),
	the_group = []
	;	

/*
connect to etherpad
**/
etherpad = api.connect({
  apikey: '0843838b4335003cd9f6e9c64594434b5887bb6d192eccb8894034f463fb0494',
  host: '127.0.0.1',
  port: 9001,
});


/*
create etherpad groups
**/
exports.generatePadGroups = function (prefix){
	Groups.find().exec(function(err, items) {
		if(err){
			console.log(err)
		}else{ 
			console.log(items)
			for(i in items){
				(function(item) {
					if( Number(item.id) >= 500 ){   
						etherpad.createGroup(function(err, data) { 
							if( err || data.code === 0){ 
								console.log('Error creating group: ' + err.message);
							}else{
								console.log(item.id+'__created group '+data.groupID); 
						
								// create pad per group
								//var groupPadID = data.groupID;//+'$pad-'+Math.random()*1000;
								var args = {
									groupID: data.groupID,
									padName: 'phase5pad-'+item.id,
									text: 'Herzlich willkommen',
								}
								etherpad.createGroupPad(args, function(err, groupPad){
								
									if(err){
											//etherpad.deletePad(groupPadID, function(res){
											console.log('Error '+err.message);
										//});
									}else{
										Groups.findById( item._id, function ( err, updatedGroup ){
											if(err){
												console.log(err);
											}else{
												updatedGroup.ep_group_pad_id = groupPad.padID;
												updatedGroup.ep_group_id = data.groupID;
												updatedGroup.save(function ( err, todo, count ){
													console.log('SAVED:: For group '+item.id+' '+data.groupID+'EP group+pad created: ' + groupPad.padID);	
												});//end save
											}
										});//end Groups.findByID	
									}// end if
								}); // end createGroupPad
							}//end else
						});//end createGroup	
					}
				})(items[i]);			
			}// end for	
		}// end else	
  });// end Groups
}


/* 
create session between user and his group pad
*/
exports.createSession = function(req, res){ 
	//console.log(req.protocol + '://' + req.get('host') + req.originalUrl)
	if (req.user !== undefined) {
    // get current script phase
    Scripts.collection.find().toArray(function(err, script) {
    	var phase = script[0].current_phase; 
    	// get group of current user
  	  Users.find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, user ){
  	  	var currentGroup = user[0].groups[Number(phase)];
  	  	//console.log(currentGroup);
  	  	var validUntil = 60*60*6; // 6hours
  	  	Groups.find({ id: currentGroup }).select('ep_group_id ep_group_pad_id').setOptions({lean:true}).exec(function ( err, group ){	
			  	if(err){
			  		console.log(err);
			  	}
			  	the_group = group[0]; 
			  	//(function(group){
						etherpad.createAuthor( req.user.username, function(err, author){
							if(err || the_group.ep_group_id === undefined){
								console.log(err);
								res.render('group-etherpad2', {
									error: true,
									solution: false
								});
								res.end('done'); 
							}else{
								var args = {
									groupID: the_group.ep_group_id, 
									authorID: author.authorID, 
									validUntil: Date.now()+4*60*60*1000
								}; 
								console.log(args)
								etherpad.createSession(args, function(err, data){ 
									if(err){ 
										console.log(err); 
									}else{
										etherpad.getSessionInfo({sessionID: data.sessionID}, function(err, d){ 
											console.log(err, d);
										});
										etherpad.getText({ padID: the_group.ep_group_pad_id}, function(err, text){
											if(err){
												console.log(err);
											}else{
												var solution = text.text.length > 200 ? true : false;
												console.log(text, text.text.length, solution);
												req.session.etherpad_session_id = data.sessionID
												res.cookie("sessionID", data.sessionID, {
													maxAge: 24 * 60 * 60
													//domain: config.etherpad.cookie_domain
												});
												res.render('group-etherpad', {
													error: false,
													host: req.protocol + '://' + String(req.get('host')).replace(':3001',''),// xxx bad hack until I find out how to retrieve the current port 
													groupID: the_group.ep_group_id,
													padID: the_group.ep_group_pad_id,
													session: data.sessionID,
													author: req.user.username,
													padURL: '',
													solution: solution
												});
												res.end('done');
											}	
										});
										
									}
								});//end create session
							}
						});// end create author
					//})(group)	
				});//end groups	
  	  });// end Users
  	});//end Scripts	  
	}// end if
}






// 22222222
/* 
create session between user and his group pad
*/
exports.createSession2 = function(req, res){ 
	//console.log(req.protocol + '://' + req.get('host') + req.originalUrl)
	if (req.user !== undefined) {
    // get current script phase
    Scripts.collection.find().toArray(function(err, script) {
    	var phase = 4;//script[0].current_phase; 
    	// get group of current user
  	  Users.find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, user ){
  	  	var currentGroup = user[0].groups[Number(phase)];
  	  	//console.log(currentGroup);
  	  	var validUntil = 60*60*6; // 6hours
  	  	Groups.find({ id: currentGroup }).select('ep_group_id ep_group_pad_id').setOptions({lean:true}).exec(function ( err, group ){	
			  	if(err){
			  		console.log(err);
			  	}
			  	the_group = group[0]; 
			  	//(function(group){
						etherpad.createAuthor( req.user.username, function(err, author){
							if(err || the_group.ep_group_id === undefined){
								console.log(err);
								res.render('group-etherpad2', {
									error: true,
									solution: false
								});
								res.end('done'); 
							}else{
								var args = {
									groupID: the_group.ep_group_id, 
									authorID: author.authorID, 
									validUntil: Date.now()+4*60*60*1000
								}; 
								console.log(args)
								etherpad.createSession(args, function(err, data){ 
									if(err){ 
										console.log(err); 
									}else{
										etherpad.getSessionInfo({sessionID: data.sessionID}, function(err, d){ 
											console.log(err, d);
										});
										etherpad.getText({ padID: the_group.ep_group_pad_id}, function(err, text){
											if(err){
												console.log(err);
											}else{
												var solution = text.text.length > 200 ? true : false;
												console.log(text, text.text.length, solution);
												req.session.etherpad_session_id = data.sessionID
												res.cookie("sessionID", data.sessionID, {
													maxAge: 24 * 60 * 60
													//domain: config.etherpad.cookie_domain
												});
												res.render('group-etherpad2', {
													error: false,
													host: req.protocol + '://' + String(req.get('host')).replace(':3001',''),// xxx bad hack until I find out how to retrieve the current port 
													groupID: the_group.ep_group_id,
													padID: the_group.ep_group_pad_id,
													session: data.sessionID,
													author: req.user.username,
													padURL: '',
													solution: solution
												});
												res.end('done');
											}	
										});
										
									}
								});//end create session
							}
						});// end create author
					//})(group)	
				});//end groups	
  	  });// end Users
  	});//end Scripts	  
	}// end if
}


/*
Admin: list content of all Pads
template: admin-etherpad.ejs
**/
exports.listPadInput = function(req, res){
	res.render('admin-etherpad', {
												
	});
	res.end('done');
}


/*
API: /json/etherpad
**/
exports.getJSON = function(req, res){
	var text = [];
	//
	Groups.find().select('ep_group_id ep_group_pad_id id').exec(function ( err, groups ){
		async.each(
			groups, 
			function( group, callback ){
				if( group.ep_group_pad_id ){
					etherpad.getHTML({ padID: group.ep_group_pad_id }, function(err, data){
						if(err){ 
							console.log(err.message);
						}else{ 
							text.push({group: group.id, padID: group.ep_group_pad_id, text: data});
							//console.log(data.text);	
						}
						callback();
					});
					
				}else{
					callback();
				}
			},
			function(err){
				if( err ) {
				  console.log('A file failed to process');
				} else {
				  console.log('All files have been processed successfully');
				  res.type('application/json');
					res.jsonp({etherpad: text });
					res.end('done');	
				}
		}); // end async
	});//end groups
}





/*

3. pads auf seite ausgeben
5. musterlösung ein und ausblenden
6. commentare/messages
7. alle pad-inhalte ausgeben



var args = {
  groupID: 'g.yJPG7ywIW6zPEQla',
  padName: 'testpad',
  text: 'Hello world!',
}
etherpad.createGroup(function(error, data) {
  if(error) console.error('Error creating group: ' + error.message)
  else console.log('New group created: ' + data.groupID)
});

etherpad.getHTML({padID:'ieQLpz8D30jeL7Yo'}, function(err, data){
	if(err){ console.warn(err.message); }
	else{ console.log(data) }
})
**/

/*
var ep_pads = [];

//0. clean up
exports.clean = function (){
	
	for(var i = 0; ep_pads[i] < ep.length; i++){
		//etherpad.padDelete(ep[i].){}
	}
}


var getPadOfGroup = function(groupID){
	for(var i = 0; i < ep.length; i++){
		if(ep_pads[i].group_id === groupID){
			return ep_pads[i];
		}
	}
}
*/


//<iframe name='embed_readwrite' src='http://127.0.0.1:9001/p/ieQLpz8D30jeL7Yo?showControls=true&showChat=true&showLineNumbers=true&useMonospaceFont=false' width=600 height=400></iframe>

