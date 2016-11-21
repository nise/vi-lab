/* 
* name: Vi2.Observer 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
* - bug: current_stream / video is wrong
* - complete interfaces for the player
*	- clear overlay-container and other at updateVideo()
*	- allow page back, offer bread crumb menu, ...
*	- RSS: http://code.google.com/apis/youtube/2.0/reference.html
**/
	
Vi2.Observer = $.inherit(/* @lends Observer# **/{
	
	/* 
	 *		@constructs
	 *		@params {object} options  
	 **/
	__constructor : function(options) {
		vi2.observer = this; 
		this.options = $.extend(this.options, options); 
		this.widget_list = {}; // Assoc Array is an Object // Object.size(this.widget_list)
		this.clock = new Vi2.Clock(this.options.clockInterval);
	},
	
	// defaults
	name : 'observer',
	options : {
		id: 'start', 
		embed: true, 
		selector: '#screen', 
		clockInterval: 500, 
		videoSelector: '#video1', 
		videoWidth:500, 
		videoHeight:375, 
		videoControlsSelector:'.video-controls', 
		markupType: 'wiki', 
		childtheme:''
	},
	pieList : $('<ul></ul>').attr('class', 'pieContextMenu').attr('id', 'menu'),
	player : undefined,
	clock : undefined,
	parseSelector : '',
	widget : undefined,
	widget_list : [],
	hooks : [],
	vid_arr : [],
	current_stream : 'start',
	seek : 0,
	parser : '',
	
	
	/*
	 *
	 **/
	setCurrentStream : function(stream, seek){  
		this.current_stream = stream;
		this.seek = seek; 
		
		// append video
	  var video = $('<div></div>')
				.attr('type',"video")
				.attr('starttime',0)
				.attr('duration',7)
				.attr('id', "myvideo")
				.text(vi2.db.getStreamById(stream).video)
				.appendTo('#vi2');	
		//this.annotationsToDOM();
		// restart the clock
		this.clock.stopClock();
		this.clock.reset(); 
		// generate and render metadata
		var metadata = new Vi2.Metadata();  
		// re-parse DOM
		this.parse(vi2.dom, 'html'); 
		
	},


	/*
	 *
	 **/
	parse : function(selector, markupType){ 
		this.parseSelector = selector;
		this.parser = new Parser(selector, markupType === null ? this.markupType : markupType);
		this.vid_arr = [];  
		this.vid_arr = this.parser.run(); 
		this.clock.stopClock(); 
		this.clock.reset();  
		this.player.loadSequence(this.vid_arr, 0, this.seek );  				
	},
	

	/*
	 * Initialize the video player and the bindings to it.
	 **/
	init : function(seek){   
		var _this = this; 
	
		this.player = new Video({
				embed: this.options.embed, 
				selector: this.options.videoSelector, 
				width:this.options.videoWidth, 
				height:this.options.videoHeight, 
				videoControlsSelector: this.options.videoControlsSelector, 
				theme:this.options.theme, 
				childtheme:this.options.childtheme,
				thumbnail: this.options.thumbnail, 
				seek: seek === undefined ? 0 : seek
			}, this); 
		
		// some event bindings hooks
		$(this).bind('player.ready', function(e, id, i){  
			_this.setAnnotations(); 
		});
	},
	
	
	/*
	 *
	 **/
	setAnnotations : function(){  
		var _this = this; 
		this.clock.annotations = [];			 
		this.vid_arr = this.parser.run(); 

		// add Annotations at the clock
		$.each(_this.vid_arr[0].annotation, function(i, val){ 		
			_this.clock.addAnnotation(val); 
		}); 

		// initializes widgets
		$.each(_this.widget_list, function(j, widget){ 
			if( widget.type !== 'player-widget' ){ 
				widget.init( _this.vid_arr[0].annotation );			
			}else{ 
				widget.init(); 
			}	
		});
	},
  		
	
	/* 
	 *
	 **/
	updateLocation : function(identifier, value){ 
		window.location.replace(window.location.href.split('#')[0] + '#!'+identifier+':'+value.replace(/\ /g, '_'));
	},
  		  		

	/* 
	 * Add a new widget to the observer by binding events to it. One a widget has been added it can become accessible in the player or video environment.
	 **/
	addWidget : function( obj ){ 
		var _this = this;   	
		obj.player = this.player; // xxx: no good style / tell the widget about the player 
		this.clock.addHook(obj.name, obj);	

		if( obj.type === 'annotation' ){
			// convert annotations into DOM elements that will be parsed later on.   
			obj.appendToDOM( this.current_stream );
			// bind time-depending events for begin and end of an annotation to the player
			$(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
			$(this.player).bind('annotation.end.'+obj.name, function(e, a, b){ obj.end(e, a, b);});
		}	

		// xxx: needs to be put into widgets
		switch(obj.name){
			case 'relatedVideos' :
				$(this.player).bind('video.end', function(e, a){ obj.showLinkSummary(); });
				break;  
			case 'log' :
				$(this.player).bind('log', function(e, msg){ obj.add(msg); });
				break;
		}
	
		// put widget to the list of registered / added widgets
		this.widget_list[obj.name] = obj;
		//   
		return true; 
	},
	
	
	/* 
		* Returns true or false whether the given string is the name of an registered widget or not. 
		**/
	isWidget : function(widget){
		return this.widget_list[widget] !== null;	
	},
	
	
	/* 
	 * Returns the widget object to the given name. 
	 **/
	getWidget : function(widget_name){
		return this.widget_list[widget_name];
	},
	
	
	/*
	 * Removes widget from widget_list
	 **/
	removeWidget : function(widget_name){
		// bugy?
		this.widget_list[widget_name] = 0;
	},
	
	
	/* 
	 * appends all annotation data of the widgets to DOM of the current HTML page
	 **/
	annotationsToDOM : function(){ 
		var _this = this; 
		$.each(this.widget_list, function(i, widget){ 
			if(widget.type === 'annotation'){  
				widget.appendToDOM( _this.current_stream ); 
			}
		});
	},
  		  		

	/*
	* xxx
	**/
	ended : function(){ 
		//this.clock.reset(); // if enabled slide sync does not work after vides has ended.
	},


	/*
	 *
	 **/
	pause : function(){ 
		this.clock.stopClock();
	},


	/*
	 *
	 **/
	play : function(){ 
		//this.clock.startClock();
	},


	/*
	 * Proxy function to trigger the logger
	 **/
	log : function(msg){
		$(this.player).trigger('log', [msg]);
	},


	/*
	 *
	 **/
	destroy : function(){
		$('video').stop();
		this.clock.reset();
		$('#vi2').empty();
	}
  		
});// end 
	
	
		
