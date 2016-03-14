


//var utils    = require( '../utils' );
var 
	mongoose = require( 'mongoose' ),
	server =  require('./../server'),
	Videos  = mongoose.model( 'Videos' )
	VideoFiles  = mongoose.model( 'VideoFiles' )
	fs = require('node-fs'),
	csv = require('csv')
	;


/*
Import Videos data from csv
**/
exports.csvImport = function ( req, res ){
	// destroy dataset first
	Videos.find({}, function ( err, docs ){
		var vi = require('../data/' + server.application() + '/videos.json');

		for(var j = 0; j < vi.length; j++){
			//for(var i = 0; i < vi[j].toc.length; i++){ vi[j].toc[i].start = decimal2float(String(vi[j].toc[i]._comment));}
			var t = new Videos(vi[j])
				.save( function( err, video, count ){
					if(err){
						console.log(err)
					}else{
						console.log('Imported video '+video.id);
					}	
				});
		}	
		for(var i in docs){
				docs[i].remove();
		}
	});
	//	
	
	return;				
};

decimal2float = function(time){
	var t = time.split(':'); 
	// remove leading Null
	for(var i in t){ if( t[i].charAt(0) == 0){ t[i] = t[i].charAt(1); } }
	var z = Number(t[0])*3600 + Number(t[1])*60 + Number(t[2]) + Number(t[3]) / 60;
	if(typeof z === 'number' && isNaN(z) == false){
		return z;
	}
	return 0;
}


/*
REST API CALL
**/
exports.index = function ( req, res ){ 
  res.render( 'videos', { title : 'Express Videos Example' });
};


exports.getJSON = function(req, res) { //console.log(88+'---------------------------')
	if( req.user.username !== undefined ){
		// get script phase 
		mongoose.model('Scripts').collection.find().toArray(function(err, script) {
			var phase = script[0]['current_phase']; 
			// get group of current user
			
			mongoose.model('Users').find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, users ){
				var group = users[0].groups[Number(phase)];  
				
				// get video-ids of group
				mongoose.model('Groups').find( { id: group }).select('id videos').setOptions({lean:true}).exec(function ( err, groups ){
					var query = {};
					query['id'] = { $in: groups[0].videos }; // 
					console.log('#################################################');
					// get videos 
					Videos.find( query ).sort( 'id' ).exec( function ( err, videos ){
						// calc status
						/*for(var i = 0; i < videos.length; i++){ 
							// calc duration in Minutes
							duration = ( videos[i].metadata[0].length ).split(':');
							duration = Number( Number(duration[0])*60 + Number(duration[1]) );
							
							if( videos[i].comments !== null ){
								videos[i].status += Number(videos[i].comments.length );
							}else{
								 videos[i].comments = {};
							}	
							
							if( videos[i].assessment !== null )
							videos[i].status += Number(videos[i].assessment.length );
							
							if( videos[i].toc !== null ) 
							videos[i].status += Number(videos[i].toc.length );
							
							if( videos[i].hyperlinks !== null ) 
							videos[i].status += Number(videos[i].hyperlinks.length );
							
							// normalize regarding video duration
							videos[i].progress = Math.round(Number( videos[i].status/Math.round( duration / 10 ) ) * 1000);
						
						} */
						console.log(videos)
						res.type('application/json');
						res.jsonp(videos);  
						res.end('done');
					});
				});// end Groups
			});// end Users
		});// end Scripts	
	}		 
}


exports.getAllJSON = function(req, res) { 
	// get videos 
	Videos.find().sort( 'id' ).exec( function ( err, videos ){
		res.type('application/json');
		res.jsonp(videos);  
		res.end('done');
	});
};

exports.getAllFilesJSON = function(req, res) { 
	// get videos 
	VideoFiles.find()
		//.distinct('video', function ( err, videos ){
		.exec( function ( err, videos ){
		console.log(videos);
		res.type('application/json');
		res.jsonp(videos);  
		res.end('done');
	});
};



