


//var utils    = require( '../utils' );
var 
	mongoose = require( 'mongoose' ),
	server =  require('./../server'),
	Videos  = mongoose.model( 'Videos' ),
	VideoFiles  = mongoose.model( 'VideoFiles' ),
	ScriptInstance = mongoose.model( 'ScriptInstance' ),
	Users = mongoose.model('Users'),
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


exports.renderScriptVideo = function(req, res) { //console.log(88+'---------------------------')
	if( req.user.username !== undefined ){
		// get script phase 
		ScriptInstance.find({ status: 'running' }).exec(function(err, script) {
			if(err){ console.log(err); 
			}else if(script[0] !== undefined){
				var phase = script[0]['current_phase']; 
				// get group of current user
				console.log('phase: '+phase);
				Users.find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, users ){
					var group = users[0].groups[Number(phase)];  
				console.log('group'+group)
					// get video-ids of group
					Groups.find( { id: group }).select('id videos').setOptions({lean:true}).exec(function ( err, groups ){
						console.log(groups);
						if(err){ 
							console.log(err); 
						}else if(groups[0] !== undefined){
							var query = {};
							query['id'] = { $in: groups[0].videos }; // 
							console.log('#################################################');
							// get videos 
							Videos.find( query ).sort( 'id' ).exec( function ( err, videos ){
								
								for(var i = 0; i < videos.length; i++){
									console.log('video '+videos[i].id)
								}
								//res.type('application/json');
								res.render('videos', {items: {videos: videos, script: script[0] } });  
								
							});
						}else{
							//res.type('application/json');
							//res.jsonp({});  
							res.end('done');
						}
					});// end Groups
				});// end Users
			}else{ // end if	
				res.end('done');
			}
		});// end ScriptInstance	
	}		 
}

/*
 * Returns the video instances that the user as part of his group is allowed to see in the current script phase
 * status: functionable
 **/
exports.getJSON = function(req, res) { //console.log(88+'---------------------------')
	if( req.user.username !== undefined ){
		// get script phase 
		ScriptInstance.find({ status: 'running' }).exec(function(err, script) {
			if(err){ console.log(err); 
			}else if(script[0] !== undefined){
				var phase = script[0]['current_phase']; 
				// get group of current user
				console.log('phase: '+phase);
				Users.find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, users ){
					var group = users[0].groups[Number(phase)];  
				console.log('group'+group)
					// get video-ids of group
					Groups.find( { id: group }).select('id videos').setOptions({lean:true}).exec(function ( err, groups ){
						console.log(groups);
						if(err){ 
							console.log(err); 
						}else if(groups[0] !== undefined){
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
								for(var i = 0; i < videos.length; i++){
									console.log('video '+videos[i].id)
								}
								res.type('application/json');
								res.jsonp( {items: {videos: videos, script: script[0] } });  
								res.end('done');
							});
						}else{
							res.type('application/json');
							res.jsonp({});  
							res.end('done');
						} // end if	
					});// end Groups
				});// end Users
			}// end if	
		});// end ScriptInstance	
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










var 
	Groups = mongoose.model('Groups')
	;

