/* 
* name: ViLab
* author: niels.seidel@nise81.com
* license: MIT
* description: 
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	 - jquery-ui-1.10.3.js
* todo:
*  - 
*  - 
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
 
  		//
  		$.get('/json/user-data', function(data){  
  			$.get('/json/script', function(script) { 
  				_this.script = script;   
  				_this.currentGroupVideoNum = script[0].phases[ script[0]['current_phase'] ].groupindex;
  				_this.current_phase = script[0]['current_phase'];   
					_this.wp_user = data.id;
		 			_this.dom = vi2.dom;
		 			_this.loadedWidgets = [];  
					_this.init('startApp', the_video_id);//data.videoid); 
					$('#inte').remove();
					//
					_this.socket = io('http://127.0.0.1:3033');  //   'http://185.25.252.55:3033'
					//io.set('transports', ['xhr-polling']);
					// refresh database if broadcast message comes i
					
					_this.socket.on('refresh annotations', function(io_data){  alert('got update notice'+io_data.video)
						_this.init('updateApp', the_video_id);//data.videoid);
					});
					
				});	
  		});
  },
  
  
  json : '',
  current_phase : 0,
  viLog : '',
  socket : '',
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
		 	  
		 	if(this.userData.trace == 1){
		 		$('input#tracing').attr('checked','checked');
		 	}else{
		 		$('#tracing').removeAttr('checked');
		 	}
			
		 	this.currentGroup = this.userData.groups[this.currentGroupVideoNum];   
		 	this.groupData = this.db.getGroupById( this.currentGroup ); //alert('group:'+this.currentGroup)
		 	//this.currentVideo = this.groupData.videos[this.currentGroupVideoNum]; //alert('group-video-index::'+this.currentGroupVideoNum)
			//alert(this.currentVideo)
			this.videoData = this.db.getStreamById( this.currentVideo );
		 
		 	//this.socket.emit('registered user', { user_id: this.userData.id, group_id: this.currentGroup });
		 	
		 	//alert(JSON.stringify(this.groupData.videos[this.currentGroupVideoNum]))
		 	//alert(this.videoData.video)
		 	var video = $('<div></div>')
				.attr('type',"video")
				.attr('starttime',0)
				.attr('duration',7)
				.attr('id', "myvideo")
				.text(this.videoData.video)
				.appendTo(vi2.dom); 

			/* define user area				
			var logout = $('<a></a>')
				.attr('href', '/user-logout')
				.text(' logout')
				;
			var the_user = $('<a></a>')
				.attr('href', '/user-data')
				.addClass('account-data-name')
				.css('background-image', "url('img/user-icons/user-"+this.userData.id+".png')")
				.text( this.userData.username);
			
			$('.account-data')
				.empty()
				.append(the_user)
				.append(' | ')
				.append(logout);
			*/
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
			
   		//var t = $('#container').html();
   		//$('#container').parent().remove();
   		//$('.header').after(t);
  	},


  	/* **/
  	updateApp : function(){
			var _this = this; 
			$.each(this.loadedWidgets, function(i, val){ 
				_this.loadedWidgets[i]='';
				_this.enableWidget(val, { hasMenu: false});
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
			selector :   phaseHasSlides === 0  ? '#seq' : '#seq',
			videoWidth:  phaseHasSlides === 1  ? 28 : 900,  // video größe hängt nicht von den angeschalteten widgets, sondern von den anotierten ressourcen ab
			videoHeight: phaseHasSlides === 1  ? 15 : 450, 
			markupType:'html',  	
			theme:'simpledark', 
			childtheme:'iwasbasicwhite',
			thumbnail: _this.db.getMetadataById(_this.currentVideo).thumbnail
		};
		$('#overlay').css('width', options.videoWidth - 35);
	
		
		// extract media fragment window.location
		var seek = 0;
		var location = window.location.href.slice(window.location.href.indexOf('#!') + 1);
		location = location.substr(1, location.length);
		if(location.substr(0,6) == 't=npt:'){
			seek = location.split('t=npt:')[1].split(',')[0];	
		}
		
		_this.observer = new Vi2.Observer(options); 
	 	_this.observer.init(seek);	 
		
		//_this.viLog = new Log({path: _this.server_url+_this.plugin_dir+'/ip.php', prefix:'[wp_site:'+site_name+', wp_post:'+_this.post_id+', user:'+_this.wp_user+']'}); 
		//$(_this).bind('log', function(e, msg){ _this.viLog.add(msg); });
		 
		metadataa = new Vi2.Metadata( { metatags: true, render: false } );  
		_this.addEdit_btn(); 
		_this.observer.addWidget(_this.viLog); 	 
		//$('#screen').empty();
		this.current_phase = _this.userData.experimental === "üüü" ? 4 : this.script[0]['current_phase'];
		
		$.each( this.script[0]['phases'][this.current_phase]['widgets'], function(i, widget){ 
			_this.enableWidget( widget.name, widget); 
		}); 
		_this.observer.parse(vi2.dom, 'html');
				
		
		// xxx
		// set instruction menu
		$('.instructions').empty();
		var tab = $('<ul></ul>');//
		var tab_content = $('<div></div>')
			.attr('id', 'instructions-tabs')
			.prependTo('.instructions')
			;
		tab_content
			.append($('<div></div>').addClass('ui-tabs-label').text('.'))
			.append(tab);
			
		var ii = 1; 
		var current = -1; //alert('__'+JSON.stringify(this.script[0]['phases'][2]))
		$.each( this.script[0]['phases'], function(i, ins){
			if(i < 5){ // xxx bugy ... 
				tab.append('<li><a href="#instab'+ii+'">'+ii+'</a></li>');
				if(_this.userData.experimental === ""){  // kontrollgruppe
					tab_content.append($('<div></div>').attr('id', 'instab'+ii).html('<strong>'+ins.title_k+':</strong> '+ins.instruction)); // 
				}else{ // experimentalgruppe
					tab_content.append($('<div></div>').attr('id', 'instab'+ii).html('<strong>'+ins.title+':</strong> '+ins.instruction));
				}
				ii++;
			}	
		});		
		tab_content.tabs();
		tab_content.tabs('select', _this.userData.experimental === "" ? 0 : this.current_phase);
	
		
		
		// misc configurations	
		$('#accordion').accordion({
			collapsible: false,
			heightStyle: "fill",
			change: function( event, ui ) { 
				_this.enableEditing($('#accordion').find('.ui-accordion-content-active').attr('id'));
				//$.each(_this.loadedWidgets, function(i, val){ _this.enableEditing(val); });
			} 
		});
		//$('#accordion').css('width', '-moz-calc(100vh -'+ $('#video1').css('width')+')');
		
		/*$( "#accordion-resizer" ).resizable({
	    minHeight: 140,
	    minWidth: 200,
	    resize: function() {
	      $( "#accordion" ).accordion( "refresh" );
	    }
  	});*/
		
	
		
  },
  
 
  	
	/* 
	* build player dialog by widget definitions 
	**/
	enableWidget : function(widget_name, widget_options){ 
		var _this = this; 
		var widget = '';
		var title = widget_name; 
		if(this.loadedWidgets.indexOf( widget_name ) != -1){ 
			return;
		}
		// invoke widgets
		switch(widget_name){
			case "toc" : 
				widget = new Vi2.TableOfContents( widget_options.options ); 
				title = 'Kapitel'; // Szenen 
				break
			case "hyperlinks" :		
				widget = new Vi2.Hyperlinks( widget_options.options );
				title = 'Links';
				break;	
			case "comments" : 
				widget = new Vi2.Comments( widget_options.options );  
				title = 'Kommentare';
				break;
			case "assessment" : 
				widget = new Vi2.Assessment( widget_options.options );
				title = 'Testfragen';			
				break;
			case "syncMedia" : 
					widget = new Vi2.SyncronizeMedia( {
						selector: '#syncMedia', 
						hasTimelineMarker: false, 
						controls: false, 
						path : '/static/slides/'
					});//, placeholder: 'slides/'+stream+'/'+stream+'_00001.jpg'}); 
					title = 'Orte';
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
		this.observer.addWidget( widget );
		this.loadedWidgets.push( widget_name );
		
		// add accordion elements
		if( widget_options.options.hasMenu ){ 
			var h3 = $('<h3 class="ui-accordion-header ui-corner-all"></h3>')
				.append('<a class="accordion-title" href="#">' + title + '</a>')
				.appendTo('#accordion');
			if( widget_options.canBeAnnotated ){
				
				/*
					switch(widget['name']){  
						// args: type, dialog label, short icon name
						case 'comments' : _this.prepareDialog('comments', 'Kommentar hinzufügen', '+ Kommentar');  break;
						case 'tags' :  _this.prepareDialog('tags', 'Schlüsselwort (tag) hinzufügen', '+ Tag'); break;
						case 'highlight' : _this.prepareDialog('highlight', 'Schlüsselwort (tag) hinzufügen', '+ Tag'); break;
						case 'toc' : _this.prepareDialog('toc', 'Kapitelmarke für das Inhaltsverzeichnis hinzufügen', '+ Kapitel'); break;
						case 'assessment' :  _this.prepareDialog('assessment', 'Frage hinzufügen', '+ Frage'); break;
						case 'assessment-fill-in' :  _this.prepareDialog('assessment-fill-in', 'Lücke hinzufügen', '+ Frage'); break;
						case 'assessment-writing' :  _this.prepareDialog('assessment-writing', 'Frage hinzufügen', '+ Frage'); break;
					}	
				*/
				
				//xxx variable should be part of widgets
				var modal_settings = {
					'toc' : { type: 'toc', title: 'Kapitelmarke hinzufügen', tooltip: 'Kapitel hinzufügen'},
					'comments' : { type: 'comments', title: 'Kommentar hinzufügen', tooltip: 'Kommentar hinzufügen'},
					'hyperlinks' : { type: 'hyperlinks', title: 'Link hinzufügen', tooltip: 'Link hinzufügen'},
					'assessment' : { type: 'assessment', title: 'Aufgabe hinzufügen', tooltip: 'Aufgabe hinzufügen'}
				};
				
				var link = $('<span></span>')
					.addClass('glyphicon glyphicon-plus add-btn add-btn-'+widget_name )
					.attr('data-toggle', "modal")
					.attr('data-target', "#myModal")
					.attr('data-annotationtype', widget_name)
					.attr('title', modal_settings[ widget_name ].tooltip )
					.appendTo(h3)	
					;
					 
				$('#myModal').on('show.bs.modal', function (event) {   
					// pause video
					_this.observer.player.pause(); 
					
					/*if(_this.saveDialog(type, vi2.observer.player.currentTime(), form, undefined, this)){	// dialog, type, time, form		
						$(this).dialog("close");			
					}*/
					
					var button = $(event.relatedTarget) // Button that triggered the modal
					var type = button.data('annotationtype'); 
					var data = button.data('annotationdata'); 
					var modal = $(this);  
					var widget = vi2.observer.widget_list[ type ]; 
					modal.find('.modal-title').html( modal_settings[ type ].title );
					

					// prepare forms ...
					if( $.isEmptyObject( data ) ){ // ... for a new annotation
						modal.find('.modal-body').html( widget.createAnnotationForm( { content:'', time: vi2.observer.player.currentTime() } ) );
						modal.find('.btn-remove-data').hide();
					}else if( data.content.length === 0){ // for adding a reply, e.g. to a comment
						modal.find('.modal-body').html( widget.createAnnotationForm( { content:'', time: data.time } ) );
						modal.find('.btn-remove-data').hide();						
					}else{ // ... for editing an existing annotation
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
								widget.addDOMElement({ 
									type: type, 
									date: new Date().getTime(), 
									time: formData.time, 
									content: formData.content 
								}); 
							}else{		 
								// updated existing annotation in dom
								widget.updateDOMElement({ 
									date: data.date, 
									time: formData.time, 
									content: formData.content 
								}); 
							}
							// save to database
							_this.savePopcorn( type );	
							vi2.observer.log('saveannotation:' + type + ' ' + formData.time );
							vi2.observer.player.play(); // restart playback
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
							vi2.observer.log('del:'+type +' '+data.time);
							vi2.observer.player.play(); // restart playback
							modal.modal('hide');
					}); // end remove
					
				});	// end modal
			}
			$('<div></div>')
				.attr('id', widget_name)
				.appendTo('#accordion');		
		}	
			// xxx bad hack instead of providing a timed feature like this
			/*if(widget_name == 'assessment-fill-in'){
				h3.append(
					$('<a></a>')
						.addClass('accordion-btn ui-state-default add-'+widget_name)
						.css('padding-left','12px')
						.text('-')
						.bind('mouseenter',function(){
							$('.assessment-fill-in').hide(430);
						})
						.bind('mouseleave',function(){
							$('.assessment-fill-in').show(240);
						})
						.tooltip({delay: 2, showURL: false, bodyHandler: function() { 
							return $('<span></span>').text('Lücken verbergen und Text vollständig anzeigen'); } 
						})
				);	
			}*/
			
	},
	
	
	

  
  /** 
  * Saves Popcorn data to mongoDB via node.js
  */
  savePopcorn : function(type){ 
  	var _this = this; 
  	// vi-two DOM to popcorn_json
  	var data = this.vitwo2json( type );
 		vi2.observer.log('save:'+type +' '); //alert('/update-'+type+'/'+this.videoData._id)
 		//
 		$.post('/videos/annotate', {"data":data, annotationtype:type, videoid:_this.videoData._id}, function(res2){ 
 			_this.socket.emit('updated video', { videoid: _this.videoData._id });
 			_this.observer.setAnnotations();
      _this.enableEditing(type);
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
  	var r = []; 
  	switch(type){
  		case 'tags' : var tags = [];
				// fetch tags ... {"tagname":"El Nino","occ":[0]},
				$(vi2.dom).find("div[type='tags']").each(function(i, val){
					var flag = 0;
					$.each(tags, function(j,vall){
						if(this.tagname == encodeURIComponent($(val).text())){
							this.occ.push(Number($(val).attr('starttime')));
							flag=1;
						}
					}); 
					if(flag == 0){
						//tags.push( JSON.parse('{"tagname":"'+ encodeURIComponent($(val).text())+'", "occ":['+ Number($(val).attr("starttime"))+'] }'));
					}
					//track_tags_1 += '{"id":"TrackEvent'+i+'","type":"tag","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+',"tag":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_tags_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
				}); 
				r = tags;
				break;
			case 'highlight' : var highlight = [];
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
						highlight.push(JSON.parse('{"tagname":"'+ encodeURIComponent($(val).text())+'", "occ":['+ Number($(val).attr("starttime"))+'] }'));
					}
					//track_tags_1 += '{"id":"TrackEvent'+i+'","type":"tag","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+',"tag":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_tags_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
				}); 
				r = highlight;
				break;
				
			case 'toc' : var toc = [];
				// fetch toc ... {"label":"2. Objectives","duration":1,"start":"195.960"},
				$(vi2.dom).find("div[type='toc']").each(function(i, val){
					toc.push(JSON.parse('{"label":"'+ encodeURIComponent($(this).text())+'", "start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'" }'));
					//track_toc_1 += '{"id":"TrackEvent'+i+'","type":"toc","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+',"toc":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_toc_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
				});
				r = toc;
				break;	
				
			case 'comments' : var comments = [];
				// fetch comments .. {"comment":"hallo welt", "start":"65","author":"thum.daniel", "date":"29.09.2013"}
				$(vi2.dom).find("div[type='comments']").each(function(i, val){
					comments.push(JSON.parse('{"comment":"'+ encodeURIComponent($(this).text()) +'", "start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'"}'));					
				});
				r = comments;
				break;
				
			case 'hyperlinks' : var hyperlinks = [];
				// input: <div type="hyperlinks" starttime="666" duration="55.7" posx="2" posy="95" seek="0" duration2="0" target="#!cullmann" author="admin" date="1416312331209">flood types</div>
				// output: {"type":"hyperlinks","author":"admin","date": "1416312331209","x": 2, "y": 90, "start": "555",  "duration": "37", "title": "details on participation", "target": "newig"},
				$(vi2.dom).find("div[type='hyperlinks']").each(function(i, val){
					hyperlinks.push({
						type: 'hyperlinks',
						author: $(this).attr('author'),
						date: $(this).attr('date'),
						target: $(this).attr('target'),
						title: encodeURIComponent( $(this).text() ),
						description: encodeURIComponent( $(this).attr('description') ),
						starttime: $(this).attr('starttime'),
						duration: $(this).attr('duration'),
						x: $(this).attr('posx'),
						y: $(this).attr('posy'),
						seek: $(this).attr('seek'),
						duration2: $(this).attr('duration2')
					});
					//JSON.parse('{"label":"'+ encodeURIComponent($(this).text())+'", "start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'" }'));
					//track_toc_1 += '{"id":"TrackEvent'+i+'","type":"toc","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+',"toc":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_toc_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
				});
				r = hyperlinks;
				break;	
				
			case 'assessment' : var questions = [];
				// fetch question
				$(vi2.dom).find("div[type='assessment']").each(function(i, val){ 
					questions.push(JSON.parse('{"title":"'+encodeURIComponent($(this).text())+'","start":"'+$(this).attr('starttime')+'", "author":"'+$(this).attr('author')+'", "date":"'+$(this).attr('date')+'"}'));
					//track_questions_1 += '{"id":"TrackEvent'+i+'","type":"question","popcornOptions": {"start":'+$(this).attr('starttime')+',"end":'+(Number($(this).attr('starttime'))+10)+', "question":"'+encodeURIComponent($(this).text())+'", "date":"'+$(this).attr('date')+'", "author":"'+$(this).attr('author')+'", "target":"Area1"}, "track":"Track_comments_1","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';			
				});
				r = questions;
				break;
		}
		
		//json = JSON.parse(json);
		

		return r;
  },  	
	
	
	
	
	
	
	
	
	/** 
  * distinguish different input methods beside textarea :: tags, question/answers
  */
  /*
  prepareDialog : function(type, label, short_name){  
  	var _this = this;
  	var selector = $('<div></div>').attr('id','annotation-dialog-'+type).addClass('some-dialog');

		// add "+"-button to accordion panes 	
		$( '.add-btn-'+type ).bind('click', function(e) { alert(233+type)
			selector.dialog('open'); 
		});
		
		// Build form as simple textarea for anotation or as complex (MC-)question and answers form
  	var form = type != 'assessment' ? $('<textarea></textarea>').attr('id', 'annotionContent') : this.observer.widget_list[type].buildAssessmentForm(selector)
  	
  	// Build dialog window
  	selector
			.html(form)
			.appendTo('#seq')
			.dialog({
					autoOpen: false,
					height: '300', 
					width: '400', 
					modal:true, 
					draggable: false,
					open : function(){  
						_this.observer.player.pause();
					},
					buttons : {
						"save" : function(){ 
							//if(_this.saveDialog(type, vi2.observer.player.currentTime(), form, undefined, this)){	// dialog, type, time, form		
								//$(this).dialog("close");			
							//}
						}
					},
					closeOnEscape: true,
					resizable: false,
					title: label,// + ' to ' + $(this).attr('title'),
					//position:['100',0], 
					colseText:'x',
					zIndex:200000						
			}); 
  },
  
  */
  
  
  
  
  
  
  /** -- */
  saveDialog: function(type, time, form, replaceAnnotation, selector){ 
  	var _this = this;
  	if( ! _this.validateForm(selector)){
  		return false;
  	}
  	var data = {};
		data.time = time;  
		//				
		if(type == 'assessment'){  	 
			var o = {};
			o.question = $(selector).find('#annotionQuestion').val(); 
			o.answ = [];
			o.correct = []; 
			var qtype = 'mc';
			$(selector).find('.questionanswers div.answer').each(function(i, val){
				if($(this).find("input[name='quest']:checked").val() == 1){ 
					o.correct.push($(this).attr('id'));
				}
				var the_answer = $(this).find("input[type='text']").val();
				if(the_answer == undefined){ 
					the_answer = $(this).find('textarea').val(); 
					qtype = 'fill-in';
				}
				o.answ.push({id: $(this).attr('id'), answ: the_answer, questiontype: qtype });
			});
			data.content = o; //JSON.stringify(o); //alertencodeURIComponent(data.content));
		}else{
			data.content = form.val();
		}
		// validation					
		if (data.content != {}){   
			// update DOM
			var element = ''; 
			if(replaceAnnotation != undefined){ //alert('update DOM-'+type+'___'+JSON.stringify(data.content.question)); 
				if(type == 'tags' || type == 'highlight'){ //alert(replaceAnnotation+'   '+data.content)
					$(vi2.dom).find(':contains("'+replaceAnnotation.replace('--',' ')+'")').each(function(i,val){
						$(this).text(data.content);
					});
				}else{ 
					$(vi2.dom).find('[starttime="'+replaceAnnotation+'"]')
						.attr('author', vi2.wp_user)
						.attr('date', new Date().getTime())
						.text(type=='assessment' ? JSON.stringify(data.content) : data.content);
				}	
			// add DOM		
			}else{ //alert('add DOM')//alert(JSON.stringify(data.content)); alert(data.type)
				element = $('<div></div>')
		  		//.attr('id', el.popcornOptions.text)
		  		.attr('type', type)
		  		.attr('starttime', data.time)
		  		//.attr('duration', 10)
		  		.attr('author', vi2.wp_user)
		  		.attr('date', new Date().getTime()) // time in ms
		  		.html(type=='assessment' ? JSON.stringify(data.content) : data.content )
		  		.appendTo(vi2.dom);
    	}	
			// save to popcorn / WP
			vi2.observer.log('saveannotation:'+type +' '+data.time);
			
			_this.savePopcorn(type);	
			// update player
  		
			//_this.observer.log('[call:add_annotation, content:'+data.content+', time:'+data.time+']');
			_this.observer.player.play(); // restart playback
		
		}else{
			//_this.player.play();									
		}		
		return true;
  },
  
 
	/* 
	* -- 
	**/
	enableEditing : function(ttype){  
		var annotate = false;
		this.script[0].current_phase = this.userData.experimental === "" ? 4 : this.script[0]['current_phase'];
		
		$.each(this.script[0]['phases'][this.script[0].current_phase]['widgets'], function(i, widget){ 
			if(this.name == ttype){ 
				annotate = widget.annotate;
			}
		});
		if(! annotate){
			return;
		}
		  
		var _this = this;
		// 
		$('.'+ttype+'list').find('a.accordion-annotation-edit').each(function(i,val){ $(this).remove(); });
		
		$('.'+ttype+'list').find('li').each(function(i, val){  
			if(ttype =='toc' || ttype =='tags' || ttype == 'highlight' || $(val).attr('author') == _this.wp_user){ 
				var selector = $('<div></div)').attr('id','annotation-dialog-'+ttype+'-'+i).addClass('some-dialog');
				var id = $(val).find('a').attr('class').replace('id-', '');
				
				var edit_btn = $('<a></a>')
					.addClass('accordion-annotation-edit tiny-edit-btn ui-button tiny-edit-btn-'+ttype)
					.click(function(e){ 
						selector.dialog('open'); // {"question":"bim","answ":[{"id":"answ0","answ":"he"},{"id":"answ1","answ":"ho"}],"correct":"answ0"}
					});
				var delete_btn = $('<a></a>')
					.addClass('accordion-annotation-edit tiny-delete-btn ui-button tiny-delete-btn-'+ttype)
					.click(function(e){ 
						//$(this).text('realy?').click(function(){ 
							//$(this).parent().parent().remove();
							//vi2.observer.log('deleteannotation:'+ttype+' '+id);
							if(ttype == 'tags' || ttype == 'highlight'){ 
								$(vi2.dom).find(':contains("'+id+'")').each(function(i,val){
									$(this).remove();
								});
							}else{
								$(vi2.dom).find('[starttime="'+id+'"]').remove();
							}	
							_this.savePopcorn(ttype);
						//});
					}); 
				var palette = $('<span></span>').addClass('icon-bar').append(edit_btn);//.append(delete_btn)	
				$(val).find('.icon-bar').each(function(i,val){ $(this).remove(); });
				$(val).append(palette);
			
				var form = '';
				switch(ttype){
					case 'assessment':
						form = _this.observer.widget_list[ttype].assessmentEditForm(JSON.parse(String($('#vi2').find('[starttime="'+id+'"]').text())), selector);
						break;
					case 'tags':
						form = $('<textarea></textarea>').attr('id', 'annotionContent').val(id.replace('--', ' '));
						break;
					case 'hightlight':
						form = $('<textarea></textarea>').attr('id', 'annotionContent').val(id.replace('--', ' '));
						break;		
					default:
						form = $('<textarea></textarea>').attr('id', 'annotionContent').val($('#vi2').find('[starttime="'+id+'"]').text());
				} 
					 	
				//				
				selector
					.html(form)
					.dialog({
						autoOpen: false,
						height: '200', 
						width: '300', 
						modal:true, 
						draggable: false,
						open : function(){ 
							//vi2.observer.player.pause();
						},
						buttons : {
							"save" : function(){  
								if(_this.saveDialog(ttype, id, form, id, this)){	// dialog, type, time, form, replace		
									$(this).dialog("close");	
								}
							},
							"delete" : function(){
								$('#vi2').find('[starttime="'+id+'"]').remove();
								//vi2.observer.log('deleteannotation:'+ttype +' '+id);
								
								_this.savePopcorn(ttype);					
								$(this).dialog("close");
							}
					},
					closeOnEscape: true,
					resizable: false,
					title: 'Define a Question',// + ' to ' + $(this).attr('title'),
					//position:['100',0], 
					colseText:'x',
					zIndex:200000						
				}); // end selector	
			}// end if		
		}); // end each
	},
	
	
		
 
  /** 
  * Call popcorn-maker by pressing an edit button 
  */
  addEdit_btn : function(){
  	var _this = this;
    var popcorn_url = this.server_url +'/static/js/popcorn-maker/index.html';
		var title = $('.entry-title').text();
		var dialog = $("#dialog");
		
    // call popcorn
    $('<a></a>')
			.text('edit')
			.addClass('edit-videolab')
			.button()
			.click(function(e){ 
				vi2.observer.log('[call:open_popcorn]');
				$("#dialog").empty();
				var frame = $('<iframe></iframe>')	
					.attr('src', popcorn_url)// + '?post_id=' + _this.post_id + '&title=' + title)
					.attr('height', '100%')
					.attr('width', '100%'); 
				dialog.append(frame).dialog({height: '650', width: '1000', modal:true, position:['100','40'], zIndex:200000 ,title: title});	
			})
		//.appendTo('.meta-desc');
	},
	
	
	/* ... */
	getWidgets : function(){
		
		return true;
	}
	

});// end class Vi-Lab