//
exports.getOneJSON = function(req, res) { 
	
	Videos.find({_id: req.params.id}).lean().exec(function (err, video) {
		if(err){ 
			console.log(err); 
		}else{
			res.type('application/json');
			res.jsonp(video[0]);
			res.end('done');
		}	
	});
};





/*
 * 
 **/
exports.createFile = function ( req, res ){ 
	req.body = JSON.parse(req.body);
	console.log(req.body)
	var video = {
  	video				: req.body.video,
		author			: req.body.author,
		institution	: req.body.institution,
		title				: req.body.title,
		date				: req.body.date, // date of creation
		source			: req.body.source, 
		category		: req.body.category,
		tags				: String(req.body.tags).split(','),
		language		: req.body.language,
		abstract		: req.body.abstract,	
		type 				: req.body.mimetype,
		duration		: req.body.duration,
		size				: req.body.size, 
		formats 		: [ ""+req.body.mimetype ],
		thumbnail 	: '',
		weight			: 1,
		rights			: req.body.license,
		contributor	: req.user.username,
    updated_at : Date.now()
  };
  // save it
  new VideoFiles( video ).save( function( err, vid, count ){
  	if(err) { res.send(err); }
    //res.redirect( '/videos' );
    console.log(video);
    res.send('saved video file	');
  });
};


/*
 * 
 **/
exports.upload = function ( req, res ){
	  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
  	console.log(req.files)
  	res.end();
	/*
	fs.readFile(req.files.video.path, function (err, data) {
		if( req.files[0].type === 'image/png' ){
			console.log('png');
		}
		var newPath = __dirname + "/uploads/uploadedFileName";
		fs.writeFile(newPath, data, function (err) {
		  res.redirect("back");
		});
	});**/
};



// query db for all video items
exports.list = function ( req, res ){ console.log('#################################################');
	// get script phase 
	mongoose.model('Scripts').collection.find().toArray(function(err, script) {
  	var phase = script[0]['current_phase']; 
  	// get group of current user
	  mongoose.model('Users').find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, users ){
	  	var group = users[0].groups[Number(phase)];  
	  	
			// get video-ids of group
			mongoose.model('Groups').find( { id: group }).select('id videos').setOptions({lean:true}).exec(function ( err, groups ){
				var query = {};
				query['id'] = { $in: groups[0].videos }; // 
				console.log('#################################################');
				
				// get videos
				var duration = 1; 
				Videos.find( query ).sort( 'id' ).exec( function ( err, videos ){  
						
						res.render( 'videos', {
							title : 'Express Videos Example',
							group : group,
							items : videos
						});
						res.end('done');
					});
			});// end Groups
		});// end Users
	});// end Scripts				
};


/*
 * 
 **/
exports.renderVideoInstances = function(req, res){
	Videos.find( ).sort( 'id' ).exec( function ( err, videos ){  					
		res.render( 'admin/videos-instances', {
			items : videos
		});
		res.end('done');
	});
}

/*
 * 
 **/
exports.renderVideoFiles = function(req, res){
	VideoFiles.find( ).sort( 'id' ).exec( function ( err, videos ){  					
		res.render( 'admin/videos', {
			items : videos
		});
		res.end('done');
	});
}


/*
 *
 **/ 
exports.renderNewFileUpload = function ( req, res ){
		res.render( 'admin/videos-new-file', {});
		res.end('done');
};

// remove videos item by its id
exports.destroy = function ( req, res ){
  Videos.findById( req.params.id, function ( err, video ){
    video.remove( function ( err, person ){
      res.redirect( '/videos' );
      res.end('done');
    });
  });
};


exports.editMetadata = function ( req, res ){
  Videos.find( function ( err, videos ){
  	res.type('application/json');
			res.jsonp(videos);
			res.end('done');
		/*	
    res.render( 'admin-videos-edit', {
        title   : 'Express Videos Example',
        items   : videos,
        current : req.params.id
    });
    res.end('done');
    */
  });
};


