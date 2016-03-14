
var 
	mongoose = require( 'mongoose' ),
	Videos  = mongoose.model( 'Videos' ),
	Users  = mongoose.model( 'Users' )
	;


/*
 * Renders a introductory page
 **/
exports.renderIndex = function ( req, res ){ 
	res.render( 'admin/index', { });
	res.end('done');
};


/*
 * Renders a dashboard
 **/
exports.renderDashboard = function(req, res) {
  res.render('admin/dashboard', {}); 
	res.end('done');
};


/*
 * Renders Comments as an Learning Result
 **/
exports.renderResultsComments = function(req, res) {
  res.render('admin/results-comments', {}); 
	res.end('done');
};

/*
 * Renders Peer Assessment as an Learning Result
 **/
exports.renderResultsPeerAssessment = function(req, res) {
  res.render('admin/results-peer-assessment', {}); 
	res.end('done');
};


/*
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
*/
