





exports.index = function ( req, res ){
  res.render( 'persons', { title : 'Express Persons Example' });
};

//var utils    = require( '../utils' );
var 
	mongoose = require( 'mongoose' ),
	server =  require('../server'),
	Persons  = mongoose.model( 'Persons' )
	fs = require('node-fs'),
	csv = require('csv')
	;


/*
Import Perons data from csv
**/
exports.csvImport = function ( req, res ){
	// load data
	fs.readFile(__dirname+'/../data/' + server.application() + '/persons.csv', function read(err, data) { 
		if(err){
			console.log(err);
		}
		// destroy dataset first
		Persons.remove({}, function(err) { console.log('collection removed') });
		// reload it
		csv().from.string(data, {comment: '#'} )
			.to.array( function(data){ 
				// define person for each line
				for(var i = 1; i < data.length; i++){
					new Persons({
						shortname		: String(data[i][0]),
						name 			: data[i][1],
						surename			: data[i][2], // Source at German Fedaral Archive
						birth			: data[i][3],
						birth_place			: data[i][4],
						birth_country	: data[i][5],
						death				: data[i][6],
						death_place	: data[i][7],
						death_country		: data[i][8],
						profession		: data[i][9],
						prof_group		: data[i][10],
						bio		: data[i][11],
						images		: String(data[i][12]).split('; '),
						updated_at : Date.now()
					}).save( function( err, person, count ){
						//res.redirect( '/scenes' );
					});
				}
			});// end array()
			console.log('Imported perons.csv');
			console.log('......................')
	});// end fs				
};


/*
REST API CALL
**/
exports.getJSON = function(req, res) { 
  Persons.collection.find().toArray(function(err, items) {
      res.type('application/json');
			res.jsonp(items);  
  });
};


/*

**/
exports.getOneJSON = function(req, res) {  console.log(9999999999999999999999999999);
	// ).lean().exec(
	var dd = String(req.params.shortname).replace(/\_/,' ');
	Persons.findOne({shortname: dd}, function (err, docs) {
		if(err){ console.log(err); }
		res.type('application/json');
		res.jsonp(docs);
	});
};



//
exports.create = function ( req, res ){
  new Persons({
    title    : req.body.title,
    number		: req.body.number,
    description : req.body.description,
    updated_at : Date.now()
  }).save( function( err, person, count ){
    res.redirect( '/persons' );
  });
};


// query db for all person items
exports.list = function ( req, res ){
  Persons
		.find()
		.sort( 'number' )
		.exec( function ( err, items ){ 
			res.render( 'persons', {
			  title : 'Express Persons Example',
			  items : items
			});
		});
};

// new 
exports.new_one = function ( req, res ){ 
  Persons
		.find()
		.sort( 'number' )
		.exec( function ( err, items ){ 
			res.render( 'persons-new', {
			  title : 'Express Persons Example',
			  items : items
			});
		});
};

// remove persons item by its id
exports.destroy = function ( req, res ){
  Persons.findById( req.params.id, function ( err, person ){
    person.remove( function ( err, person ){
      res.redirect( '/persons' );
    });
  });
};


exports.edit = function ( req, res ){
  Persons.find( function ( err, persons ){
    res.render( 'persons-edit', {
        title   : 'Express Persons Example',
        items   : persons,
        current : req.params.id
    });
  });
};

exports.show = function ( req, res ){ 
	console.log(req.p)
  Persons.findOne({shortname: String(req.params.shortname).replace(/\_/,' ')}, function ( err, persons ){ 
    res.render( 'persons-single', {
        title   : 'Express Persons Example',
        items   : persons,
        current : req.params.shortname
    });
  });
};


// redirect to index when finish
exports.update = function ( req, res ){
  Persons.findById( req.params.id, function ( err, person ){
    person.title    = req.body.title;
    person.updated_at = Date.now();
    person.save( function ( err, person, count ){
      res.redirect( '/persons' );
    });
  });
};



