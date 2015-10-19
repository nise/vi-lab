
var 
	mongoose = require( 'mongoose' ),
	Videos  = mongoose.model( 'Videos' ),
	Users  = mongoose.model( 'Users' )
	;

exports.index = function ( req, res ){ 

	res.render( 'admin-index', {
	  title : 'Express Videos Example',
	  //items : items
	});
	res.end('done');

};

exports.getVideos = function ( req, res ){ 
  Videos
		.find()
		.sort( 'number' )
		.exec( function ( err, items ){
			res.render( 'admin-videos', {
	  		items: items
			}); 
		});
};

// query db for all todo items
exports.getUsers = function ( req, res ){
  Users
		.find()
		.sort( 'username' )
		.exec( function ( err, items ){
			res.render( 'admin-users', {
	  		items: items
			});
		});
};
