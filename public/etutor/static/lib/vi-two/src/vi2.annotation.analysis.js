/* 
*	name: Vi2.Analysis
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 - delete btn
 - marker_type @ begin was not saved
 - design input fields
 - 
 
 - use data-attribute for storing 
 - drop-down for different types / option for enabled types
 - re-comment binding
 - editable / not editable
*/


Vi2.Analysis = $.inherit( Vi2.Annotation, /** @lends Analysis# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'assessmentanalysis',
		type : 'annotation',
		options : {
			selector : '.control-bar',
			hasTimelineMarker: true, 
			hasMenu : true,
			menuSelector: '#assessmentanalysis',
			displaySelector : '#overlay',
			hasMarker: true,
			hasMarkerSelect:true,
			selectData:['Cat A', 'Cat B', 'Cat C'],
			hasMarkerLabel:true,
			hasMarkerComment:true,
			hasMarkerDescription:true,
			allowEmoticons : true, 
			allowReplies : false,
			allowEditing : false,
			allowCreation : true, 
			timelineSelector : '.vi2-timeline-top',
			path:'/'
		},
		player : null,
		currentMarker : -1,

		/* ... */
		init : function(ann){ 
			if( ann === null ){
				ann = {};
			} 
			var _this = this;
			var events = [];
			$.each(ann, function(i, val){  

				if( val.type === _this.name ){  
				
 					events.push({
						name: val.title, 
						occ:[val.t1], 
						time :[val.t1], 
						x:val.x,
						y:val.y,
						date: val.date, 
						author: val.author,
						marker_type: val.marker_type,
						marker_label: val.marker_label,
						marker_select_option: val.marker_select_option, 
						marker_description: val.marker_description,
						id: val.id
					}); 
				}
			});
			
			// show analysis in a menu
			if( this.options.hasMenu ){
				this.createMenu(events);
			}
			
			// map events on the timeline
			if( this.options.hasTimelineMarker ){ 
				vi2.observer.player.timeline.addTimelineMarkers( 'analysis', events, this.options.timelineSelector );
			}
			
			if( this.options.allowCreation ){
				this.addMarker();
			}				
		},
		
		
		/*
		 **/
		addMarker : function(){
			$( this.options.selector + '> .vi2-analysis-controls' ).remove();
		
			// add button to player control bar
			var 
				_this = this,
				annotation_flag = false;
				; 
			var container = $('<div></div>')
				.append($('<div></div>')
					.text( 'A' )
					.addClass('vi2-analysis-label ')//glyphicon glyphicon-step-backward
				)
				.addClass('vi2-analysis-controls vi2-btn')
				.attr('title', 'add marker')
				.bind('click', {}, function(e){
					
					if( ! annotation_flag ){
						annotation_flag = true;
						vi2.observer.player.pause();
						var save = $('<a></a>')
							.text('speichern')
							.addClass('save-btn vi2-analysis-btn')
							.bind('click', {}, function(ee){ 
								var xx = ( $(this).parent().offset().left - $('video').offset().left ) / $('video').height() * 100;
								var yy = ( $(this).parent().offset().top - $('video').offset().top ) / $('video').width() * 100;
								
								var label = $(this).parent().find('.marker-text-label').val();
								annotation_flag = false; 
								// add new annotation to the DOM
								_this.addDOMElement( {
									"type": _this.name,
									"id": Math.ceil( Math.random() * 1000 ),
									"date": (new Date().getTime()),
									"author": vi2.wp_user,
									"y": yy,
									"x": xx,
									"starttime":  vi2.observer.player.currentTime(),
									"duration":"10",
									"marker_type":"marker-label-desc",
									"marker_label": label === undefined ? '?' : label,
									"marker_select_option":"cat a",
									"marker_description": $(this).parent().find('.marker-description').val(),
									"analysis": $(this).parent().find('.marker-analysis').val()
								});

								// fetch all data from DOM
								var data = [];
								
								$(vi2.dom).find("div[type='"+ _this.name +"']").each(function(i, val){
									var obj = {};
									obj.title = $(val).text();
									obj.target = $(val).attr('starttime') === undefined ? 0 : $(val).attr('starttime');
									obj.linktype = '';
									obj.x = $(val).attr('x');
									obj.y = $(val).attr('y');
									obj.t1 = $(val).attr('starttime') === undefined ? 0 : $(val).attr('starttime');
									obj.t2 = $(val).attr('duration') === undefined ? 1 : $(val).attr('duration');
									obj.marker = $(val).data('marker');
									obj.marker_type = $(val).attr('markertype');
									obj.marker_label = $(val).attr('markerlabel');
									obj.marker_description = $(val).attr('markerdescription');
									obj.marker_select_option = $(val).attr('markerselectoption');
									obj.id = $(val).attr('id');
									data.push( obj );
								});

								// store DOM data at the server / db 
						 		$.post('/videos/annotate', {"data":data, annotationtype: _this.name, videoid: vi2.videoData._id}, function( res ){ 
						 			console.log('saved '+ _this.name );
						 			//socket.emit('video.updated', { videoid: _this.videoData._id });
						 			// refresh annotations
						 			vi2.observer.setAnnotations();
									// continue playback
									
									vi2.observer.player.play();
								});
								
							});
							var remove = $('<span></span>')
							.addClass('remove-btn vi2-analysis-btn glyphicon glyphicon-close')
							.click(function(e){
								annotation_flag = false;
								$(newMarker).hide();
								vi2.observer.player.play();
							});
							var fill = '<span class="analysis-marker-annotate-fill"></span>';
							var label = '<input type="text" value="'+ '<label>' +'" class="marker-text-label marker-element" title="Label the marker" />';
							var description = [
								'<textarea class="marker-element" title="Describe what you have marked and why">',
								'<description>',
								'</textarea>'
								].join(',');
							
							
						var newMarker = $('<a></a>')
							.addClass('analysis-marker-annotate')
							.draggable({ containment: "parent" })
							.resizable({
								containment: "parent",
								maxHeight: 800,
								maxWidth: 800,
								minHeight: 50,
								minWidth: 50
							})
							.append( fill )
							.append( label )
							.append( description )
							.append( save )
							.append( remove )
							.appendTo( _this.options.displaySelector )
							.css({left: '50%', top: '50%', position:'absolute'})
							//.bind('click', function(){})
							;
						}	
				})
				.prependTo( this.options.selector );	
		}, 	
		
		
		/*
		* xxx: needs to be replaced by a 
		**/
		createMenu : function(analysisData){
			var _this = this;
			var tmp_t = -1;

			var analysis = $('<ul></ul>').addClass('analysis-list');
			$( '#assessmentanalysis' ).html( analysis );
			
			analysisData = analysisData.sort(function(a, b) {
  			return Number(a.time) > Number(b.time) ? 1 : -1;
			});
			moment.locale('de');
			$.each( analysisData, function(i, val){   
				//alert(val)
				var a = $('<a></a>')
					.text(val.marker_label+'') 
					.addClass('id-'+ val.time+' analysis-menu-question' )
					//.attr('href', '#'+vi2.options.id)
					.click(function(){  
						vi2.observer.log({ context:'analysis',action:'menu-click',values: [val.name, val.author, val.time[0] ]} );
						_this.player.currentTime( val.time[0] );
					})
					;	
					
				if( _this.options.allowEmoticons ){
					//a.emoticonize({ /* delay: 800, animate: false, exclude: 'pre, code, .no-emoticons' */ });
				}	
				
				
				var user = vi2.db.getUserById( val.author );	
				
				var header = $('<span></span>')
					.addClass('analysis-header');
				
				user.firstname = user.firstname !== undefined ? user.firstname : 'user ';	
				user.name = user.name !== undefined ? user.name : '';
				$('<span></span>')
					.text( user.firstname +' '+ user.name +' ' )
					.text( user.username )
					.addClass('analysis-user')
					.appendTo( header )
					; 
				header.append('  _' + moment(Number(val.date), "x").fromNow() );	
				
				var li = $('<li></li>')
					.addClass('list-item')
					.addClass('t'+val.time)
					.attr('author', val.author)
					.attr('date', 'd'+val.date)
					.attr('id', 't'+_this.formatTime(val.time, '-'))
					.html( header )
					.append(a)
					.appendTo(analysis)
					;

				if( Number(val.time) === Number(tmp_t) ){ 
					li.css({ 'margin-left':'15px' }); 
					// re-comments could be sorted desc by date. Solution needed
					//comments.find('.t'+val.time).tsort({ attr:"date", order:'asc'}); 
				}	

				// edit
				/*if( _this.options.allowEditing && Number(val.author) === Number(vi2.wp_user) ){	 
					var edit_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-pencil' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'analysis')
						.data('annotationdata', { 
							content: val.name, 
							time: val.time, 
							date: val.date,
							author: val.author 
						} )
						.appendTo( header )
						;
				}		
				// re-analysis
				if( _this.options.allowReplies ){		
					var reply_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-arrow-right' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'analysis')
						.data('annotationdata', { content: '', time: val.time, date: (new Date().getTime()) } )
						.appendTo( header )
						;		
					}	
				*/	
				tmp_t = val.time;		
			}); // end each
		},
			
			
		/*
		 * appends all annotations to the DOM model, e.g.
		 * <div id="1" type="analysis" starttime="235.09" duration="10" author="8" x="50" y="20" date="1445946251191" marker_type="marker-label" marker_label="This is a label." marker_select_option="" marker_description="">some text</div>
		 **/
		appendToDOM : function(id){ 
			var _this = this; 
			$(vi2.dom).find('[type="'+ _this.name +'"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getAnalysisById(id), function( i, val ){ 
				var comm = $('<div></div>')
					.attr('type', _this.name)
					.attr('starttime', val.t1)
					.attr('duration', 10)
					.attr('author', val.author)
					.attr('x', val.x)
					.attr('y', val.y)
					.attr('date', val.date)
					.attr('markertype', val.marker_type)
					.attr('markerlabel', val.marker_label)
					.attr('markerselectoption', val.marker_select_option) 
					.attr('markerdescription', val.marker_description)
					.attr('id', val.id)
					.text( decodeURIComponent(val.analysis))
					.appendTo( vi2.dom )
					
					;  
			});
		},		
		
		
		/*
		**/
		updateDOMElement : function( obj ){ //alert('called updazte dom')
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]')
				.attr('author', vi2.wp_user )
				.attr('date', obj.date)  // its the creation date
				.attr('starttime', obj.starttime )
				.text( obj.content ); 
		},	
		
		
		/*
		 * { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
		 **/
		addDOMElement : function( obj ){
			$('<div></div>')
				.attr('id', obj.id)
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('x', obj.x)
				.attr('y', obj.y)
				.attr('starttime', obj.starttime)
				.attr('duration', obj.duration)
				.attr('markertype', obj.marker_type)
				.attr('markerlabel', obj.marker_label)
				.attr('markerselect_option', obj.marker_select_option)
				.attr('markerdescription', obj.marker_description)
				.data('marker', obj)
				.text( obj.markerlabel )
				.appendTo( vi2.dom );
		},			
		
				
		/*
		 *
		 **/
		begin : function(e, id, obj){ 
			if( this.currentMarker !== id ){
				this.currentMarker = id;
				var _this = this;
				var ltype = $('<span></span>')
					.addClass('analysis-marker-wraper input-group-btn marker-id-' + id );

				$( this.options.displaySelector ).find( 'analysis-marker-wraper' ).each(function(i, val){ $(val).remove(); });
				var open = false;
				var o = $('<span></span>')
						//.text(' ' +( decodeURIComponent( obj.content.title ) ) )
						.attr('id', 'ov'+id)
						//.attr('href', '#' )
						.attr('title', ( obj.content.description ) )
						.addClass('ov-'+id+' analysis-marker')
						.bind('click', function(data){ alert(obj)
							if(open){
								$('.marker-element').remove();
								vi2.observer.player.play();
							}else{
									open = true; 
								// pause the video
								vi2.observer.player.pause();

								// reset elements
								$('.marker-element').remove();
													
								// marker + option select
								if( _this.options.hasMarkerSelect && ( obj.marker_type === 'marker-select' || obj.marker_type === 'marker-select-desc') ){ 
									/*var btn =$('<button></button>').html('Action <span class="caret"></span>')
										.attr('type',"button")
										.data('toggle',"dropdown") 
										.attr('aria-haspopup',"true")
										.attr('aria-expanded',"false")
										.addClass('btn btn-default dropdown-toggle')
										;
		      				var ul = $('<ul></ul>').addClass('dropdown-menu');
		        			for( var i=0; i < _this.options.selectData.length; i++){
										var opt = $('<li></li>')
											.html( _this.options.selectData[i] )
											//.attr('value', _this.options.selectData[i].toLowerCase() )
											;
										ul.append( opt );
									}
									$(this).parent().append( btn ).append( ul );
									*/
									var select = $('<select></select>')
										.addClass('marker-element')
										.attr('title','Select a category')
										;
									for( var i=0; i < _this.options.selectData.length; i++){
										var opt = $('<option></option>')
											.html( _this.options.selectData[i] )
											.attr('value', _this.options.selectData[i].toLowerCase() )
											;
										select.append( opt );
									}
									$(this).parent().append( select );
								
								
								}	
						
								// marker + label
								if( _this.options.hasMarkerLabel && ( obj.marker_type === 'marker-label' || obj.marker_type === 'marker-label-desc') ){ 
									var input = $('<input />')
										.attr('type','text')
										.attr('title','Label the marker')
										.val( obj.marker_label )
										.addClass('marker-text-label marker-element');
									$(this).parent().append( input );
								}
							// marker + text
								if( _this.options.hasMarkerDescription && ( obj.marker_type === 'marker-desc' || obj.marker_type === 'marker-label-desc' || obj.marker_type === 'marker-select-desc') ){ 
									var text = $('<textarea></textarea>')
										.attr('title','Describe what you have marked and why')
										.text( obj.marker_description )
										.addClass('marker-element');//.attr('type','text');
									$(this).parent().append( text );
								}
							}						
							// remove link ancshor after click 
							//$(this).remove();
						});
					
					
						$(ltype)
							.html(o)
							.appendTo( this.options.displaySelector )
							.css({left: obj.displayPosition.x+'%', top: obj.displayPosition.y+'%', position:'absolute'})
							//.effect( "highlight", 500 ) // could be improved
							; 
				 
				// xxx does it work?
				// reset highlight
				$(this.options.menuSelector+' li').each(function(i, val){ 
					$(this).removeClass('vi2-highlight'); 
				});
				// highlight analysis entry
				$(this.options.menuSelector+' li.t' + obj.displayPosition.t1 ).addClass('vi2-highlight');
			}
		},
		
		/*
		 **/
		end:function(e, id){ //alert(id)
			$('.marker-id-'+id).hide();
			// xxx does it work?
			//$(this.options.menuSelector+' li ').removeClass('vi2-highlight');
		},
			
			
		/*
		*
		**/
		createAnnotationForm : function( data ){ 
			/*jshint multistr: true */
			var str = "\
			<textarea name='analysis-entry' data-datatype='string' placeholder='' aria-describedby='analysis-form1'><%= content %></textarea>\
			<br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='analysis-form1'>Zeitpunkt (s)</span>\
				<input type='text' class='form-control' value='<%= time %>' name='analysis-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='analysis-form1'>\
			</div>\
			";
			if( data ){
				return ejs.render(str, data);
			}	else{
				return ejs.render(str, { 
					content:'', 
					time: vi2.observer.player.currentTime() , 
					date: (new Date().getTime()), 
					author: vi2.wp_user
					});	
			}	
		},
		
		
		/*
		*
		**/
		getAnnotationFormData : function( selector ){
			var obj = {};
			obj.content = $( selector ).find('[name="analysis-entry"]').val();
			obj.time = $( selector ).find('[name="analysis-entry-time"]').attr('value');
			return obj;
		}
	
	
		
	}); // end class Analysis
