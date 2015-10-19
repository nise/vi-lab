	



var 
	mongoose = require( 'mongoose' ),
	server =  require('../server'),
	Images  = mongoose.model( 'Images' )
	fs = require('node-fs'),
	path = require('path'),
	csv = require('csv')
	;


/*
Import Scene data from csv
**/
exports.folderImport = function ( req, res ){	

	// flush database in order to reload the images later on
	Images.remove({}, function(err) { console.log('collection removed') });
	
	// 
	var dir = './public/' + server.application() + '/static/img/stills';
	var files = fs.readdirSync(dir);
	for(var i in files){
		  if (!files.hasOwnProperty(i)) continue;
		  var name = dir+'/'+files[i];
		  if (fs.statSync(name).isDirectory()){
		      getFiles(dir, files[i]); 
		  }
	}
	
};	

getFiles = function(dir, folder){	  
		var files = fs.readdirSync(dir + '/' + folder); 
		for(var i in files){		
	  	if(files[i].slice(-1) === '~'){ break;}
	      
	      new Images({
	      	title : files[i],
	      	url : dir.slice(1).replace(/\/public/,'') + '/' + folder + '/' + files[i],
	      	scene : folder,
					updated_at : Date.now()
	      }).save( function( err, todo, count ){
	      	//console.log('saved: '+ dir.slice(1) + '/' + folder + '/' + files[i] );
				});
		}// end for
	}// end getFiles

	
	
/*
REST API CALL
**/
exports.getJSON = function(req, res) {
	Images.find().sort( 'url' ).lean().exec(function (err, docs) {
		res.jsonp(docs);
//		.toArray(function(err, items) {
 //     res.type('application/json');
      
   //  });
	});
};	
