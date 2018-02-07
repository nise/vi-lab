var 
	l = require('winston'),
	mongoose = require( 'mongoose' ),
	Groups = mongoose.model( 'Groups' ),
	Users = mongoose.model( 'Users' ),
	Messages = mongoose.model( 'Messages' ),
	ScriptInstances = mongoose.model( 'ScriptInstance');
	;
	
	
/*
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    recipient: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    phase: Number,
    visibility: { type: String, enum: [ 'personal', 'editor', 'group', 'all' ], default: 'group' },
    subject: String,
    type: { type: String, default: 'message',  enum: [ 'chat', 'tutor-question', 'feedback', 'message' ] }, 
    message: String,
    updated_at: { type: Date, default: Date.now }
*/	

exports.render = function(req, res){
	res.render('messages', {});
	res.end();
}

/*
 * Save Messages
 * @todo: send to group
 **/
exports.createMessage = function(req, res) {
	var data = req.body;
	data.author = req.user._id;
	// get current Phase
	ScriptInstances.findOne({ 'status': 'running' }).select('current_phase status').exec(function(err, script){
		console.log(req.user.groups[script.current_phase])
		var query = {};
		//query['groups'] = [];
		//query['groups'][script.current_phase] = String(req.user.groups[script.current_phase]);
		
		//query['_id'] = { $not: req.user._id };
		Users.find().select('_id groups username').exec(function(err, users){
			for(var i=0; i < users.length; i++){
				// handle group messages
				if(users[i]._id !== req.user._id && users[i]['groups'][script.current_phase] === String(req.user.groups[script.current_phase])){
					if( data.recipient.indexOf('my-group') !== -1 && data.recipient.indexOf(users[i]._id) === -1){
						data.recipient.push( users[i]._id ); console.log( 'added'+users[i]._id)
						data.type="group-message"
					}	
				}
				// handle messages to the instructor
				if( data.recipient.indexOf('instructor') !== -1 && users[i].username === 'SONNTAG'){
					data.recipient.push( users[i]._id ); console.log( 'added instructor'+users[i]._id)
				}
				// handle messages to the admin
				if( data.recipient.indexOf('admin') !== -1 && users[i].username === 'SEIDEL'){
					data.recipient.push( users[i]._id ); console.log( 'added admin'+users[i]._id)
				}
			}// end for
			// save message
			console.log(data.recipient)
			if(data.recipient.indexOf('my-group') !== -1){
				data.recipient.splice(data.recipient.indexOf('my-group'), 1);
			}	
			if(data.recipient.indexOf('instructor') !== -1){
				data.recipient.splice(data.recipient.indexOf('instructor'), 1);
			}
			if(data.recipient.indexOf('admin') !== -1){
				data.recipient.splice(data.recipient.indexOf('admin'), 1);
			}
			console.log(data.recipient);
			new Messages( data ).save(function(err, m){
				if(err){ console.log(err);}else{
					console.log('saved message');
					res.end();
				}
			});
		})
	});
}


/*
 * Get messages
 * status: finished
 **/
exports.getPersonalMessages = function(req, res) { 
	var query = { $or: [ {author: req.user._id}, { recipient: { $in: [req.user._id] } } ] };
	Messages
		.find( query )
		.populate('author')
		.populate('recipient')
		.sort('-updated_at')
		.exec(function (err, msg) {
			if(err){ 
				console.log(err); 
			}else{
				res.type('application/json');
				res.jsonp({items: msg, myself: req.user._id });
				res.end('done')
			}	
		});
};

/*
 * @todo: limit to group members and add instructor/tutor to the list
 **/
exports.getPossibleRecipients = function(req, res) {
  Users.find().sort( 'username' ).select('_id name firstname username role').lean().exec(function (err, items) {
	  if(err){ 
			console.log(err); 
		}else{
			res.type('application/json');
			res.jsonp(items); 
		}	 
  });
};