/*
Load popcorn maker to annotatate the requested video
**/
exports.editAnnotations = function ( req, res ){
  Videos.findOne({ _id: req.params.id}).setOptions({lean:true}).exec(function ( err, videos ){
    res.render( 'popcorn-maker/popcorn-maker', {
        title   : 'Express Videos Example',
        video   : videos,
        bim: "hello"
    });
    res.end('done');
  });
};




/***/ 
exports.show = function ( req, res ){ 
  Videos.find({ _id: req.params.id}).setOptions({lean:true}).exec(function ( err, video ){
  	if(!err){ 
		  res.render( 'videos-single', {
		      title   : 'Express Videos Example',
		      items   : video,
		      current : req.params.id
		  });
		  res.end('done');
    }else{
				console.log('ERROR: '+err)
			}
  });
};


// redirect to index when finish
exports.update = function ( req, res ){
  Videos.findById( req.params.id, function ( err, video ){ 
    video.metadata[0].title = req.body.title;
    video.video = req.body.video;
    video.metadata[0].author = req.body.author;
    video.metadata[0].abstract = req.body.abstract;
    video.metadata[0].category = req.body.category;
    video.updated_at = Date.now();
    video.save( function ( err, video, count ){
      res.redirect( '/videos' );
      res.end('done');
    });
  });
};



// annotate toc
exports.annotate = function(req, res) {

	console.log('..........................start saving: ')
	var query = {'_id':req.body.videoid};
	var update = {};
	switch(req.body.annotationtype){
		case "toc" : update = { toc: req.body.data}; break;
		case "tags" : update = { tags: req.body.data}; break;
		case "assessment" : update = { assessment: req.body.data}; break;
		case "comments" : update = { comments: req.body.data}; break;
		case "hyperlinks" : update = { hyperlinks: req.body.data}; break;
		case "hightlight" : update = { hightlight: req.body.data}; break;
	}
	update.updated_at = Date.now();
	
	console.log('start saving: '+req.body.annotationtype +' '+req.body.videoid);
	
	Videos.findOneAndUpdate(query, update, function(err, doc){
		  if (err){
		  	console.log('****************** ERROR')
		  	console.log(err);
		  	res.send({"msg":"error"});
		  }else{
		  	require('../server').serverEmitter().emit('video.updated', { videoid: req.body.videoid }); 
		  	console.log('@Videos: Updated annotation '+req.body.annotationtype+ ' of video '+req.body.videoid );
	  		res.send({"msg":"succesfully saved"});
	  	}
	});


} 

/*
//
exports.annotateTags = function(req, res) { 
    var videodata = req.body.data; 
    Videos.find({ id:req.params.id}).setOptions({lean:true}).exec(function ( err, video ){
    	if(!err){ console.log()
				video.tags = videodata;
				video.updated_at = Date.now();
				video.save( function ( err, video, count ){
				  //res.redirect( '/videos/view/'+req.params.id );
				});
			}	
  });
}


exports.annotateComments = function(req, res) { 
    var videodata = req.body.data; 
    Videos.findById( req.params.id, function ( err, video ){gr
    	if(!err){ 
				video.comments = videodata;
				video.updated_at = Date.now();
				video.save( function ( err, video, count ){
				  res.redirect( '/videos/view/'+req.params.id );
				});
			}else{
				console.log('ERROR: '+err)
			}	
  });
} 

//
exports.annotateQuestions = function(req, res) { 
    var videodata = req.body.data; 
    Videos.findById( req.params.id, function ( err, video ){
    	if(!err){ 
				video.assessment = videodata;
				video.updated_at = Date.now();
				video.save( function ( err, video, count ){
				  res.redirect( '/videos/view/'+req.params.id );
				});
			}	
  });
} 
*/
//var mongo = require('mongodb');
/*var BSON = mongo.BSONPure;

exports.updateVideoTOC = function(req, res) {
    var id = req.params.id;
    var video = req.body;
    console.log('Updating video: ' + id);
    console.log(JSON.stringify(video));
    //db.collection('videos', function(err, collection) {
        Videos.update({'_id':new BSON.ObjectID(id)}, {$set:{toc:video.data}}, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating video TOC: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(video);
            }
        });
    //});
} 
*/


