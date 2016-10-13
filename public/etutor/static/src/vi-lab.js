/* 
* name: ViLab
* author: niels.seidel@nise81.com
* license: MIT
* description: 
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	 - jquery-ui-1.10.3.js
*/

var $ = jQuery;


/* 
* Class Vi-Lab 
**/ 
var ViLab = $.inherit({ 

  __constructor : function(server_url, the_video_id) { 
  		var _this = this;
  		this.server_url = server_url; 
  		vi2 = this;
  		vi2.dom = "#vi2"; 
  		
  		
  		var m = new Vi2.Maintain();
  		m.foo();
 
  		//
  		$.get('/json/user-data', function(data){  
  			$.get('/json/script', function(script) { 
  				_this.script = script;   
  				_this.currentGroupVideoNum = script.phases[ script['current_phase'] ].groupindex;
  				_this.current_phase = script['current_phase'];   
					_this.wp_user = data.id;
		 			_this.dom = vi2.dom;
		 			_this.loadedWidgets = [];  
					_this.init('startApp', the_video_id);//data.videoid); 
					$('#inte').remove();
					//
					//socket = io('http://127.0.0.1:3033');  //   'http://185.25.252.55:3033'
					//io.set('transports', ['xhr-polling']);
					// refresh database if broadcast message comes i
					
					socket.on('video.refresh.annotations', function(io_data){  
						//console.log('got update notice'+io_data.video)
						_this.init('updateApp', the_video_id);//data.videoid);
					});
					
				});	
  		});
  },
  
  
  json : '',
  current_phase : 0,
  viLog : '',
  wp_user : '',
 	author : '...',
 	title : '...',
  source_selector : '#vi2',
  video_source : '',
  server_url : '',
  plugin_dir : '',
	widgets: { 
		test: 'bam', 
		widgets: [
			{name:'tags'},
			{name:'highlight'}, 
			{name:'toc'},
			{name: 'hyperlinks'},
			{name: 'comments'},
			{name: 'syncMedia'},
			{name: 'assessment'},
			{name: 'assessment-fill-in'},
			{name: 'assessment-writing'}
		]
	},
	widgetOptions : {},
	ajaxurl : '',
	userData : {},
	observer : '',
	videoData : {},
	currentVideo : '',
	currentGroupVideoNum : 1,
	phase : {grouplevel:1},
	videoJSON : {},
	db: {},
	loadedWidgets : [],
	

  	/**
  	* Loads user-, group- and video metadata
  	*/
  	init : function(fn, video_id){
  		this.currentVideo = video_id; 
  		var files = [
  			{path: this.server_url+'/json/videos/' + video_id, storage: 'json_data'}, 
  			{path: this.server_url+'/groups', storage: 'json_group_data'},
	 // 		{path: this.server_url+'data-slides.json', storage: 'json_slide_data'},
  			{path: this.server_url+'/json/users', storage: 'json_user_data'}
  		]
			vi2.db = new Vi2.DataBase( {path: '', jsonFiles: files }, this, fn, undefined );//this.server_url+this.plugin_dir
			/*var files = [
  			{path: 'data.json', storage: 'json_data'},
  			{path: 'data-slides.min.json', storage: 'json_slide_data'}
  		];*/
  	},
  	
  	
  	/* 
  	* Shortcut function to trigger a log entry 
  	**/
		log : function(msg){
			$(this).trigger('log', [msg]);
		},
  	viLog : {},
  	
  	
  	/**
  	*
  	*/
  	startApp : function(){ 
	  	var _this = this;
  		$(vi2.dom).empty(); 
  		$('#seq').empty();
			$('#screen').empty();
		//	$('.video-controls').empty();
			$('#accordion').empty(); 
		 	this.userData = this.db.getUserById( this.wp_user );
		 	
		 	
		 	/*if(this.userData.trace == 1){
		 		$('input#tracing').attr('checked','checked');
		 	}else{
		 		$('#tracing').removeAttr('checked');
		 	}*/
			
		 	this.currentGroup = this.userData.groups[this.currentGroupVideoNum];   
		 	this.groupData = this.db.getGroupById( this.currentGroup ); 
		 	//this.currentVideo = this.groupData.videos[this.currentGroupVideoNum];
			
			this.videoData = this.db.getStreamById( this.currentVideo );
		 
		 	var video = $('<div></div>')
				.attr('type',"video")
				.attr('starttime',0)
				.attr('duration',7)
				.attr('id', "myvideo")
				.text(this.videoData.video)
				.appendTo(vi2.dom); 

			
			// build video player	
			this.loadedWidgets = []; 
			//$("#accordion").accordion('destroy').empty();
			$("#overlay").empty();
			$('body').find('.ui-dialog').each(function(i,val){ $(this).remove(); });
			$('body').find('.some-dialog').each(function(i,val){ $(this).remove(); }); 
			this.viLog = new Vi2.Log({ logger_path:this.server_url+'/log' }); 
  		$(this).bind('log', function(e, msg){ _this.viLog.add(msg); }); 
  			
  		vi2.utils = new Vi2.Utils();
			this.setupVideo( 1 );
			
  	},


  	/* **/
  	updateApp : function(){
			var _this = this; 
			$.each(this.loadedWidgets, function(i, val){ 
				_this.loadedWidgets[i] = '';
				_this.enableWidget(val, _this.widgetOptions[ val ], { refresh:true} ); // 
			});
			this.observer.setAnnotations();
		},

  script : {},
  
  /* setup video*/ // todo: simplify!
  setupVideo : function(has_parallel_media){  
  	var _this = this; 
		var phaseHasSlides = _this.db.hasSlides( _this.currentVideo );//res[0].phases[_this.current_phase].slides;  

		var options = {
			id : _this.currentVideo,
			embed:false,
			selector :   phaseHasSlides === 0  ? '#seq' : '#screen',
			videoWidth:  phaseHasSlides === 1  ? 28 : 900,  // video größe hängt nicht von den angeschalteten widgets, sondern von den anotierten ressourcen ab
			videoHeight: phaseHasSlides === 1  ? 15 : 450, 
			markupType:'html',  
			thumbnail: _this.db.getMetadataById(_this.currentVideo).thumbnail[2]
		};
		// single solution for slide only presentations !!! xxx
		$('#overlay').css('width', $( '.slide' ).width() );
		$('#overlay').css('height', $( '.slide' ).height() );
		/**/
		$(window).resize(function() { 
			// Needs to be a timeout function so it doesn't fire every ms of resize
			setTimeout(function() { 
	      $('#overlay').css('width', $( '.slide' ).width() );
	    	$('#overlay').css('height', $('.slide' ).height() );
			}, 120);
		});
		
		// extract media fragment window.location
		var seek = 0;
		var location = window.location.href.slice(window.location.href.indexOf('#!') + 1);
		location = location.substr(1, location.length);
		if(location.substr(0,6) == 't=npt:'){
			seek = location.split('t=npt:')[1].split(',')[0];	
		}
		_this.observer = new Vi2.Observer( options ); 
	 	_this.observer.init(seek);	 


		
		//metadataa = new Vi2.Metadata( { metatags: true, render: false } );  
			
		//_this.addEdit_btn(); 
		_this.observer.addWidget(_this.viLog); 	 
		//$('#screen').empty();
		this.current_phase = _this.userData.experimental === "üüü" ? 4 : this.script['current_phase'];
		
		
		$.each( this.script['phases'][this.current_phase]['widgets'], function(i, widget){ 
			_this.enableWidget( widget.name, widget);
			_this.widgetOptions[widget.name] = widget; 
		});
		_this.observer.parse(vi2.dom, 'html');
	
		// autoplay
		vi2.observer.player.video.oncanplay = function(e){ 
			vi2.observer.player.play();	
		};	
		
		// set instruction menu
		var pp = this.script['phases'][ (''+_this.db.getStreamById(_this.currentVideo).id)[0] ]//[this.current_phase]; // xxx bad hack
		if( pp !== undefined ){
			$('<div></div>')
				.html( decodeURIComponent(pp.instruction) )
				.addClass('instructions')
				.prependTo('#accordion');
			$('<h3 class="ui-accordion-header ui-corner-all ui-helper-reset ui-state-default ui-accordion-icons"></h3>')
					.css({'padding':'6px 10px', 'background-color':'#003366'})
					.append('<a class="accordion-title" href="#">Aufgabe: ' + decodeURIComponent(pp.title) + '</a>')
					.prependTo('#accordion');
		}
		// misc configurations	
		$('#accordion').accordion({
			collapsible: false,
			heightStyle: "fill" 
		});
		
		// setup modal dialog
		var modal_settings = {
			'toc' : { type: 'toc', title: 'Kapitelmarke hinzufügen', tooltip: 'Kapitel hinzufügen'},
			'comments' : { type: 'comments', title: 'Kommentar hinzufügen', tooltip: 'Kommentar hinzufügen'},
			'hyperlinks' : { type: 'hyperlinks', title: 'Link hinzufügen', tooltip: 'Link hinzufügen'},
			'assessment' : { type: 'assessment', title: 'Aufgabe hinzufügen', tooltip: 'Aufgabe hinzufügen'}
		};
		
		// HIDE MODAL
		$('#myModal').on('hide.bs.modal', function(event){
			// restart playback
			if( _this.observer.player.isPlaying() === false ){
				_this.observer.player.play(); 
			}
			$('body').unbind('keydown').bind('keydown', function(e) { 
				vi2.observer.player.keyboardCommandHandler(e);
			});
		});
		
		// SHOW MODAL DIALOG FOR ANNOTATIONS		
		$('#myModal').on('show.bs.modal', function (event) {  
				 // mute keydown events for text input
				
					// pause video
					if( _this.observer.player.isPlaying() ){
						_this.observer.player.pause(); 
					}
					$('body').unbind('keydown');
					
					var button = $(event.relatedTarget) // Button that triggered the modal
					var type = button.data('annotationtype'); 
					var data = button.data('annotationdata'); 
					var modal = $(this);  
					var widget = vi2.observer.widget_list[ type ];  
					modal.find('.modal-title').html( modal_settings[ type ].title );
					modal.find('.modal-validation').empty();
					
					// prepare forms ...
					if( $.isEmptyObject( data ) ){ 
						// ... for a new annotation
						vi2.observer.log({context:type ,action:'open-form-new-annotation', values:[ vi2.wp_user ] });
						modal.find('.modal-body').html( widget.createAnnotationForm( { content:'', time: vi2.observer.player.currentTime() } ) );
						modal.find('.btn-remove-data').hide();
					}else if( data.content.length === 0){ 
						// for adding a reply, e.g. to a comment
						vi2.observer.log({context:type ,action:'open-form-reply-annotation', values:[data.author] });
						modal.find('.modal-body').html( widget.createAnnotationForm( { content:'', time: data.time } ) );
						modal.find('.btn-remove-data').hide();						
					}else{ 
						// ... for editing an existing annotation
						vi2.observer.log({context:type ,action:'open-form-edit-annotation', values:[data.author] });
						modal.find('.modal-body').html( widget.createAnnotationForm( data ) );
						modal.find('.btn-remove-data').show();
					}
					
					// subit form data
					modal.find('.btn-sava-data').unbind('click');
					modal.find('.btn-sava-data').click( function(event){ 
						var msg = widget.validateAnnotationForm( modal.find('.modal-body'), type );
						var formData = widget.getAnnotationFormData( modal.find('.modal-body') ); 
						if( msg.length === 0 ){ 
							if( $.isEmptyObject( data ) || data.content.length === 0 ){
								// add new annotation to dom
								vi2.observer.log({context:type ,action:'added-new-annotation', values:[ vi2.wp_user  ] });
								widget.addDOMElement({ 
									type: type, 
									date: new Date().getTime(), 
									time: formData.time, 
									content: formData.content 
								}); 
							}else{	
								// updated existing annotation in dom
								vi2.observer.log({context:type, action:'updated-annotation', values:[ data.author ] });
								widget.updateDOMElement({  
									date: data.date, 
									time: formData.time, 
									content: formData.content 
								}); 
							}
							// save to database
							_this.savePopcorn( type );	
							// restart playback
							if( _this.observer.player.isPlaying() === false ){
								_this.observer.player.play(); 
							} 
							modal.modal('hide');
						}else{ 
							modal.find('.modal-validation').html( msg );
						}	
					}); // end save
					
					// remove annotation
					modal.find('.btn-remove-data').unbind('click');
					modal.find('.btn-remove-data').click( function(event){
						if( type == 'tags' || type == 'highlight'){ 
								$( vi2.dom ).find(':contains("'+data.content+'")').each(function(i,val){
									$(this).remove();
								});
							}else{
								$( vi2.dom )
									.find('[date="'+data.date+'"]')
									.remove();
							}	
							_this.savePopcorn( type );
							vi2.observer.log({context:type ,action:'removed-annotation', values:[data.author] });
							// restart playback
							if( _this.observer.player.isPlaying() === false ){
								_this.observer.player.play(); 
							} // restart playback
							modal.modal('hide');
					}); // end remove
					
				});	// end modal	
  }, // end setup
  
 
  	
	/* 
	* build player dialog by widget definitions 
	**/
	enableWidget : function(widget_name, widget_options, refresh ){ 
		var _this = this; 
		var widget = '';
		var title = widget_name; 
		if(this.loadedWidgets.indexOf( widget_name ) != -1){ 
			return;
		} 
		// invoke widgets
		switch(widget_name){
			case "toc" : 
				widget = new Vi2.TableOfContents( widget_options.widget_options ); 
				title = 'Kapitel'; // Szenen 
				break
			case "hyperlinks" :		//alert(JSON.stringify(widget_options.widget_options))
				widget = new Vi2.Hyperlinks( widget_options.widget_options );
				title = 'Links';
				break;	
			case "comments" : 
				widget = new Vi2.Comments( widget_options.widget_options );  
				title = 'Kommentare';
				break;
			case "assessment" : 
				widget = new Vi2.Assessment( widget_options.widget_options );
				title = 'Testfragen';			
				break;
			case "syncMedia" : 
				widget = new Vi2.SyncronizeMedia( widget_options.widget_options );  
				title = 'Folien';
				break;
			case "tags" :
				widget = new Vi2.TemporalTags({
					hasTimelineMarker: true, 
					max:20
				}, {}); // sort:'freq'
				title = 'Tags';    
				break;
			case "highlight" : 
				widget =  new Vi2.VisualHighlighting();
				title = 'Darsteller';    
				break;	
			case "assessment-fill-in" :		
				widget = new Vi2.AssessmentFillIn({target_selector:'#seq', vizOnTimeline: true, minDuration:'5'});
				title = 'Lückenskript';	
				break;
			case "assessment-writing" :		
				widget = new Vi2.AssessmentWriting({target_selector:'#seq', vizOnTimeline: true, minDuration:'5'});
				title = 'Aufgaben';	
				break;		
			default : return;			
		}
		if( widget !== ''){
			this.observer.addWidget( widget ); 
			this.loadedWidgets.push( widget_name );
		} //alert(JSON.stringify(widget_options))
		// add accordion elements
		if( widget_options.widget_options.hasMenu && ! refresh ){ 
			var h3 = $('<h3 class="ui-accordion-header ui-corner-all"></h3>')
				.append('<a class="accordion-title" href="#">' + title + '</a>')
				.appendTo('#accordion');
			if( widget_options.canBeAnnotated ){
				// define 'add'-link
				var link = $('<span></span>')
					.addClass('glyphicon glyphicon-plus add-btn add-btn-'+widget_name )
					.attr('data-toggle', "modal")
					.attr('data-target', "#myModal")
					.attr('data-annotationtype', widget_name)
					.attr('title', 'Neu hinzufügen' )
					.appendTo(h3)	
					;
			}
			$('<div></div>')
				.attr('id', widget_name)
				.appendTo('#accordion');		
		}				
	},
	
	
	

  
  /** 
  * Saves Popcorn data to mongoDB via node.js
  */
  savePopcorn : function(type){ 
  	var _this = this; 
  	// vi-two DOM to popcorn_json
  	var data = this.vitwo2json( type ); 
 		//vi2.observer.log('save:'+type +' '); //console.log('/update-'+type+'/'+this.videoData._id)
 		//
 		$.post('/videos/annotate', {"data":data, annotationtype:type, videoid: _this.videoData._id}, function(res2){ 
 			socket.emit('video.updated', { videoid: _this.videoData._id });
 			_this.observer.setAnnotations();
      //_this.enableEditing(type);
    });
 		return;
  },
  
  
  /* --
  
INPUT:   
<div id="my video" type="video" starttime="0" duration="100">http://localhost/daily/wp-content/uploads/2012/11/Standard-Projekt.webm</div>
<div id="" type="xlink" starttime="0" duration="70.08888562434417" posx="50%" posy="50%"></div>
<div id="" type="seq" starttime="132.82974291710389" seek="0" duration="197.8315320041973">http://localhost/elearning/vi2/_attachments/slides/seidel1/iwrm_seidel1-3.jpg</div>
<div type="comment" author="nise" date="2013-01-03 12:46:03" starttime="15.32">hello world</div>
<div type="toc" author="nise" date="2013-01-03 13:01:46" starttime="16.88">tocc</div>
<div type="tags" author="nise" date="2013-01-03 20:43:26" starttime="0">kex</div>
  
  
  * todo: xxx needs to be abstracted or put into widgets
  **/
  vitwo2json : function(type){
  	var arr = []; 
  	switch(type){
  		case 'tags' : var tags = []; // xxx bugy
				// fetch tags ... {"tagname":"El Nino","occ":[0]},
				$(vi2.dom).find("div[type='tags']").each(function(i, val){
					var flag = 0;
					$.each(tags, function(j,vall){
						if(this.tagname == encodeURIComponent($(val).text())){
							this.occ.push(Number($(val).attr('starttime')));
							flag=1;
						}
					});		
				}); 
				r = tags;
				break;
			case 'highlight' : 
				// fetch highlight ... {"tagname":"El Nino","occ":[0]},
				$(vi2.dom).find("div[type='highlight']").each(function(i, val){
					var flag = 0;
					$.each(highlight, function(j,vall){
						if(this.tagname == encodeURIComponent($(val).text())){
							this.occ.push(Number($(val).attr('starttime')));
							flag=1;
						}
					}); 
					if(flag == 0){
						arr.push(JSON.parse('{"tagname":"'+ encodeURIComponent($(val).text())+'", "occ":['+ Number($(val).attr("starttime"))+'] }'));
					}		
				}); 
				break;
				
			case 'toc' : 
				// fetch toc ... {"label":"2. Objectives","duration":1,"start":"195.960"},
				$(vi2.dom).find("div[type='toc']").each(function(i, val){
					arr.push(JSON.parse('{"label":"'+ encodeURIComponent($(this).text())+'", "start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'" }'));
				});
				break;	
				
			case 'comments' : 
				// fetch comments .. {"comment":"hallo welt", "start":"65","author":"thum.daniel", "date":"29.09.2013"}
				$(vi2.dom).find("div[type='comments']").each(function(i, val){
					arr.push(JSON.parse('{"comment":"'+ encodeURIComponent($(this).text()) +'", "start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'"}'));					
				});
				break;
				
			case 'hyperlinks' : 
				// input: <div type="hyperlinks" starttime="666" duration="55.7" posx="2" posy="95" seek="0" duration2="0" target="#!cullmann" author="admin" date="1416312331209">flood types</div>
				// output: {"type":"hyperlinks","author":"admin","date": "1416312331209","x": 2, "y": 90, "start": "555",  "duration": "37", "title": "details on participation", "target": "newig"},
				$(vi2.dom).find("div[type='hyperlinks']").each(function(i, val){ 
					arr.push({
						type: 'hyperlinks',
						author: $(val).attr('author'),
						date: $(val).attr('date'),
						target: $(val).attr('target'),
						title: encodeURIComponent( $(val).text() ),
						description: encodeURIComponent( $(val).attr('description') ),
						starttime: $(val).attr('starttime'),
						duration: $(val).attr('duration'),
						x: $(val).attr('posx'),
						y: $(val).attr('posy'),
						seek: $(val).attr('seek'),
						duration2: $(val).attr('duration2')
					}); 
				});
				break;	
				
			case 'assessment' : 
				// fetch question
				$(vi2.dom).find("div[type='assessment']").each(function(i, val){ 
					arr.push({
					 type: 'assessment',
					 title: $(val).data('task'),
					 starttime: $(val).attr('starttime'),
					 start: $(val).attr('starttime'),
					 time: $(val).attr('starttime'),
					 author: $(val).attr('author'),
					 date: $(val).attr('date')
					});
					//track_questions_1 += '{"id":"TrackEvent'+i+'","type":"question","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+', "question":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_comments_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';			
				}); 
				break;
		}
		
		return arr;
  },  	


	/* ... */
	getWidgets : function(){
		
		return true;
	}
	

});// end class Vi-Lab


