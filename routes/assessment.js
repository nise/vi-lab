var 
	l = require('winston'),
	mongoose = require( 'mongoose' ),
	server =  require('../server'),
	Tests  = mongoose.model( 'Tests' ),
	Fillin  = mongoose.model( 'Fillin' ),
	Written  = mongoose.model( 'Written' ),
	fs = require('node-fs'),
	csv = require('csv')
	;

/*

**/
exports.getTest = function(req, res){
	var t = require('../data/'+ server.application() +'/assessment.json');
	res.jsonp(t);
}	

exports.index = function ( req, res ){
  res.render( 'assessment', { title : 'Express Videos Example' });
};


exports.getPreTest = function(req, res){
	var t = require('../data/'+ server.application() +'/assessment-pre-test.json');
	res.jsonp(t);
}
exports.getPostTest = function(req, res){
	var t = require('../data/'+ server.application() +'/assessment-post-test.json');
	res.jsonp(t);
}	
	

exports.renderPreTest = function ( req, res ){
  res.render( 'assessment-pre-test', {});
};
exports.renderPostTest = function ( req, res ){
  res.render( 'assessment-post-test', {});
};

exports.setPrePostResults = function ( req, res ){ 
  new Tests({
    user : req.user.username, 
    type:'prepost',
    results		: req.body.results,
    user_results		: req.body.user_results,
    process_time : req.body.process_time,
    updated_at : Date.now()
  }).save( function( err, person, count ){
  	if(err){
  		console.log(err)
  	}else{
  		console.log('SAVED test results');
  		console.log();
  	}
    //res.redirect( '/assessment' );
    res.send({done:true});
  });
};

exports.getPrePostResults = function(req, res){
	//Tests.collection.find().toArray(function(err, items) {
	Tests.find({user: req.user.username, type:'prepost' }).exec(function(err, items) {
		res.type('application/json');
		res.jsonp(items);  
		res.end('done');
  });
}	


exports.getResults = function(req, res){
	//Tests.collection.find().toArray(function(err, items) {
	Tests.find({user: req.user.username, type:'selftest'}).exec(function(err, items) {
		res.type('application/json');
		res.jsonp(items);  
		res.end('done');
  });
}	


exports.getAllPrePostResult = function(req, res){
	Tests.find({ type:'prepost'}).exec(function(err, items) {
		res.type('application/json');
		res.jsonp(items);  
		res.end('done');
  });
}

exports.setResults = function ( req, res ){ 
  new Tests({
    user : req.user.username, 
    type:'selftest',
    results		: req.body.results,
    user_results		: req.body.user_results,
    process_time : req.body.process_time,
    updated_at : Date.now()
  }).save( function( err, person, count ){
  	if(err){
  		console.log(err)
  	}else{
  		console.log('SAVED test results');
  		console.log();
  	}
    //res.redirect( '/assessment' );
    res.send({done:true});
  });
};



/* 
FILL-IN Tasks
**/
exports.getFillins = function(req, res){
	//Fillin.remove({}, function(err) { console.log('removed fill-ins'); });
	// req.params.field consists of video-id and field-id
	Fillin.find({ field: req.params.field }).sort( { updated_at:'asc'} ).exec(function(err, items) { 
		if( err ){
			console.log(err);
			res.type('application/json');
			res.jsonp({empty:true});  
			res.end('done');
			return;
		}
		if( items.length == 0){ // empty field
			res.type('application/json');
			res.jsonp({empty:true});  
			res.end('done');
			return;
		}
    res.type('application/json');
		res.jsonp(items);  
		res.end('done');
  });
}	

/*
Post text of fill-in and save it
**/
exports.setFillins = function ( req, res ){ 	
	Fillin.findOneAndUpdate(
    {"field": req.params.field },
    {$push: {"contents": {
		  	username: req.user.username, 
		  	user_id: req.user.id, 
		  	text: req.body.text,
		  	updated_at : Date.now()
		  	}
    	}
    },
    {safe: true, upsert: true},
    function(err, model) {
    	if(err){
      	console.log(err);
      }else{
      	//console.log(model);
      } 
    }
	);
};



/*
 Assessment-Writing
**/
/* 
FILL-IN Tasks
**/
exports.getWrittenAssessment = function(req, res){
	//Fillin.remove({}, function(err) { console.log('removed fill-ins'); });
	// req.params.field consists of video-id and field-id
	Written.find({ field: req.params.field }).sort( { updated_at:'asc'} ).exec(function(err, items) { 

		if( err ){
			console.log(err);
			res.type('application/json');
			res.jsonp({empty:true});  
			res.end('done');
			return;
		}
		if( items.length == 0){ // empty field
			res.type('application/json');
			res.jsonp({empty:true});  
			res.end('done');
			return;
		}
    res.type('application/json');
		res.jsonp(items);  
		res.end('done');
  });
}	

/*
Post text of fill-in and save it
**/
exports.setWrittenAssessment = function ( req, res ){ 	
	Written.findOneAndUpdate(
    {"field": req.params.field },
    {$push: {"contents": {
		  	username: req.user.username, 
		  	user_id: req.user.id, 
		  	text: req.body.text,
		  	updated_at : Date.now()
		  	}
    	}
    },
    {safe: true, upsert: true},
    function(err, model) {
    	if(err){
      	console.log(err);
      }else{
      	//console.log(model);
      } 
    }
	);
};

	
