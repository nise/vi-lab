





exports.index = function ( req, res ){
  res.render( 'scenes', { title : 'Express Scenes Example' });
};

//var utils    = require( '../utils' );
var 
	l = require('winston'),
	mongoose = require( 'mongoose' ),
	server =  require('../server'),
	Scenes  = mongoose.model( 'Scenes' ),
	Images = mongoose.model( 'Images' ),
	fs = require('node-fs'),
	csv = require('csv')
	;


/*
Import Scene data from csv
**/
exports.csvImport = function ( req, res ){
	// load data
	fs.readFile(__dirname+'/../data/' + server.application() + '/scenes.csv', function read(err, data) {
		if(err){
			l.log('info', err);
		}
		// get Video dataset in order to extract toc data
		var toc = [];
		Videos  = mongoose.model( 'Videos' );
		Videos.findOne({_id: '52a13d2e2aa9d35f24000777'}, function(err, video) { 
			for(var i=0; i < video.toc.length; i++){
				toc[video.toc[i].number] = video.toc[i].start;
			}
			
			// destroy dataset first
			Scenes.remove({}, function(err) { l.log('info', 'collection removed') });
			csv().from.string(data, {comment: '#'} )
				.to.array( function(data){
					// define scene for each line
					for(var i = 1; i < data.length; i++){
							
						retrieveImages(data[i][0], data, i, function(err, images, data, i) {  
							new Scenes({
								title				: data[i][2],
								number 			: Number(data[i][0]),
								source			: data[i][8], // Source at German Fedaral Archive
								length			: data[i][9],
								start				: toc[Number(data[i][0])],
								status			: data[i][1],
								description	: data[i][3].replace(/^\s+|\s+$/g,''),
								music				: data[i][4],
								protagonists	: String(data[i][6]).split('; '), // column sel persons
								locations		: data[i][7],
								images			: images,
								updated_at : Date.now()
							}).save( function( err, todo, count ){
								//res.redirect( '/scenes' );
							});
						});
					}
				});// end array()
			});// end video call	
			l.log('info', 'Imported scenes.csv');
			l.log('info', '......................')
	});// end fs				
};


function retrieveImages(scene, data, i, callback){
	Images.find({scene: "scene"+scene}, function(err, images) { 
		var img_arr = []; 
		for(var j=0; j < images.length; j++){
			img_arr.push(images[j].url); 
		}
		callback(null, img_arr, data, i);
	});
}



/*
REST API CALL
**/
exports.getJSON = function(req, res) {
	Scenes.find().sort( 'number' ).lean().exec(function (err, docs) {
		res.jsonp(docs);
//		.toArray(function(err, items) {
 //     res.type('application/json');
      
   //  });
	});
};



//
exports.create = function ( req, res ){
  new Scenes({
    title    : req.body.title,
    number		: req.body.number,
    description : req.body.description,
    updated_at : Date.now()
  }).save( function( err, todo, count ){
    res.redirect( '/scenes' );
  });
};


// query db for all todo items
exports.list = function ( req, res ){
  Scenes
		.find()
		.sort( 'number' )
		.exec( function ( err, todos ){ 
			res.render( 'scenes', {
			  title : 'Express Scenes Example',
			  todos : todos
			});
		});
};

// new 
exports.new_one = function ( req, res ){
  Scenes
		.find()
		.sort( 'number' )
		.exec( function ( err, todos ){ 
			res.render( 'scenes-new', {
			  title : 'Express Scenes Example',
			  todos : todos
			});
		});
};

// remove todo item by its id
exports.destroy = function ( req, res ){
  Scenes.findById( req.params.id, function ( err, todo ){
    todo.remove( function ( err, todo ){
      res.redirect( '/scenes' );
    });
  });
};


exports.edit = function ( req, res ){
  Scenes.find( function ( err, todos ){
    res.render( 'scenes-edit', {
        title   : 'Express Scenes Example',
        todos   : todos,
        current : req.params.id
    });
  });
};


// redirect to index when finish
exports.update = function ( req, res ){
  Scenes.findById( req.params.id, function ( err, todo ){
    todo.title    = req.body.title;
    todo.updated_at = Date.now();
    todo.save( function ( err, todo, count ){
      res.redirect( '/scenes' );
    });
  });
};