// query db for all video items
exports.list = function ( req, res ){ console.log('#################################################');
	// get running script and the current phase 
	ScriptInstance.find({  }).exec(function(err, script) {
		if(err){ console.log(err); 
		}else{
			var phase = script[0]['current_phase']; console.log(phase)
			// get group of current user
			Users.find({ username: req.user.username }).select('groups').setOptions({lean:true}).exec(function ( err, users ){
				var group = users[0].groups[Number(phase)];  
				console.log(group)
				// get video-ids of group
				Groups.find( { id: group }).select('id videos').setOptions({lean:true}).exec(function ( err, groups ){
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
		}// end if	
	});// end ScriptInstances		
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

/// xxxx? löschen
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




/*
 * @todo: Check wheter the user is allow to see this video instance!
 **/ 
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





/*********************************************************************/
/* VIDEO INSTANCES ADMIN */


/*
 * Renders a list of all defined instances of video files
 * status: done
 **/
exports.renderVideoInstances = function(req, res){
	Videos.find( ).sort( 'id' ).exec( function ( err, videos ){  					
		if(err){ console.log(err) }else{
			res.render( 'admin/videos-instances', {
				items : videos
			});
			res.end('done');
		}
	});
}







/*********************************************************************/
/* VIDEO FILES */


/*
 * Renders a template where all video files are listed 
 * status: done
 **/
exports.renderVideoFiles = function(req, res){
	VideoFiles.find( ).sort( 'id' ).exec( function ( err, videos ){
		if(err){ console.log(err) }else{  					
			res.render( 'admin/videos', {
				items : videos
			});
			res.end('done');
		}
	});
}


/*
 * status: xxx
 **/
exports.createFile = function ( req, res ){ 
	new VideoFiles( req.body ).save( function( err, vid, count ){
		if(err) { res.send(err); }
		res.redirect( '/admin/videos/files' );
		console.log('saved video file')
		res.end();
	});
};


/*
 * Render dialog to upload videos and defining its meta data
 * status: finished
 **/ 
exports.renderFileUpload = function ( req, res ){
	res.render( 'admin/videos-file-new', {});
	res.end('done');
};


/*
 * Edit the meta data of an existing video file
 * status: finished
 **/
exports.renderFileEdit = function ( req, res ){
 	VideoFiles.findById( req.params.id, function ( err, videos ){  		
		if(err){ console.log(err) }else{
			res.render( 'admin/videos-file-edit', {
				items : videos
			});
			res.end('done');
		}	
	});
};


/*
 * Updates the metadate of a video file.
 * status: xxx
 **/
exports.updateFile = function ( req, res ){ console.log(req.body)
  VideoFiles.findById( req.params.id, function ( err, video ){ 
		video.title				= req.body.title;
		video.creator			= req.body.creator;
		video.subject	    = req.body.subject;
		video.description	= req.body.description;
		video.publisher   = req.body.publisher;	
		video.contributor = req.body.contributor;
//		video.date				= req.body.date; // cast error
		video.type				= req.body.type;
		video.mimetype 		= req.body.mimetype;
//		video.format			= req.body.format; // handle array
		video.source			= req.body.source;
		video.language		= req.body.language;
		video.relation    = req.body.relation;
		video.coverage    = req.body.coverage;
		video.rights      = req.body.rights;
		video.license     = req.body.license;
		video.video				= req.body.video;
		video.length			= req.body.length;
		video.size				= req.body.size;
		video.thumbnail 	= req.body.thumbnail; 
		video.institution	= req.body.institution;
		video.category		= req.body.category;
		video.tags				= req.body.tags;
		video.updated_at 	= Date.now();
    video.save( function ( err, video, count ){
    	if(err){ console.log(err); } else{
    		res.redirect( '/admin/videos/files' );
				res.end('done');
      }
    });
  });
};


/*
 * Destroys a video file 
 * status: finished
 **/
exports.destroyFile = function ( req, res ){
  VideoFiles.findById( req.params.id, function ( err, video ){
  	if(err){ console.log(err) }else{
		  video.remove( function ( err, person ){
		  	if(err){ console.log(err) 
		  	}else{
		    	res.redirect( '/admin/videos/files' );
		    }	
		    res.end('done');
		  });
		 } 
  });
};


/*
 * Generates 4 stillimages of the video
 * See: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
 **/
var ffmpeg = require('fluent-ffmpeg') 
exports.generateStillImages = function(req, res){
	VideoFiles.findById( req.params.id, function ( err, video ){
		ffmpeg(__dirname+'/../public/etutor/'+video.video)
			.on('filenames', function(filenames) {
				console.log('Will generate ' + filenames.join(', '))
			})
			.on('end', function(err, data) {
				//console.log(err, data);
				res.end()
			})
			.screenshots({
				// Will take screens at 20%, 40%, 60% and 80% of the video
				count: 4,
				//timestamps: [30.5, '50%', '01:10.123'],// alternative
				filename: 'still_'+video.video.split('/').slice(-1)[0].replace('.mp4','')+'_%i.png',
				folder: __dirname+'/../public/etutor/static/img/stills',
				size: '320x240',
			});
	});			
}

/*
 * Creates an instance of a video file 
 * status: finished
 **/
exports.createFileInstance = function ( req, res){
	VideoFiles.findById( req.params.id, function ( err, file ){
  	if(err){ console.log(err) }else{
		  // prepare instance
		  video = getInstanceFromFile(file)
		  // save instance
		  new Videos( video ).save( function ( err, instance ){
		    res.redirect( '/admin/videos/files' );
		    res.end('done');
		  });
		 } 
  });
}


/*
 * Creates video instances for given video files. The instance are defined with a give id.
 * status: finished
 **/
exports.createMultipleFileInstance = function ( files, ids, cb ){
	VideoFiles.find( { '_id' : { $in: files } }).exec( function ( err, files ){ 
  	if(err){ console.log(err) }else{ 
  		// iterate files
		  for(var i = 0; i < files.length; i++){ 
		  	// convert file to instance
				video = getInstanceFromFile(files[i], ids[i]);
				// save it
				new Videos( video ).save( function ( err, instance ){
					if(err){ console.log(err); }
					console.log('created video instance '+ instance.id+'__'+instance.id);
				});
			}// end for
		}// end if  
  });// end find
}


/*
 * Converts a video file document into a video instance document.
 * todo: - assign annotation types dynmically
 * status: finished
 **/
getInstanceFromFile = function(file, id){
	// prep thumbnails
	var arr = [];
	for(var i = 1; i < 5; i++){
		arr.push( 'still_'+file.video.split('/').splice(-1)[0].replace('.mp4','')+'_'+i+'.png' );
	}
	return {
				"id": id === undefined ? Math.floor(Math.random()*1000) : id, 
				"progress": '', // ?
				"video": file.video,
				"metadata": [
				  {
				    "author": file.creator,
				    "institution": file.institution,
				    "title": file.title,
				    "category": file.category,
				    "abstract": file.description,
				    "length": file.length,
				    "date": file.date,
				    "source": file.source,
				    "thumbnail": file.thumbnail === undefined ? arr : file.thumbnail,
				    "tags": file.tags
				  }
				], // need to become dynamic
				"assessmentwriting": [],
				"assessmentfillin": [],
				"assessment": [],
				"comments": [],
				"slides": [],
				"highlight": [],
				"hyperlinks": [],
				"tags": [],
				"toc": [],
			};
}


/*
 * Returns JSON object of all video files
 **/
exports.getAllFilesJSON = function(req, res) { 
	// get videos 
	VideoFiles.find()
		//.distinct('video', function ( err, videos ){
		.exec( function ( err, videos ){
			res.type('application/json');
			res.jsonp(videos);  
			res.end('done');
		});
};







