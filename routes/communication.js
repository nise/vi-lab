var 
	mongoose = require( 'mongoose' ),
	Groups = mongoose.model( 'Groups' ),
	Users = mongoose.model( 'Users' ),
	Messages = mongoose.model( 'Messages' )
	;
	
	
/*
    author: Schema.ObjectId,
    recipient: Schema.ObjectId,
    phase: Number,
    visibility: { type: String, enum: [ 'personal', 'editor', 'group', 'all' ] },
    subject: String,
    type: String,
    message: String,
    date: String
*/	

exports.render = function(req, res){
	res.render('messages', {});
	res.end();
}

/*
 * Save Messages
 * status: finished
 **/
exports.createMessage = function(req, res) {
	var data = req.body;
	data.author = req.user._id;
	new Messages( data ).save(function(err, m){
		if(err){ console.log(err);}else{
			console.log('saved message');
			res.end();
		}
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
		.sort('updated_at')
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
