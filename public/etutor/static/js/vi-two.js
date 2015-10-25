/* 
*	name: Vi2.Assessment
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- zeitliche trennung von frage und antwort
	- wiederholung der frage erlauben
	- ...
*/

Vi2.Assessment = $.inherit( Vi2.Annotation, /** @lends Vi2.Assessment# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters	
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'assessment',
		type : 'annotation',
		options : { 
			displaySelector: '#overlay',
			hasTimelineMarker: true,
		  timelineSelector : '.vi2-timeline-top', 
			hasMenu : true,
			menuSelector: '#assessment',
			allowComments : true,
			allowEditing : true,
			allowCreation : true, 
			path: '/static/img/user-icons/'
		 },

		/* ... */
		init : function(ann){  
			var _this = this;
			var events = []; 
			$.each(ann, function(i, val){  
				if(val.type === 'assessment' && val.title !== '' ){ 
					//var obj = JSON.parse( decodeURIComponent( val.title ) );  
					events.push({ 
						name: val.title,
						occ:[val.t1],
						time:[val.t1], 
						author: val.author, 
						date: val.date 
					}); 
				}
			}); 
			
			// show comments in a menu
			if( this.options.hasMenu ){
				this.createMenu(events);
			}
			
			// map events on the timeline
			if( this.options.hasTimelineMarker ){ 
				vi2.observer.player.timeline.addTimelineMarkers( 'assessment', events, this.options.timelineSelector );
			}		
					
		},
		
		
		/*
		**/
		createMenu : function( assessmentData ){
			var _this = this;
			$(this.options.menuSelector).empty();
			var assess = $('<ul></ul>')
				.addClass('assessment-list')
				.appendTo( this.options.menuSelector )
				;
			$.each( assessmentData, function(i, val){
				var user = vi2.db.getUserById(val.author);	
				
				var header = $('<span></span>')
					.addClass('assessment-header');
					
				$('<span></span>')
					//.text( user.firstname +' '+user.name )
					.text( user.username )
					.addClass('assessment-user')
					.appendTo( header )
					;  
				header.append(' ' + moment(Number(val.date), "x").fromNow() );	
				
				
				var userIcon = new Image();
				$(userIcon)
				//	.attr('src', _this.options.path+'icon.png')
					.addClass('assessment-user-icon');
				var a = $('<a></a>')
					//.append(userIcon)
					.append( val.name.question )
					.attr('author', val.author)
					//.attr('href', '#'+vi2.observer.options.id)
					.addClass('id-'+ val.time+' assessment-menu-question')
					.click(function(){
						vi2.observer.log({context:'assessment', action:'menu-click', values:[ val.name.question, val.author, val.time ]});
						vi2.observer.player.currentTime( val.time );
					});			
				
				var li = $('<li></li>')
					.attr('id', 't'+ val.time)
					.attr('author', val.author)
					.addClass('list-item')
					//.css('list-style-image',  "url('"+_this.options.path+"user-"+author+".png')")
					.html( header )
					.append( a )
					.appendTo( assess )
					;	
				
				// edit
				if( _this.options.allowEditing && Number(val.author) === Number(vi2.wp_user) ){	 
					var edit_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-pencil' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'assessment')
						.data('annotationdata', { 
							content: val.name, 
							time: val.time[0], 
							date: val.date,
							author: val.author 
						} )
						.appendTo( header )
						;
				}		
				
			});	
			// sort list entries by time and append them
			assess.find('li').tsort({attr:"id"}); 
			
		},							
		
		appendToDOM : function(id){ 
			var _this = this; 
			$(vi2.dom).find('[type="assessment"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getAssessmentById(id), function( i, val ){  
				var toc = $('<div></div>')
					.attr('type',"assessment")
					.attr('starttime', val.start)
					//.attr('data', val.start)
					.attr('duration', 10)
					.attr('author', val.author)
					.attr('date', val.date)
					.attr('id', "assessment-"+i)
					.data('task', val.title )
					.appendTo( vi2.dom )
					; 
			});
		},
		
			/*
		**/
		updateDOMElement : function( obj ){ 
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]') // .date
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.data('task', obj.content )
				;
		},
		
		
		/*
		* { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
		**/
		addDOMElement : function( obj ){ 
			$('<div></div>')
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.data('task', obj.content )
				.appendTo( vi2.dom )
				;
		},			
		
				
		/* ... */
		begin : function(e, id, obj){ 
			$('body').unbind('keydown'); 
			 
			var _this = this;
			var question_selector = 'vi2assessment'+id;
			vi2.observer.player.pause();
			vi2.observer.log({context:'assessment', action:'display-question',values:[encodeURIComponent(obj.content.title.question), obj.author, vi2.observer.player.currentTime() ]});
			//{"question":"bimel","answ":[{"id":"answ0","answ":"hier"},{"id":"answ1","answ":"we"},{"id":"answ2","answ":"go"}],"correct":"answ2"}
			var o = $('<div></div>')
				.attr('id', 'vi2assessment')
				.addClass(question_selector)
				.html('')
				.show();
				
			var head = $('<h3></h3>')
				.text('Testfrage');
			var quest = $('<div></div>')
				.addClass('assessment-question')
				.text(''+obj.content.title.question);	
			var answ = $('<div></div>')
				.addClass('assessment-answers');
			
			
			if( obj.content.title.answ.length > 0 ){
				
				if(obj.content.title.answ.length === 1 && obj.content.title.answ[0].questiontype === 'fi'){
					// fill in answers box 
					var answer = $('<div></div>')
						.attr('id', 'answ0')
						.addClass('assessment-answer')
						.append('<textarea name="quest"></textarea>')
						.append('<br/>')
						.appendTo(answ);
				}else{ 
					// mc answer options
					$.each(obj.content.title.answ, function(i, val){
						var answer = $('<div></div>')
							.attr('id', val.id)
							.addClass('assessment-answer')
							.append( $('<input type="checkbox" name="quest" value="1" />').attr('id', val.id))
							.append(val.answ)
							.click(function(){ 
								$(this).find('input[type="checkbox"]').trigger('click'); 
							})	
							.append('<br/>')
							.appendTo(answ);
							
					});
				}
			}		
			
			var solve = $('<button></button>')
				.addClass('btn btn-default assessment-btn')
				.text('abschicken')
				.click(function(){
					$(this).hide();					
					_this.evaluateAnswer('.'+question_selector, obj.content.title, obj.author);
				});
				
			$(o).append(head).append(quest).append(answ).append(solve); 
			$(this.options.displaySelector).append(o);
	
			/*
			if(this.currImgId === obj.content.target){
				return false;
			}else{
				// reset highlight
				$(this.options.selector+' li').each(function(i){ $(this).removeClass('highcomment');})
				// highlight comment entry
				$(this.options.selector+' li#t'+this.formatTime(obj.content.target)).addClass('highcomment');
			}
			*/
		},
	
		/* ... */
		end : function(e, id){ 
			$('.vi2assessment'+id).remove();
		},
		
		
		/* 
		* This function gets called in order to fill a user dialog with a form in order to define assessment task (multiple choice and fill-in text. 
		* * {"content":{"question":"Eine Frage","answ":[{"id":"answ78","answ":"Antwort a","questiontype":"mc"},{"id":"answ32","answ":"Antwort b","questiontype":"mc"},{"id":"answ43","answ":"Antwort c","questiontype":"mc"}],"correct":["answ43"]},"time":["300"],"date":"1386505607283"}
  	**/
		createAnnotationForm : function(json){ 
			
			if( json.content === '' ){ // form with existing data
				json = {
					time: vi2.observer.player.currentTime(),
					date: (new Date().getTime()),
					author : vi2.wp_user,
					content: {
						question:'', 
						answ:[], 
						correct:[], 
						time: vi2.observer.player.currentTime(), 
						date: (new Date().getTime())
					}	
				}; 
			}
			
			var question = $('<textarea></textarea>')
				.attr('id', 'annotationQuestion')
				.val(json.content.question);
			var answer_box = $('<div></div>').attr('id','answerbox');
		
				var ii = 0;
				var add = $('<div></div>')
					.append( $('<span></span>').addClass('glyphicon glyphicon-plus ') ) // glyphicon glyphicon-list
					.addClass('mc-question add-btn')
					.append(' Multiple-Choice-Antwort hinzufügen')
					.click(function(){
						var rm = $('<span></span>')
							.addClass('close-btn glyphicon glyphicon-remove-circle')
							.attr('title', 'Antwortoption entfernen')
							.click(function(){ 
								$(this).parent().remove();
								if($('.answer').length === 0){
									$('.fi-question').show();
									$('.mc-question').show();
								}else{
									$('.fi-question').show();
									$('.mc-question').show();
								}	
							})
							;
						$('.fi-question').hide();	
						var idd = 'answ'+Math.ceil(Math.random()*100);
						var answ = $('<div></div>')
							.attr('id', idd)
							.addClass('answer')
							.append('<input id="'+idd+'" type="checkbox" title="Setze ein Häckchen für richtige Lösungen" name="quest" value="1" />')
							.append('<input id="'+idd+'" type="text" class="mc-option" value=""/>')
							.append(rm)
							.append('<br/>');
						ii++;
						answer_box.append(answ);
					});
			
				// fill in questions
				var add2 = $('<div></div>')
					.append( $('<span></span>').addClass('glyphicon glyphicon-align-left') ) // glyphicon glyphicon-list
					.addClass('fi-question  add-btn')
					.append(' Freitext-Antwort hinzufügen')
					.click(function(){
						var rm = $('<span></span>')
							.addClass('close-btn glyphicon glyphicon-remove-circle')
							.attr('title', 'Lösung entfernen')
							.click(function(){ 
								$(this).parent().remove();
								if($('.answer').length === 0){
									$('.fi-question').show();
									$('.mc-question').show();
								}else{
									$('.fi-question').hide();
									$('.mc-question').hide();
								}	
							})
							;
						$('.mc-question').hide();
						$('.fi-question').hide();
						var answ = $('<div></div>')
							.attr('id', 'answ'+Math.ceil(Math.random()*100))
							.addClass('answer fi-answer')
							.append($('<label></label>').text('Lösung:'))
							.append('<textarea></textarea>')
							.append(rm)
							.append('<br/>');
						ii++;
						answer_box.append(answ);
					});	
		
		
		
			// handle existing answers
			if( json.content.answ.length > 0 ){
				if(json.content.answ[0].questiontype === 'mc'){
					// add existing answers
					$.each(json.content.answ, function(i, val){ 
						var rm = $('<span></span>')
							.addClass('close-btn glyphicon glyphicon-remove-circle')
							.attr('title', 'Antwortoption entfernen')
							.click(function(){ 
								$(this).parent().remove(); 
								if($('.answer').length === 0){
									$('.fi-question').show();
									$('.mc-question').show();
								}else{
									$('.fi-question').hide();
									$('.mc-question').hide();
								}
							});
						var checkbox = $('<input type="checkbox" title="Setze ein Häckchen für richtige Lösungen" name="quest" value="1" />')
							.attr('id', val.id);
							
						if( json.content.correct.indexOf( val.id ) !== -1 ){
//							checkbox.attr('checked', 'checked');
							checkbox.attr('checked', true);
						}	
						var answ = $('<div></div>')
							.attr('id', val.id)
							.addClass('answer')
							.append(checkbox)
							.append($('<input type="text" class="mc-option" />')
								.attr('id', val.id)
								.val(val.answ)
							)
							.append(rm)
							.append('<br/>')
							.appendTo(answer_box)
							;
					}); 
				}else if(json.content.answ[0].questiontype === 'fi'){ 
					var rm = $('<span></span>')
						.addClass('close-btn glyphicon glyphicon-remove-circle')
						.attr('title', 'Lösung entfernen')
						.click(function(){ 
							$(this).parent().remove();
							if($('.answer').length === 0){
								$('.fi-question').show();
								$('.mc-question').show();
							}else{
								$('.fi-question').hide();
								$('.mc-question').hide();
							}
						})
						;
					var answ = $('<div></div>')
							.attr('id', 'answ'+Math.ceil(Math.random()*100))
							.addClass('answer fi-answer')
							.append($('<label></label>').text('Lösung:'))
							.append($('<textarea></textarea>').val(json.content.answ[0].answ))
							.append(rm)
							.append('<br/>')
							.appendTo(answer_box)
							;	 
				}
			}
			/*jshint multistr: true */
			var time_field = "\
				<div class='input-group'>\
					<span class='input-group-addon' id='hyperlinks-form3'>Zeitpunkt (s)</span>\
					<input type='text' class='form-control' value='" + json.time + "' name='assessment-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='hyperlinks-form3'>\
				</div>";
		
			var form =  $('<div></div>')
			.addClass('questionanswers')
			.append($('<label></label>').text('Frage:'))
			.append(question)
			.append(answer_box)
			.append(add)
			.append(add2)
			.append( time_field )
			;
			
			if( json.content.answ !== undefined){
				if( json.content.answ[0] !== undefined  && json.content.answ[0].questiontype === 'mc'){
					add2.hide();
				}
			
				if( json.content.answ[0] !== undefined  && json.content.answ[0].questiontype === 'fi'){
					add.hide();
					add2.hide();
				}
			}	
			return form;
			
		},
		
		
		
		/*
		* todo: 
		*  - check data types: string, number, decimal-time, ... from .data('datatype', 'decimal-time')
		*  - change messages
		**/
		validateAnnotationForm : function(selector, type){ 
			var textarea_flag = 0, textinput_flag = 0, msg = '', sum_checked = 0, sum_checkbox = 0;
			
			
			// validate textareas
			$(selector).find('#annotationQuestion').each(function(i,val){
				if(String($(val).val()).length < 2){
					$(val).addClass( 'validation-conflict' );
					textarea_flag = true;
				}else{
					$(val).removeClass( 'validation-conflict' );
				}
			});
			if(textarea_flag){
				msg += "<br> Definieren Sie bitte einen Text für diese Frage.";
			}
			
			if( $('#answerbox').find('div').length === 0 ) {
				msg += '<br> Bitte definieren Sie für diese Frage entsprechende Antwortoptionen oder Lösungen.';
			}else{
				// if its a fill-in task
				$('#answerbox').find('textarea').each(function(i,val){
					if(String($(val).val()).length < 2){
						$(val).addClass( 'validation-conflict' );
						textarea_flag = true;
					}else{
						$(val).removeClass( 'validation-conflict' );
					}
				});
				if(textarea_flag){
					msg += "<br> Definieren Sie bitte die Lösung zu der Frage.";
				}
				
				//alert($('#answerbox').find('input[type=text]').length)
				// validate input fields
				$('#answerbox').find('input[type=text]').each(function(i,val){
					if($(val).val() === ''){
						$(val).addClass( 'validation-conflict' );
						textinput_flag = true;
					}else{
						$(val).removeClass( 'validation-conflict' );
					}
				});
				if(textinput_flag){
					msg += "<br> Versehen Sie bitte jede Antwortoption mit einem Text.";
				}
		
				// validate checkboxes
				if($('#answerbox').find('input[type=checkbox]').length > 0 && $('#answerbox').find('input:checked').length === 0){ 
					$('#answerbox').find('input[type=checkbox]').addClass( 'validation-conflict' );
					msg += "<br> Mindestens eine Antwortoption sollte als richtig markiert werden.";
				}else{
					$('#answerbox').find('input[type=checkbox]').removeClass( 'validation-conflict' );
				}
			}
			
			// final output of validation messages
			if(String(msg).length === 0){ 
				return msg; 
			}else{ 
				console.log('Validation Error:' + msg); 
				return msg;
			}
		},
		
		
		/*
		* example: {"content":{"question":"Eine Frage","answ":[{"id":"answ78","answ":"Antwort a","questiontype":"mc"},{"id":"answ32","answ":"Antwort b","questiontype":"mc"},{"id":"answ43","answ":"Antwort c","questiontype":"mc"}],"correct":["answ43"]},"time":["300"],"date":"1386505607283"}
		**/
		getAnnotationFormData : function( selector ){
			var obj = {
				time : $( selector ).find('[name="assessment-entry-time"]').val(),
				content : {
					question : $('#annotationQuestion').val(),
					time : $('#annotationTime').attr('value'),
					date : String( new Date().getTime() ),
					answ : [],
					correct : []
				}	
			};
			// get fill-in solution
			$('#answerbox').find('textarea').each(function(i,val){
					obj.content.answ[i] = { id: $(val).attr('id'), answ: $(val).val(), questiontype:"fi" };
			});
			
			// get multiple choice answer options
			$('#answerbox').find('input[type=text]').each(function(i,val){ 
					obj.content.answ[i] = { id: $(val).attr('id'), answ: $(val).val(), questiontype:"mc" };	
			});
			
			
			// find correct answers
			$('#answerbox').find(':checked').each(function(i, val){ 
					obj.content.correct.push( $(val).attr('id') );
			});
			return obj;
			/*
			{	"content": {
					"question":"Eine Frage",
					"answ": [
						{"id":"answ78","answ":"Antwort a","questiontype":"mc"}
					],
					"correct":["answ43"]},
					"time":["300"],
					"date":"1386505607283"
				}
			*/
			//return obj;
		},
		
		
		
		
		
		
		/*
		* Evaluates the quizz results provided by the user. 
		**/
		evaluateAnswer : function(question_selector, obj, author){
			var one_checked = false, correct = [];
			if(obj.answ[0].questiontype === 'fi'){
				if($('.assessment-answers').find('textarea').val().length > 3){
					correct.push(true);
					vi2.observer.log({context:'assessment', action:'submited-answer',values:[encodeURIComponent(obj.question), author, vi2.observer.player.currentTime(), encodeURIComponent($('.assessment-answers').find('textarea').val()) ]});
					$(question_selector)
						.append($('<p><strong>Vielen Dank für die Bearbeitung der Frage. Folgende Musterlösung wurde für diese Frage hinterlegt:</strong></p>'))
						.addClass('assessment-msg-correct');
					$('<span></span>')
						.text( obj.answ[0].answ )
						.addClass('correct-answ')
						.appendTo(question_selector)
						;
				}		
			}else{ 
				
				obj.checked = [];
				$('.assessment-msg-warning').hide();
				$('div.assessment-answers').find("input[type='checkbox']:checked").each(function(i, val){ 
					
					obj.checked.push( $(val).attr('id') );
					one_checked = true;
					if( obj.correct.indexOf( $(val).attr('id') ) > -1 ){
						correct.push(true); 
					}else{
						correct.push(false); 
					}
				});
			
				// check whether a option has been selected
				if( ! one_checked ){
					//vi2.observer.log('[call:run_assessment, result:empty_selection]'); 
					$(question_selector)
						.append($('<p>Bitte wählen Sie eine Antwortoption</p>')
						.addClass('assessment-msg-warning'));
					$('.assessment-btn').show();
					return false;
				}
			
				
				// log event
				vi2.observer.log({context:'assessment', action:'submited-answer',values:[ encodeURIComponent(obj.question), author, vi2.observer.player.currentTime(), (obj.checked).toString() ]});
				
				// give feedback to the user
				if( correct.indexOf(false) === -1){
					vi2.observer.log({context:'assessment', action:'submited-correct-result',values:[encodeURIComponent(obj.question), author, vi2.observer.player.currentTime() ]});
					$(question_selector).append($('<p>Ihre Antwort ist richtig.</p>').addClass('assessment-msg-correct'));
				}else{ // wrong
					vi2.observer.log({context:'assessment', action:'submited-incorrect-result',values:[encodeURIComponent(obj.question), author, vi2.observer.player.currentTime() ]});
					$(question_selector).append($('<p>Ihre Antwort ist leider falsch.</p>').addClass('assessment-msg-wrong'));
				}
			}
			// save result to node
			obj.type = obj.answ[0].questiontype;
			
			var question_result = {
		  	from : vi2.wp_user, // the user that answered the question
		  	//to : obj.author, // the author of the question // bug xxx
		  	date : (new Date()).getTime(),
		  	type : 'test-result',
		  	read : false, 
		  	replied: false,
		  	title : 'Result: '+encodeURIComponent(obj.question),
		  	content : {
					correct: correct,
					question : encodeURIComponent(obj.question),
					answ : obj.answ,
					res : obj.type === 'mc' ? encodeURIComponent(obj.checked) : encodeURIComponent($('.assessment-answers').find('textarea').val()),
					videoid : vi2.currentVideo
				} 
    	};
			/*
			$.post('/messages', {"data":question_result}, function(res){ 
        //alert('Has been saved: '+ JSON.stringify(res)); 
    	});
    	*/
		
			// proceed	
			$(question_selector).append($('<button></button>')
				.addClass('btn btn-default')
				.text('Video fortsetzen')
				.click(function(){
					$(question_selector).remove();
					vi2.observer.log({context:'assessment', action:'continue-playback',values:[encodeURIComponent(obj.question), author, vi2.observer.player.currentTime() ]});
					vi2.observer.player.play();
					$('body').unbind('keydown').bind('keydown', function(e) { 
						vi2.observer.player.keyboardCommandHandler(e); 
					});
				})
			);	
		}
		
	
		
	}); // end class Comments
/* 
*	name: Vi2.Comments
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- re-comments could be sorted desc by date. Solution needed
	- threaded comments
 	- highlight while playing
*/


Vi2.Comments = $.inherit( Vi2.Annotation, /** @lends Comments# */{

		/** 
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  			this.options = $.extend(this.options, options); 
		},
		
		name : 'comments',
		type : 'annotation',
		options : {
			hasTimelineMarker: true, 
			hasMenu : true,
			menuSelector: '#comments',
			allowEmoticons : true, 
			allowReplies : true,
			allowEditing : true,
			allowCreation : true, 
			timelineSelector : '.vi2-timeline-buttom',
			path:'/'
		},
		player : null,

		/* ... */
		init : function(ann){ 
			var _this = this;
			var events = [];
			$.each(ann, function(i, val){ 
				if( val.type === _this.name ){  
					events.push({
						name: val.title, 
						occ:[val.t1], 
						time :[val.t1], 
						date: val.date, 
						author: val.author 
					}); 
				}
			});
			
			// show comments in a menu
			if( this.options.hasMenu ){
				this.createMenu(events);
			}
			
			// map events on the timeline
			if( this.options.hasTimelineMarker ){ 
				vi2.observer.player.timeline.addTimelineMarkers( 'comments', events, this.options.timelineSelector );
			}				
		},	
		
		
		/*
		*
		**/
		createMenu : function(commentData){
			var _this = this;
			var tmp_t = -1;
			
			var comments = $('<ul></ul>')
				.addClass('comments-list');
			$( this.options.menuSelector ).html( comments );
			
			commentData = commentData.sort(function(a, b) {
  			return Number(a.time) > Number(b.time) ? 1 : -1;
			});
			moment.locale('de');
			$.each( commentData, function(i, val){   
			
				var a = $('<a></a>')
					.text(val.name)
					.addClass('id-'+ val.time+' comments-menu-question' )
					//.attr('href', '#'+vi2.options.id)
					.click(function(){  
						vi2.observer.log({ context:'comments',action:'menu-click',values: [val.name, val.author, val.time[0] ]} );
						_this.player.currentTime( val.time[0] );
					})
					;	
					
				if( _this.options.allowEmoticons ){
					a.emoticonize({ /* delay: 800, animate: false, exclude: 'pre, code, .no-emoticons' */ });
				}	
				
				
				var user = vi2.db.getUserById( val.author );	
				
				var header = $('<span></span>')
					.addClass('comments-header');
					
				$('<span></span>')
					//.text( user.firstname +' '+user.name )
					.text( user.username )
					.addClass('comments-user')
					.appendTo( header )
					; 
				header.append(' ' + moment(Number(val.date), "x").fromNow() );	
				
				var li = $('<li></li>')
					.addClass('list-item')
					.addClass('t'+val.time)
					.attr('author', val.author)
					.attr('date', 'd'+val.date)
					.attr('id', 't'+_this.formatTime(val.time, '-'))
					.html( header )
					.append(a)
					.appendTo(comments)
					;

				if( Number(val.time) === Number(tmp_t) ){ 
					li.css({ 'margin-left':'15px' }); 
					// re-comments could be sorted desc by date. Solution needed
					//comments.find('.t'+val.time).tsort({ attr:"date", order:'asc'}); 
				}	

				// edit
				if( _this.options.allowEditing && Number(val.author) === Number(vi2.wp_user) ){	 
					var edit_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-pencil' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'comments')
						.data('annotationdata', { 
							content: val.name, 
							time: val.time, 
							date: val.date,
							author: val.author 
						} )
						.appendTo( header )
						;
				}		
				// re-comments
				if( _this.options.allowReplies ){		
					var reply_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-arrow-right' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'comments')
						.data('annotationdata', { content: '', time: val.time, date: (new Date().getTime()) } )
						.appendTo( header )
						;		
					}	
					
				tmp_t = val.time;		
			}); // end each
		},
		
		/* -- */
		//<div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		//
		appendToDOM : function(id){ 
			var _this = this;
			$(vi2.dom).find('[type="comments"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getCommentsById(id), function( i, val ){ 
				var comm = $('<div></div>')
					.attr('type',"comments")
					.attr('starttime', val.start)
					.attr('duration', 10)
					.attr('author', val.author)
					.attr('date', val.date)
					.text( decodeURIComponent(val.comment))
					.appendTo( vi2.dom )
					;  
			});
		},		
		
		
		/*
		**/
		updateDOMElement : function( obj ){
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]')
				.attr('author', vi2.wp_user )
				.attr('date', obj.date)  // its the creation date
				.attr('starttime', obj.time )
				.text( obj.content ); 
		},	
		
		/*
		* { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
		**/
		addDOMElement : function( obj ){
			$('<div></div>')
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.text( obj.content )
				.appendTo( vi2.dom );
		},			
				
		/* ... */
		begin : function(e, id, obj){ 

			if(this.currImgId == obj.content.target){
				return false;
			}else{
				// reset highlight
				$(this.options.menuSelector+' li').each(function(i, val){ 
					$(this).removeClass('highcomment'); 
				});
				// highlight comment entry
				$(this.options.menuSelector+' li#t' + obj.displayPosition.t1 ).addClass('highcomments');
			}
		},
		
		
		/*
		*
		**/
		createAnnotationForm : function( data ){ 
			/*jshint multistr: true */
			var str = "\
			<textarea name='comments-entry' data-datatype='string' placeholder='' aria-describedby='comments-form1'><%= content %></textarea>\
			<br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='comments-form1'>Zeitpunkt (s)</span>\
				<input type='text' class='form-control' value='<%= time %>' name='comments-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='comments-form1'>\
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
			obj.content = $( selector ).find('[name="comments-entry"]').val();
			obj.time = $( selector ).find('[name="comments-entry-time"]').attr('value');
			return obj;
		}
	
	
		
	}); // end class Comments
/* 
*	name: Vi2.Hyperlinks
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*  - ejs.js
*	todo:
	- include editor from vi-wiki 
	- nice defaults: var defaults = {animLen: 350}; 
	- apply minimum link duration
	- delay removeOverlay on mouseover/shift-press etc.
	
	*/


	/* class Hyperlinks **/ 
	Vi2.Hyperlinks = $.inherit( Vi2.Annotation,/** @lends Hyperlinks# */{

		/** @constructs
		*		@extends Annotation
		*		@param {object} options An object containing the parameters
    *		
    *		@param {string} options.displaySelector An optional setting.
		*/
  	__constructor : function(options) { 
  		this.options = $.extend(this.options, options); 
		},
				
		name : 'hyperlinks',
		type : 'annotation',
		
		options : {
			displaySelector: '#seq',
 			hasTimelineMarker: true,
 			timelineSelector : '.vi2-timeline-top', 
			hasMenu : true,
			menuSelector: '#hyperlinks',
			minDuration: 5, // seconds
			allowEditing : true,
			allowCreation : true, 
			path: '/static/img/user-icons/'
		},
		player : null,
		link_list : {},
		currLinkId :-1,

		/* ... */
		init : function(ann){
			this.clear();
			var events = [];
			$.each(ann, function(i, val){ 
				if( val.linktype === 'cycle' || val.linktype === 'standard' ){ // former also  val.linktype == 'standard' ||
				events.push({ 
						name: val.title, 
						occ:[val.t1], 
						target: val.target,
						description: decodeURIComponent( val.description ), 
						time :[val.t1],
						duration: val.t2, 
						x:val.x,
						y:val.y,
						date: val.date, 
						author: val.author 
				});
				}
			}); //{"occ":["1690"],"target":"#!moss","time":["1690"],"date":"1416312331209","author":"admin"}
			
			// show comments in a menu
			if( this.options.hasMenu ){
				this.createMenu(events);
			}
			
			// map events on the timeline
			if( this.options.hasTimelineMarker ){ 
				vi2.observer.player.timeline.addTimelineMarkers( 'hyperlinks', events, this.options.timelineSelector );
			}		
		},		
		
		/* 
		* Translated database entry of link into a dom element that the parser will read later on 
		**/
		appendToDOM : function(id){
			var _this = this;
			$(vi2.dom).find('[type="hyperlinks"]').each(function(i,val){ $(this).remove(); });
			$(vi2.dom).find('[type="cycle"]').each(function(i,val){ $(this).remove(); });
			 
			$.each(	vi2.db.getLinksById(id), function(i, val){  
				var links = $('<div></div>')
				.attr('type', val.type) // former default: "xlink"
				.attr('starttime', val.starttime)//vi2.utils.deci2seconds(this.start))
				.attr('duration', val.duration)
				.attr('posx', val.x)
				.attr('posy', val.y)
				.attr('seek', vi2.utils.deci2seconds(this.seek))
				.attr('duration2', vi2.utils.deci2seconds(this.duration2))
				.attr('target', val.target)
				.attr('description', encodeURIComponent( val.description) )
				.attr('author', val.author)
				.attr('date', val.date)
				.text( val.title )
				.appendTo( vi2.dom )
				;
			});
			
		},	
		
		/*
		**/
		updateDOMElement : function( obj ){  
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]')
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.attr('description', encodeURIComponent( obj.content.description ) )
				.attr('duration', obj.content.duration === undefined ? '10' : obj.content.duration )
				.attr('posx', obj.content.x === undefined ? '20' : obj.content.x  )
				.attr('posy', obj.content.y === undefined ? '80' : obj.content.y  )
				.attr('seek', 0 )// obj.conetnt.seek
				.attr('duration2', 0 )//obj.content.duration2
				.attr('target', obj.content.target)
				.text( obj.content.label ); 
		},
		
		
		/*
		* { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
		**/
		addDOMElement : function( obj ){ 
			$('<div></div>')
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.starttime )
				.attr('duration', obj.content.duration === undefined ? '10' : obj.content.duration )
				.attr('posx', obj.content.x === undefined ? '20' : obj.content.x  )
				.attr('posy', obj.content.y === undefined ? '80' : obj.content.y  )
				.attr('seek', 0 )// obj.conetnt.seek
				.attr('duration2', 0 )//obj.content.duration2
				.attr('target', obj.content.target)
				.attr('description', encodeURIComponent( obj.content.description ))
				.text( obj.content.label )
				.appendTo( vi2.dom );
		},
		
		
		/**
		* Builds a list menu of all entries of the table of content
		*/
		createMenu : function(hyperlinksData){  
			var _this = this;
			var hyperlinks = $('<ul></ul>')
				.addClass('hyperlinks-list');
			$( this.options.menuSelector ).html( hyperlinks );	 
			
			$.each(hyperlinksData, function(i, val){  
					var a = $('<a></a>')
					.text( decodeURIComponent( val.name ) )
					.addClass('id-'+ val.occ[0])
					.attr('href', '#!/video/' + vi2.observer.current_stream + '/t=npt:' + val.occ[0] + '') // former: main.options.id
					;				
					var user = vi2.db.getUserById( val.author );	
				
					var li = $('<li></li>')
						.addClass('hyperlinks-'+val.occ[0])
						.attr('id', ''+ val.occ[0])
						.attr('title', user.username+', ' + moment(Number(val.date), "x").fromNow())
						//.css('list-style-image',  "url('"+_this.options.path+"user-"+val.author+".png')")
						.html(a)
						.appendTo( hyperlinks )
						; 
					var data = {
								time: val.occ[0],
								date: val.date,
								author: val.author,
								content : {
									label: val.name, 
									date: val.date,
									duration: val.duration, 
									description: val.description,
									target: val.target,
									x: val.x,
									y: val.y,
									seek: 0,//val.seek,
									duration2: 0//val.duration2 
								}
							};
							
					// editing		
					if( _this.options.allowEditing ){		 // evtl. && Number(val.author) === Number(vi2.wp_user) 
						var edit_btn = $('<a></a>')
							.addClass('tiny-edit-btn glyphicon glyphicon-pencil tiny-edit-btn-'+ _this.name)
							.attr('data-toggle', "modal")
							.attr('data-target', "#myModal")
							.attr('data-annotationtype', 'hyperlinks')
							.data('annotationdata', data )
							.appendTo( li )
							;
					}
					
					li.click(function(){
						vi2.observer.log({context:'hyperlinks',action:'menu-click',values:[val.name,val.author,val.occ[0]]} ); 
						vi2.observer.player.currentTime( val.occ[0] );
						_this.currentTocElement = i;
					});	
				
			});// end each
		
			// sort list entries by time and append them
			hyperlinks
				.find('li').tsort( { attr:"id" } );  // tsort is error prune under chromium
					
			
		},			
		
		
		/** Begin of XLink annotation. Typically the link anchor will apeare on screen. There are three different link types: standard (target within video collection), external (target elsewhere in the WWW) and cycle (like standard link but with the option to return to the link source).
				@param {Object} e
				@param {String} id
				@param {Object} obj		
		*/
		begin : function(e, id, obj){  
				this.currLinkId = id;
				var _this = this;
				
				// distinguish link types as icons
				var ltype = $('<span></span>');
				var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
				var regex = new RegExp(expression);
				if (obj.content.target.match(regex) ){
					obj.linktype = 'external';
					ltype.addClass('glyphicon glyphicon-share-alt');
				} else {
					obj.linktype = 'standard';
					ltype.addClass('glyphicon glyphicon-link');
				}
				
				var o = $('<a></a>')
					.text(' ' +( decodeURIComponent( obj.content.title ) ) )
					.attr('id', 'ov'+id)
					.attr('href', obj.content.target )
					.attr('title', decodeURIComponent( obj.content.description ) )
					.addClass('overlay ov-'+id+' hyperlink-'+obj.linktype)
					.bind('click', function(data){ 
						// log click
						vi2.observer.log({context:'hyperlinks',action:'link-'+obj.linktype+'-click',values:[obj.content.target, obj.author, obj.displayPosition.t1]} );
	 					// distinguish link types
	 					switch(obj.linktype){
	 						case 'standard' : 	// called xlink
	 							return true;
	 							//var new_stream = obj.content.target.replace(/\#!/,'');
								//vi2.observer.setCurrentStream(new_stream);
								
							case 'external' :
								return true;
							case 'cycle' : 
								var new_stream = obj.content.target.replace(/\#!/,'');
								vi2.observer.setCurrentStream(new_stream);
								// make new object for return link
								var return_obj = {
									title : 'return to: '+obj.content.title,
									target : String(_this.player.url).replace(/.webm/,'').replace(/videos\/iwrm\_/,''), // dirty IWAS hack
									linktype : 'standard',
									type : 'xlink',
									x : 2, //obj.displayPosition.x,
									y : 93, // obj.displayPosition.y,
									t1 : obj.seek,
									t2 : obj.duration,
									seek : obj.displayPosition.t1,
									duration : 0
								};	
								// append that object
								vi2.observer.vid_arr[0].annotation.push(return_obj); 
								//	_this.loadCycleVideo(obj.content.target, 10, 15, obj.displayPosition.t1); // url, seek time, duration, return_seek
								break;
							case 'x':
								break;	
						}
						// load Video
						_this.loadVideo(vi2.observer.vid_arr[0].url , obj.seek);
						
						// remove link ancshor after click 
						$(this).remove();
					})
					.prepend( ltype )
					.appendTo( this.options.displaySelector )
					.css({left: obj.displayPosition.x+'%', top: obj.displayPosition.y+'%', position:'absolute'})
					.effect( "highlight", 2000 ) // could be improved
					; 
		},
	
		/* End of annotion time. The link anchor will disapear from screen. */
		end : function(e, id){ 	 
			$( this.options.displaySelector + ' .ov-'+id ).hide();
		},
		
		
		// ?
		clear : function(){
			$( this.options.displaySelector ).html('');
			// xxx static, stands in relative with template of videoplayer
			$('.vi2-video-seeklink').html('');
			
		},
		
		/*
		* 
		**/
		createAnnotationForm : function( data ){ 
			/*jshint multistr: true */
			var str = "\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form1'>ULR</span>\
				<input type='text' class='form-control' value='<%= content.target %>' name='hyperlinks-entry-url' data-datatype='string' placeholder='' aria-describedby='hyperlinks-form1'>\
			</div><br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form1'>Bezeichner</span>\
				<input type='text' class='form-control' value='<%= content.label %>' name='hyperlinks-entry-label' data-datatype='string' placeholder='' aria-describedby='hyperlinks-form12'>\
			</div><br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form2'>Beschreibung</span>\
				<textarea name='hyperlinks-entry-desc' data-datatype='string' placeholder='' aria-describedby='hyperlinks-form2'><%= content.description %></textarea>\
			</div><br>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form3'>Zeitpunkt (s)</span>\
				<input type='text' class='form-control' value='<%= time %>' name='hyperlinks-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='hyperlinks-form3'>\
			</div>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form66'>Anzeigedauer (s)</span>\
				<input type='text' class='form-control' value='<%= content.duration %>' name='hyperlinks-entry-duration' data-datatype='decimal-time' placeholder='' aria-describedby='hyperlinks-form3'>\
			</div>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form66'>Position x (%)</span>\
				<input type='text' class='form-control' value='<%= content.x %>' name='hyperlinks-entry-x' data-datatype='number' placeholder='' aria-describedby='hyperlinks-form3'>\
			</div>\
			<div class='input-group'>\
				<span class='input-group-addon' id='hyperlinks-form66'>Position y (%)</span>\
				<input type='text' class='form-control' value='<%= content.y %>' name='hyperlinks-entry-y' data-datatype='number' placeholder='' aria-describedby='hyperlinks-form3'>\
			</div>\
			"; 
			if( data.content !== '' ){
				data.content.description = decodeURIComponent( data.content.description );
				data.content.label = decodeURIComponent( data.content.label );
				return ejs.render(str, data);
			}	else{
				return ejs.render(str, { 
					content: { 
						description:'', 
						target:'', 
						label:'',
						duration:10,
						x: 50,
						y: 50
					}, 
					time: vi2.observer.player.currentTime(), 
					date: (new Date().getTime()),
					author: vi2.wp_user 
				});	
			}	
		},
		
		
		/*
		*
		**/
		getAnnotationFormData : function( selector ){ //encodeURIComponent
			return {
				time: $( selector ).find('[name="hyperlinks-entry-time"]').attr('value'),
				content: {
					label: ($( selector ).find('[name="hyperlinks-entry-label"]').val() ), 					
					target: $( selector ).find('[name="hyperlinks-entry-url"]').val(),
					description: ( $( selector ).find('[name="hyperlinks-entry-desc"]').val() ),// opt	
					duration:  $( selector ).find('[name="hyperlinks-entry-duration"]').val(),
					x:  $( selector ).find('[name="hyperlinks-entry-x"]').val(),
					y:  $( selector ).find('[name="hyperlinks-entry-y"]').val(),
					seek:  0,//$( selector ).find('[name="hyperlinks-entry-seek"]').val(),// opt
					duration2:  0 //$( selector ).find('[name="hyperlinks-entry-duration2"]').val()// opt						
				}	
			};
		},
		
		
		/** Loads video from url and seeks to a dedicated position in time. 
		*		@param {String} url 
		* 	@param {Number} seek 
		*/
  	loadVideo : function(url, seek){
	  	this.player.loadVideo(url, seek);  			
  	},
  	
  	/** ... */
  	loadCycleVideo : function(url, seek, duration, return_seek){
	  	this.player.loadCycleVideo(url, seek, duration, return_seek);  			
  	}
  	
	}); // end class XLink


/* 
* name: Vi2.SyncronizeMedia 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: Syncronizes images to the video playback
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*	- showOnTimeline: viz on timeline by showing current slide
*	- on/off controls .. sync, skip/browse slides
* - skip slides ... interface for next/previous 
* - appendtodom in Annotations auslagern
* - switch video and synMedia selector
* - require absolut image path
*	- differ media types
*	remarks:
*  - pdf2JPG:$ convert -resize 800 -quality 93 xxx.pdf slide.jpg
*/


Vi2.SyncronizeMedia = $.inherit( Vi2.Annotation, /** @lends Vi2.SyncMedia# */{

		/** @constructs 
		*		@extends Annotation 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);	
  	},
  	
  	/* class variables */
		name : 'syncMedia',
		type : 'annotation',
		// defaults
		options : {    //hasTimelineMarker: true, hasMenu: true, menuSelector:'.toc'
			selector: '.syncMedia', 
			hasTimelineMarker: true, 
			controls: true, 
			timelineSelector : '.vi2-timeline-main',
			hasMenu: false,
			menuSelector:'.synMediaMenu',
			prefix_path: 'slides/', 
			sync: true, 
			placeholder:'/static/img/placeholder.jpg'
		},
		tag_obj : [],
		currImgId : -1,
		
		
		/*
		* Initialize 
		**/
		init : function(ann){  	
  		var _this = this; 
			this.tag_obj = [];
			$.each(ann, function(i, val){  
				if(val.type == 'syncMedia'){ 
					var ii = _this.get_tag_by_name(val.title);
					if( ii == -1){ 
						_this.tag_obj.push({
							tagname: val.title, 
							path: val.target,
							occ: [{start: val.t1, duration: val.t2, xpos:val.x, ypos:val.y}]});
					}	else {
					_this.tag_obj[ii].occ.push({start: val.t1, duration: val.t2, x:val.x, y:val.y});
					}
				}
 			});
  	
  		// place holder
  		$(this.options.selector).html(new Image()).addClass(this.options.childtheme);
  		this.currImgId = -1;
			var o = new Image(); 
			$(o)
				.attr('src', this.options.placeholder)
				.addClass('slide')
				.unbind('click')
				.appendTo(this.options.selector);
  	
			// handle special options
			//if( this.options.hasTimelineMarker ){ this.buildTimelineMarkers(this.tag_obj);	}
			//if( this.options.hasMenu )	{ this.createMenu(); }
		},
		
		
		/* 
		* Creates menu of slides
		* todo: has not been tested 
		**/
		createMenu : function(){  
			$(this.options.selector).empty();
			var _this = this;
			// template for displaying tags
			
			// prepare list and append existing tags
			var ul = $("<ul></ul>").addClass("highlight-list").appendTo(this.options.selector);   
			$.each(this.tag_obj, function(i, val){ 
				var li = $('<li></li>')
					.addClass('list-item')
					.attr('id', val.tagname.replace(' ', '--'))
					.append($('<a></a>')
					.attr('freq', val.occ.length )
					.addClass('id-'+val.tagname.replace(' ', '--'))
					.text(val.tagname+' ')//+'('+val.occ.length+') ')
					.css("font-size", (val.occ.length / 10 < 1) ? val.occ.length / 10 + 1 + "em": (val.occ.length / 10 > 2) ? "2em" : _freq / 10 + "em")
					.bind('click', {tags: val }, function(e){ 
						// navigate playback time
						vi2.observer.player.currentTime( val.occ[0].start );
						vi2.observer.player.pause();
						$('#video1').addClass('split');
						$('.highlight-element').remove();
						// load image
						var o = new Image(); 
				 		$(o)
							.attr('src', val.path )
							.addClass('slide ov-')
							.unbind('load')
							.bind('load', function(e){ //alert(JSON.stringify(t))
								$('#seq').find('.helper').remove();
								var helper = $('<div></div>')
									.addClass('helper')
									.append(o)
									.appendTo('#seq');
							});
							// return to initial presentation mode
							
							// log something
							vi2.observer.log({context:'syncMedia',action:'menu-click',values:[val.tagname,'',val.occ]} ); 
					})
				).appendTo( ul ); 
			});
			$( vi2.observer.player ).on('player.play', function(e){ //alert()
				$('#video1').removeClass('split');
				$('#seq').find('.helper').remove();
			});
			// sort by occurence or alphabeticly, sort order desc / asc
			var sortAttr = {};
			sortAttr.attr = this.options.sort == 'freq' ? 'freq' : '';
			sortAttr.order = this.options.order == 'desc' ? "desc" : "asc";
			ul.find('a').tsort(sortAttr); 
			// cut off elements above max and render them
			$(ul).find('li:gt('+(this.options.max-1)+') > a').hide();
			
		},			
		
		/* 
		* Appends anotation object to DOM element 
		**/
		// <div type="syncMedia" starttime=1344 duration=165 id=hello>hydro_graefe-11.jpg</div>
		appendToDOM : function(id){ 
			$(vi2.dom).find('[type="syncMedia"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getSlidesById(id), function(i, val){  //alert(JSON.stringify(val))
				var slides = $('<div></div>')
				.attr('type',"syncMedia")
				.attr('starttime', val.starttime )//this.occ[0].start )
				.attr('duration', val.duration )//this.occ[0].duration)
				//.attr('seek', this.seek != null ? deci2seconds(this.seek) : 0)
				//.attr('duration2', this.duration2 != null ? this.duration2 : 0)
				.attr('id', val.id)
				.attr('path', val.img ) // val.path
				.text(this.tagname )
				.appendTo( vi2.dom );
			}); 
			
		},

		/* -- */
		begin : function(e, id, obj){ 
			if( this.options.sync ){
				this.placeMedia( e, id, obj );
			} 
		},

	
		/*
		begin : function(e, id, obj){ 
			if(this.currImgId == obj.content.target){
				return false;
			}else{
				this.currImgId = obj.content.target;
				var _this = this; 
				var o = new Image();
				o.src = this.options.prefix_path+''+obj.content.target; 
				$(o).addClass('slide');// ov-'+id);
							
  	  	$(this.options.selector+' img').fadeOut(20, function(){ 
  	  	  $(_this.options.selector).html(o);
  	  		$(o).fadeIn(500);
  	  	});
			}
		},
		*/
		
		
		/* ... */
		end : function(e, id){  //alert(id)
			$(this.options.selector+' .ov-'+id).remove();
		},
		
		
		
		
		/* */
		placeMedia: function( e, id, obj ){
			if(this.currImgId == obj.content.target){
				return false;
			}else{  
				var _this = this;
				this.currImgId = obj.content.target; 
				var o = new Image(); 
				// animate transition	if image is loaded				
				$(o) // vi2.observer.current_stream
					.attr('src', this.options.prefix_path+'/'+obj.content.target)
					.addClass('slide ov-'+id)
					.css({ height:'100vh' })
					.unbind('load')
					.bind('load', function(e){ //alert(JSON.stringify(t))
							$(_this.options.selector).html(o);
							$('#overlay').css('width', $( '.slide' ).width() );
					});
			}
		},	
		
		/** -- */
		get_tag_by_name : function(name){
			var out = -1;
			$.each(this.tag_obj, function(i, val){
				if(val.tagname == name){
					out = i;
				} 
			});
			return out;
		},	
				
		
		/* ... 
		relativePos : function(obj){
			return {x: Math.floor((obj.x/100)*this.player.width()), y: Math.floor((obj.y/100)*this.player.height())};
		},
		*/
		/* ... */
		loadVideo : function(url, seek){
				vi2.observer.player.loadVideo(url, seek);  			
		},
		
		width : function(){ return this.width; },
		
		height : function(){ return this.height; }
			
  	
	}); // end class SyncMedia


/* 
* name: Vi2.TableOfContent
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* depends on:
*  - embedded java script
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - highlight on skip ... this.player.video.addEventListener('timeupdat
*  - realize a toc for concatinated video clips
*/


Vi2.TableOfContents = $.inherit( Vi2.Annotation, /** @lends Vi2.TableOfContents# */{ // 

		/** @constructs
		*		@extends Annotation
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		@param {boolean} options.hasMenu Wether the TOC should be listed in a menu or not.
		*		@param {string} options.menuSelector Class or id of the DOM element for the menu.
		*		@param {sring} options.timelineSelector Class or id of the DOM element for the annotated timeline.
		*		@param {string} options.path Path to folder where user icons are stored.
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'toc',
		type : 'annotation',
		options : {
			hasTimelineMarker: true, 
			hasMenu : true,
			menuSelector: '#toc', 
			timelineSelector : '.vi2-timeline-main',
			allowEditing : true,
			allowCreation : true,
			path:'/'
		},
		currentTocElement : 0,
		elements : [],

		/**
		Initializes the table of content and handles options
		*/
		init : function(annotations){
			var _this = this;
			// prepare toc data
			var events = [];
			$.each(annotations, function(i, val){
				if(val.type === _this.name ){
					if( val.note !== "missing"){ 
						_this.elements.push(val.t1);
					}	 
					events.push( { 
						name: val.title, 
						note:val.note, 
						occ:[val.t1], 
						time:[val.t1], 
						author: val.author, 
						date: val.date 
					});
				}
			});
			// 
			if( this.options.hasMenu ){
				this.createMenu( events );
			}	
			// 
			if( this.options.hasTimelineMarker ){
				vi2.observer.player.timeline.addTimelineMarkers( 'toc', events, this.options.timelineSelector );
			}
					
			// update toc highlight on time update
			vi2.observer.player.video.addEventListener('timeupdate', function(e) { 
				// reset highlight
				//		$(_this.options.menuSelector+' li').each(function(i, val){ $(this).removeClass('toc-hightlight');})
				// highlight toc entry
				//		$(_this.options.menuSelector+ ' li#t'+this.formatTime(obj.content.target)).addClass('toc-highlight');
			});
		},		
		
		
		/**
		* Loads toc data from database in order to generate corresponding DOM elements.
		* @ Resulting format of DOM element: <div type="toc" starttime=83 duration=1 id="">Objectives of the lecture</div>
		*/
		appendToDOM : function(id){ 
			var frag = document.createDocumentFragment();
			$( vi2.dom ).find('[type="toc"]').each(function(i,val){ $(this).remove(); });
			$.each(	vi2.db.getTocById(id), function( i, val ){
				var toc = document.createElement( "div" );
				toc.setAttribute("type", "toc" );
				toc.setAttribute("note", val.note );
				toc.setAttribute("starttime", val.start );
				toc.setAttribute("duration", 10 );
				toc.setAttribute("author", val.author );
				toc.setAttribute("date", val.date );
				var itemText = document.createTextNode( decodeURIComponent(val.label) );
		 		toc.appendChild( itemText );
				frag.appendChild( toc );
			});
			$( vi2.dom ).append( frag );
		},
		
		/*
		**/
		updateDOMElement : function( obj ){ 
			$(vi2.dom)
				.find('[date="'+ obj.date +'"]')
				.attr('author', vi2.wp_user )
				.attr('date', obj.date)  // its the creation date
				.attr('starttime', obj.time )
				.text( obj.content ); 
		},	
		
		/*
		* { type: type, date: new Date().getTime(), time: formData.time, content: formData.content); 
		**/
		addDOMElement : function( obj ){
			$('<div></div>')
				.attr('type', obj.type)
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.text( obj.content ) 
				.appendTo( vi2.dom );
		},				
				
		/** 
		* During the playback corresponding toc entries will be highlighted.
		*/
		begin : function(e, id, obj){ 
				// reset highlight
				$(this.options.menuSelector+' li').each(function(i, val){ 
					$(this).removeClass('toc-highlight');
				});
				// highlight toc entry
				$('.toc-'+obj.displayPosition.t1).addClass('toc-highlight');
			
		},
	
	
		/** 
		* Terminates time-depended toc entries
		*/
		end : function(e, id, obj){ 
			//$('.toc-'+obj.displayPosition.t1).removeClass('toc-highlight');
		},
		
		
		/**
		* Builds a list menu of all entries of the table of content
		* todo: improve performance
		*/
		createMenu : function(tocData){
			var _this = this;
			var toc = $('<ul></ul>')
				.addClass('toc-list');
			$( this.options.menuSelector ).html( toc );	 
			
			$.each(tocData, function(i, val){ 
					var a = $('<a></a>')
					.text( val.name )
					.addClass('id-'+ val.occ[0]+' toc-menu-link')
					.attr('href', '#!/video/' + vi2.observer.current_stream + '/t=npt:' + val.occ[0] + '') // former: main.options.id
					;				
					
					var user = vi2.db.getUserById( val.author );	
					
					var li = $('<li></li>')
						.addClass('toc-'+val.occ[0])
						.attr('id', 'toc'+ val.occ[0])
						.attr('title', user.username+', ' + moment(Number(val.date), "x").fromNow())
						//.css('list-style-image',  "url('"+_this.options.path+"user-"+val.author+".png')")
						.html(a)
						.appendTo( toc )
						;
				
					// editing		
					if( _this.options.allowEditing ){		 
						var edit_btn = $('<a></a>')
							.addClass('tiny-edit-btn glyphicon glyphicon-pencil tiny-edit-btn-'+ _this.name)
							.attr('data-toggle', "modal")
							.attr('data-target', "#myModal")
							.attr('data-annotationtype', 'toc')
							.data('annotationdata', { 
								content: val.name, 
								time: val.occ[0], 
								date: val.date,
								author: val.author 
							} )
							.appendTo( li )
							;
					}
					// feature for (historic) movies where certain scenes are not available or lost	 
					if( val.note === "missing"){
						li.addClass('toc-disabled');
					}else{
						li.click(function(){
							vi2.observer.log({context:'toc',action:'menu-click',values: [val.name.replace(/,/g,'##'), val.author,  val.occ[0]] } ); 
							vi2.observer.player.currentTime( val.occ[0] );
							_this.currentTocElement = i;
						});	
					}	
			});// end each
		
			// sort list entries by time and append them
			//toc.find('li').tsort( { attr:"id" } );  // tsort is error prune under chromium
					
			
		},
		
		
		/*
		*
		**/
		createAnnotationForm : function( data ){ 
			/*jshint multistr: true */
			var str = "\
				<div class='input-group'>\
				<span class='input-group-addon' id='toc-form1'>Kapitelbezeichnung</span>\
				<input type='text' class='form-control' value='<%= content %>' name='toc-entry' data-datatype='string' placeholder='' aria-describedby='toc-form1'>\
				</div><br>\
				<div class='input-group'>\
				<span class='input-group-addon' id='toc-form1'>Wiedergabezeit</span>\
				<input type='text' class='form-control' value='<%= time %>' name='toc-entry-time' data-datatype='decimal-time' placeholder='' aria-describedby='toc-form1'>\
				</div>\
				"
				;
			if( data ){
				return ejs.render(str, data);
			}	else{
				return ejs.render(str, { 
					content:'', 
					time: vi2.observer.player.currentTime(),
					author: vi2.wp_user,
					date: (new Date().getTime())	 
				});	
			}	
		},
		
		
		/*
		*
		**/
		getAnnotationFormData : function( selector ){
			var obj = {};
			obj.content = $( selector ).find('[name="toc-entry"]').attr('value');
			obj.time = $( selector ).find('[name="toc-entry-time"]').attr('value');
			return obj;
		},
		
		
		/** 
		* Jumps to the next element of the table of content 
		*/
		nextElement : function(){
			//$('.toc-'+ (this.currentTocElement + 1) ).click();
			this.currentTocElement = this.currentTocElement < this.elements.length ? this.currentTocElement + 1 : this.currentTocElement;
			vi2.observer.player.currentTime( this.elements[ this.currentTocElement ] );
			vi2.observer.log({context:'toc',action:'jump-next',values:[this.currentTocElement]});
		},
		
		
		/** 
		* Jumps to the previous element of the table of content. 
		*/
		previousElement : function(){
			this.currentTocElement = this.currentTocElement === 0 ? this.currentTocElement : this.currentTocElement -1 ;
			vi2.observer.player.currentTime( this.elements[ this.currentTocElement ] );
			vi2.observer.log( {context:'toc',action:'jump-back',values: [this.currentTocElement ]} );
		}
		
	}); // end class
/* 
* name: Vi2.AnnotatedTimline
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* depends on:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* related code:		
	- timeline preview: https://github.com/brightcove/videojs-thumbnails/blob/master/videojs.thumbnails.js

* todo:
*   - cluster / zoom : - Vergleiche Darstellung von sehr vielen Markern bei Google Maps ...
		- diagramm (?)
		- filter
		- multi tracks
		- add slide preview
		- bug: previw is not exact and is loading very slow

*/


Vi2.AnnotatedTimeline = $.inherit(/** @lends Vi2.TableOfContents# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(video, options, seek) { 
  			this.video = video;
  			this.options = $.extend(this.options, options);  
  			this.seek = seek === undefined ? 0 : seek;
  			this.init();
		},
		
		name : 'annotated timeline',
		type : 'core',
		options : {
			timelineSelector : '.vi2-timeline-main',
			hasPreview : false,
			hasSlidePreview: false,
			previewPath : '/static/img/video-stills/theresienstadt/still-image-',
			hasMarker : true,
			path:'/'
		},
		video : null,
		seek : 0,
		seeksliding: true,
		video_seek: null,  
		
		video_loading_progress: null,
		video_timer: null,
		interval: 0,
		percentLoaded:0,
		video_container: null,
		cursorX : 0,

		/**
		Initializes the table of content and handles options
		*/
		init : function(annotations){
			var _this = this;
			// init
			this.video_seek = $( this.options.timelineSelector );
			this.video_loading_progress = $('.vi2-timeline-progress');
			this.video_timer = $('.vi2-video-timer'); // could become an option
		
			if( this.options.hasPreview ){
				this.createTimelineVideoPreview();
			}
			
			if( this.options.hasSlidePreview ){
				this.createTimelineSlidePreview();
			}		
		
			// initiate event listeners, vi2.observer.log('loadingtime--video:'+url);
			var 
				t0 = 0, 
				t1 = 0
				;
			this.video.onloadstart = function(e){
				// 1. event called 
				t0 = Date.now();
			};
			this.video.ondurationchange = function(){ 
				// 2. event called
				t1 = ( Date.now() - t0 );
				//console.log('duration '+ ( Date.now() - t0 ) );
				_this.handleDurationChange();  
			}; 
			this.video.onloadedmetadata = function(e){ 
				// 3. event called
				//console.log('load meta '+ ( Date.now() - t0 ) );  
			};
			this.video.onloadeddata = function(e){ 
				// 4. event called
				vi2.observer.log({context:'player', action:'video-loading-time', values:[t1, ( Date.now() - t0 )]});
				//console.log('load data '+ ( Date.now() - t0 ) ); 
			};
			this.video.onprogress = function(e){ 
				// 5. event called  
			};
			this.video.oncanplay = function(e){ 
				// 6. event called
				//console.log('can play '+ ( Date.now() - t0 ) );  
			};
			this.video.oncanplaythrough = function(e){ 
				// 7. event called
				//console.log('can play through '+ ( Date.now() - t0 ) ); 
			};
			
			
			this.video.addEventListener('timeupdate', function(e){ 
				_this.handleTimeupdate(e); 
			});
			
		},		
		
		/** 
		* Creates a timeline slider to seek within the playback time 
		*/
		createTimelineControl : function() { 
			var _this = this;
			//
			if (this.video.readyState) {  
				clearInterval(this.interval);
				clearInterval(this.interval);
				//var video_duration = _this.video.duration; //$(this.options.selector).attr('duration');
				this.video_seek.slider({
					value: 0,
					step: 0.01,
					orientation: 'horizontal',
					range: 'min',
					max: vi2.observer.player.duration(),
					animate: false,
				  slide: function(event, ui) { 
							_this.seeksliding = true;
					},
					start: function(event, ui) { 
						vi2.observer.log({context:'player',action:'seek-start',values: [ui.value]} );
						_this.buffclick++;
						_this.seeksliding = true;
					},
					stop: function(event, ui) { 
						vi2.observer.log({context:'player',action:'seek-stop',values:[ui.value]}	);
						_this.seeksliding = false;
						//if(_this.percentLoaded > (ui.value / _this.duration())){
						vi2.observer.player.currentTime( parseFloat(Math.ceil(ui.value)) ); // XXX bugy / webkit fix
					}
					
				});
				
			} else {
				// try reinitiate the slider as long the ...? 
				this.interval = setInterval(function() { _this.createTimelineControl(); }, 150);
			}
		
		},
		
		
		/*
		* Add Video preview on timeline
		* todo: event could be logged
		**/
		createTimelineVideoPreview : function(){ 
			var 
					_this = this,
					width = $( this.options.timelineSelector ).width(),
					left = ($( this.options.timelineSelector )).offset().left,
					t = 1,
					o = null
					;
			
			var img = new Image();
			img.id = 'videopreview';//);//.attr('src', _this.options.previewPath + "001.jpg");
			var timeline_preview = $('<div></div>')
				.addClass('vi2-timeline-preview')
				.html( img )
				.appendTo( _this.options.timelineSelector );
			
			// event
			var handleTimelineMoves = function(event){ 
					$( timeline_preview ).css({ left: (event.pageX - 100) });
					t = (Math.round( ( event.pageX / width ) * vi2.observer.player.duration() ) - 20); // correction value is unclear
					o = new Image();
					img_selector = document.getElementById("videopreview");
					listener = function(event2){
						img_selector.src = o.src; 
					};
					o.removeEventListener('load', listener, false);
					o.addEventListener('load', listener, false); 
					o.src = _this.options.previewPath + "" + t + ".jpg";//  + "?_=" + (+new Date());
					o.onerror = function () { this.style.display = "none"; };
			};			
			var el = document.getElementsByClassName( 'vi2-timeline-main' );
			el[0].removeEventListener('mousemove', handleTimelineMoves );
			el[0].addEventListener('mousemove', handleTimelineMoves );
		},
		

		/*
		* Add Video preview on timeline
		* todo: event could be logged
		**/
		createTimelineSlidePreview : function(){ 
			var 
					_this = this,
					width = $( this.options.timelineSelector ).width(),
					left = $( this.options.timelineSelector ).offset().left,
					t = 1,
					o = null
					;
			var timeline_preview = $('<div></div>')
				.addClass('vi2-timeline-preview')
				.appendTo( this.options.timelineSelector );
			
			// event			
			var el = document.getElementsByClassName( 'vi2-timeline-main' );
			el[0].addEventListener('mousemove', function(event){ 
					$( timeline_preview ).css({ left: (event.pageX - 100) });
					t = (Math.floor( ( vi2.observer.player.duration() / width ) * Math.floor(event.pageX) )).toString();
					
					o = new Image();
					o.src = _this.options.previewPath + "" + t + ".png";
					listener = function(event2){
						$( timeline_preview )
							//.css({ left: (event.pageX - 100) })
							.html(o);
					};
					o.removeEventListener('load', listener, true);
					o.addEventListener('load', listener, true); 
			}, false);
		},
	
		
		/** 
		* Displays markers on the timeline
		* options: hasTooltip, clickable, type, 
		*/
		addTimelineMarkers : function(type, data, timelineSelector){   
			var _this= this; 
			if( timelineSelector === undefined ){
				timelineSelector = this.options.timelineSelector;
			}
			this.options[ type ] = { markerHasTooltip: true, markerIsClickable:true };
			var timeline = $( timelineSelector );
			
			// remove existing markes of the same type before rewriting them
			$('.'+type + '-timeline-marker').each(function(i, val){ $(val).remove(); });
			
			$.each( data, function(i, val){ 
				var progress = val.occ[0] / vi2.observer.player.duration();
				progress = ((progress) * $( timelineSelector ).width());
	    	if (isNaN(progress) || progress > $( timelineSelector ).width()) { return;}
	    	
	    	var sp = $('<a></a>')			// $('<span></span>');		
					.addClass( type + '-timeline-marker ttoc')
					.attr('style','left:'+ progress +'px;')
					;
				if( _this.options[ type ].markerHasTooltip){
					sp
						.attr('title', val.name)
						.attr('data-toggle', 'tooltip');
				}	
				if( _this.options[ type ].markerIsClickable ){	
					sp.bind('click', function(event){ 
							vi2.observer.player.currentTime( val.occ[0] );
							vi2.observer.log( {context:type,action:'timeline-link-click',values:[val.name,val.author,val.occ[0]]});
					});
				}
 				timeline.append(sp); // val.title
			});
		},
		
				
		/*
		* Event is called when the total playback time has been determined
		**/
		handleDurationChange : function(e) { 
			this.createTimelineControl(); 
			//if( $(_this.options.selector).attr('duration') != undefined )  
			 
			 	vi2.observer.player.currentTime( this.seek );
				$(vi2.observer).trigger('player.ready', [vi2.observer.player.seqList[vi2.observer.player.seqNum].id, vi2.observer.player.seqNum]);
				
			
			/*if (Number(this.seek) > 0) { 
				if(this.percentLoaded > (this.seek / this.duration())){
					//this.currentTime(seek); // bugy in production use or on remote sites
					vi2.observer.player.currentTime( this.seek );
					$(vi2.observer).trigger('player.ready', [vi2.observer.player.seqList[vi2.observer.player.seqNum]['id'], vi2.observer.player.seqNum]);
				}
			}*/
			 	
		},
		
		
		/*
		* Event is called during the videos is buffering
		**/
		handleProgress : function (e) {
			//_this.setProgressRail(e);
			var
				target = this.video;//(e != undefined) ? e.target : this.video,
				percent = null;			

			if (target && target.buffered && target.buffered.length > 0 && target.buffered.end && target.duration) {
				percent = target.buffered.end(0) / target.duration;
			} else if (target && target.bytesTotal !== undefined && target.bytesTotal > 0 && target.bufferedBytes !== undefined) {
				percent = target.bufferedBytes / target.bytesTotal; 
			} else if (e && e.lengthComputable && e.total !== 0) {
				percent = e.loaded/e.total;
			}

			if (percent !== null) {
				this.percentLoaded = percent;
				percent = Math.min(1, Math.max(0, percent));
				
				if (this.video_loading_progress && this.video_seek) {
					this.video_loading_progress.width(this.video_seek.width() * percent);
				}
			}
			
		},


		/*
		* Event is called every time when the playback time changes
		**/
		handleTimeupdate : function(e) { 
			if (!this.seeksliding) {
				this.video_seek.slider('value', vi2.observer.player.currentTime() );
			}
			//this.video_timer.text( vi2.utils.seconds2decimal( vi2.observer.player.currentTime() ) + ' / ' + vi2.utils.seconds2decimal( vi2.observer.player.duration() ));
		}
		
		
	
		
	/* -- 
		setCurrentRail: function(e) {

			var t = this;
		
			if (t.media.currentTime != undefined && t.media.duration) {

				// update bar and handle
				if (t.total && t.handle) {
					var 
						newWidth = t.total.width() * t.media.currentTime / t.media.duration,
						handlePos = newWidth - (t.handle.outerWidth(true) / 2);

					t.current.width(newWidth);
					t.handle.css('left', handlePos);
				}
			}

		}	*/
		
	}); // end class
/* 
*	name: Vi2.Assessment
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Abstract class for video annotations
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- include hourse at format time
*/

 
Vi2.Annotation = $.inherit(/** @lends Annotation# */{

		/** 
		* 	@constructs 
		*		@param {object} options An object containing the parameters
		*/
  	__constructor : function(options) {
  		this.options = options;  
		},
		
		name : 'annotation',
		type : 'annotation',
		options : {},

		/* ... */
		init : function(ann){},	
		
		/* -- */
		appendToDOM : function(id){},						
				
		/* ... */
		begin : function(e, id, obj){},
	
		/* ... */
		end : function(e, id){},
		
		
		/*
		* todo: 
		*  - check data types: string, number, decimal-time, ... from .data('datatype', 'decimal-time')
		*  - change messages
		**/
		validateAnnotationForm : function(selector, type){ 
			var textarea_flag = 0, textinput_flag = 0, msg = '', sum_checked = 0, sum_checkbox = 0;
			
			// validate input fields
			$(selector).find('input[type=text]').each(function(i,val){
				if($(val).val() === ''){
					$(val).addClass( 'validation-conflict' );
					textinput_flag = true;
				}else{
					$(val).removeClass( 'validation-conflict' );
				}
			});
			if(textinput_flag){
				msg += "\n Versehen Sie bitte die/das Textfeld/er mit einem Text.";
			}
			
			// validate textareas
			$(selector).find('textarea').each(function(i,val){
				if(String($(val).val()).length < 2){
					$(val).addClass( 'validation-conflict' );
					textarea_flag = true;
				}else{
					$(val).removeClass( 'validation-conflict' );
				}
			});
			if(textarea_flag){
				msg += "\n Definieren Sie bitte einen Text für das Textfeld.";
			}
			
			// validate checkboxes
			if($(selector).find('input[type=checkbox]').length > 0 && $(selector).find('input:checked').length === 0){ 
				$(selector).find('input[type=checkbox]').addClass( 'validation-conflict' );
				msg =+ "\n Mindestens eine Antwortoption sollte als richtig markiert werden.";
			}else{
				$(selector).find('input[type=checkbox]').removeClass( 'validation-conflict' );
			}
			
			if(String(msg).length === 0){ 
				return msg; 
			}else{ 
				console.log('Validation Error:' + msg); 
				return msg;
			}
		},
		
		
		/*
		* Formats time from seconds to decimal mm:ss
		* @todo: include hours
		**/		
		formatTime : function(secs, delimiter){
			delimiter = delimiter ? delimiter : '';
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + delimiter + seconds;
		}
		
	}); // end class Annotation
/* 
*	name: Vi2.Clock
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Checks which annotations need to be activated or deactivated in given time intervall during video playback
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*	 	- implement checkAnnotation in order to trigger certain events at the listenning instances
* 		- use timeUpdate insteate of setTimeOut or setIntervall: http://blog.gingertech.net/2009/08/19/jumping-to-time-offsets-in-videos/
http://stackoverflow.com/questions/3255/big-o-how-do-you-calculate-approximate-it
https://de.wikipedia.org/wiki/Bin%C3%A4re_Suche#Intervallschachtelung
https://de.wikipedia.org/wiki/Interpolationssuche
https://en.wikipedia.org/wiki/Search_engine_indexing#Inverted_indices
https://en.wikipedia.org/wiki/Inverted_index
https://en.wikipedia.org/wiki/Index#Computer_science

- Indexstruktur wird bei Änderungen (z.B. einer neuen Annotation) neu berechnet. Muss das so sein?
- es handelt sich um eine eindimensionale Indexstruktur, in der die Anzeigezeit indiziert ist 
- Alternative Implementierung: B-Baum
- Ermittlung der optimalen Länge des Index  ... Abspielzeit in Minuten / Anzahl der Annotation ... Videolänger / Prüfungsintervall ??
- Ziel müsste es sein, die Annotationen möglichst gleich auf die Indexeinträge zu verteilen, so dass in jedem Indexeintrag so wenig wie möglich und immer gleichviele Suchoperationen vorgenommen werden müssten.
- Ein Nebenziel müsste sein, die Bestimmung des aktuellen Index so einfach wie möglich zu gestalten. 
- Landau-Notation:: Man müsste Testfälle generieren, in dem man die Anzahl der Annotation verdoppelt, um dazu den Zeitaufwand misst. = Zeitkomplexität. Diese Messung müsste in verschiedenen Browsern durchgeführt werden.
%http://de.wikipedia.org/wiki/Landau-Symbole#Beispiele_und_Notation 

*/
	

Vi2.Clock = $.inherit(/** @lends vi2.core.Clock# */
	{
			/** 
			*		@constructs 
			*		@param {Videoplayer} player Related video player 
			*		@param {Number} clockInterval Interval of clock granularity in milliseconds
			*/
  		__constructor : function(player, clockInterval) { 
  			this.player = player;
  			this.clockInterval = clockInterval;  		
  		},
  		
		
		name : 'clock',
		player : null,
		clockInterval : 500, // = default
		isRunning : false,
		timelineSelector : 'div.vi2-video-seek',
		interval : -1,	
		annotations : [],
		hooks : [],
		
		/**
		* Checks whether the provided type of annotation has been already added as a hook
		* @param {String} type
		* @return {boolean}
		*/
  	isHook : function(type){
  		return this.hooks[type] !== null;	
  	},
  	
  	/* ... */
  	addHook : function(type, fn){
  		this.hooks[type] = fn;
  		return true;
  	},
	
		/* push annotation on their stack by mapping the parser object to the specific annotation object structure */
		addAnnotation : function(obj){ 					
			if(this.isHook(obj.type)){   
				this.annotations.push({
						active:false,
						author: obj.author,
						width: obj.width, 
						content: {
								title: obj.title, 
								target:obj.target,
								description:obj.description,
								note:obj.note
							}, 
						linktype:obj.linktype, 
						type: obj.type, 
						displayPosition: {
								x: obj.x, 
								y: obj.y, 
								t1: obj.t1, 
								t2: obj.t2
							},
							seek : obj.seek,
							duration : obj.duration
						});
		 	}	
		},
	
		/* Trivial */
		checkAnnotation : 	function() {
			var iTime = this.parseTime( this.player.currentTime() );
			var annoLength = this.annotations.length;
			for (var i=0; i < annoLength; i++ ){ 
				var oAnn = this.annotations[i];
				if(iTime >= oAnn.displayPosition.t1 && iTime < (Number(oAnn.displayPosition.t1) + Number(oAnn.displayPosition.t2))) {
					if(!oAnn.active){
						oAnn.active = true; 
	  				$(this.player).trigger('annotation.begin.'+oAnn.type, [i, oAnn]); 
					}
				}else {
					oAnn.active = false;
	  			$(this.player).trigger('annotation.end.'+oAnn.type, [i]);
				}
			}
		},
		
		
		
	/* Optimized algorithm, making advantage of indexing the time of appearance */
		/* to do: 
		-generate test data, 
		-try different approaches to generate the index, 
		-measure time, 
		-calculate complexity in landau notation
		*/
		prepAnno : [],
		
		buildAnnotationIndex : function(){
			var prepAnno = [];
			for (var i = 0; i < 1000; i++){ prepAnno[i] = [];} 
			$.each(this.annotations, function(i, val){
				var index = val.displayPosition.t1 < 1 ? 0 : Math.ceil(val.displayPosition.t1 / 100);
				prepAnno[index].push(val);
			});
			this.prepAnno = prepAnno;
		},
		
		checkAnnotation_new : 	function() {
			var _this = this;
			var iTime = this.parseTime( this.player.currentTime() ); // returns time in decimal 
			var x = this.player.currentTime() < 1 ? 0 : Math.ceil(iTime / 100); 
			//$('#debug').val(_this.prepAnno[x].length);	
			$.each(_this.prepAnno[x], function(i, oAnn){  
				
				if(iTime >= oAnn.displayPosition.t1 && iTime < (Number(oAnn.displayPosition.t1) + Number(oAnn.displayPosition.t2))) {
					if(!oAnn.active){
						oAnn.active = true; alert(oAnn.type);
	  				$(_this.player).trigger('annotation.begin.'+oAnn.type, [i, oAnn]); 
					}
				}else {
					oAnn.active = false;
	  			$(_this.player).trigger('annotation.end.'+oAnn.type, [i]);
				}
			});
		},
		
		
		// Another approach
		/*
		1. generate an inverted index where Index[ playbacktime_rounded ] = {annotation_1, annotation_2, ..., annotation_n}. The Index contains all annotations, that should be visible at time. 
		2. at a given playbacktime just test whether the time in ms exists in the Index.
		
		Problem:: Size of Index
		*/
		
							
		/* ... */
		startClock : function(){  
			//this.buildAnnotationIndex();
			if(this.isRunning){ return;}
			var _this = this;
			this.isRunning = true;
			this.interval = setInterval(function() { _this.checkAnnotation();  }, this.clockInterval);		
		},
		
		/* ... */
		stopClock : function(){
			clearInterval(this.interval);
			clearInterval(this.interval);
			this.isRunning = false;
		},

		/* ... */		
		reset : function(){
			$('#overlay').html('');
			this.annotations = [];
		},
	
		/* ... */
		parseTime : function (strTime) { 
			return strTime;
			//var aTime = strTime.toString().split(":");
			//return parseInt(aTime[0],10) * 60 + parseInt(aTime[1],10) * 1;// + parseFloat(aTime[2]);
		},
	
		/* ... */
		getCurrentTime : function(){
			return this.player.currentTime();
		}
	
}); // end class Clock 
	

/* DataBase
* author: niels.seidel@nise81.com
* license: MIT License

* todo:
- call_back als Event umsetzen
- filenames as parameter
- handle different data sets

*/


	/* class DataBase **/ 
	Vi2.DataBase = $.inherit(/** @lends DataBase# */{

		/** 
		*		@constructs
		*		@param {object} options An object containing the parameters
		*		@param {function} call_back Function that will be called after relevant data is available 
		*/
  	__constructor : function(options, call_back, fn, video_id) {  
  		this.call_back = call_back;
  		var _this = this;
  		this.options = $.extend(this.options, options); 
  		this._d = 0;  
  		$.each(this.options.jsonFiles, function(key, file) { 
        console.log("making requst for " + file.path);  
        _this.loadJSON(file.path, file.storage, fn);
       });
		},
				
		name : 'dataBase',
		options : {
			path :'',
			jsonFiles: [
  		//	{path: '/json/videos/', storage: 'json_data'}, 
  		//	{path: '/groups', storage: 'json_group_data'},
				// {path: this.options.path+'data-slides.json', storage: 'json_slide_data'},
  		//	{path: '/json/users', storage: 'json_user_data'}
  		]
		}, // ?
		call_back : {},
		_d : 0,
		json_data : {},
		json_slide_data : {},
		json_user_data : {},
		content_selector : '#content',
		dom : '#hydro1', // unused
		

	/**
	*	@param {Sring} URL of JSON file
	*	@param {Object} Internal Object where the fetched data will be stored for processing within the class 
	*/
	loadJSON : function(jsonURL, storage, fn){ 
		var _this = this;
    $.ajax({
        type: "get",
        beforeSend: function(xhr){
    				if (xhr.overrideMimeType){
				      xhr.overrideMimeType("application/json");
    				}
  			},
        url: _this.options.path + jsonURL,
        dataType: 'json',
        success: function(data){ 
            //alert("got " + jsonURL);
            _this[storage] = data;  
            
            //alert(JSON.stringify(_this.json_data))
            _this._d++; 
            if (_this._d === Object.size( _this.options.jsonFiles ) ){ 
            	console.log('done'); 
            	// call
            	_this.call_back[fn]();
            	
            }
        },
        error: function(e){
        	window.location = "/login"; 
					var err = new Error('Could not catch data');
				}
    });
	},


/* DB Calls */	
	
	/* returns true if stream of id exists */
	isStream : function(id){
		var t = false;
		$.each(this.json_data, function(val){
			if (this.id === id){
				t = true;
			}
		});
		return t;
	},
		
	//get stream by id
	getStreamById : function(id){  
		if(this.json_data === undefined){
			return {};
		}else{
			return this.json_data;
		}
		// old:
		/*
		var stream = {};  
		$.each(this.json_data, function(i, val){ 
			if (val._id === id){  
				stream = this; 
			}
		});
		
		return stream;
		*/
	},
			


	/* CATEGORIES*/

	/* returns data of all categories */
	getAllCategories : function(){ 
		return this.json_data.categories;
	},
	
	
	// returns ordered list of all categories
	getCategoryTaxonomie : function(){
		var cat = {};
		$.each(this.json_data.categories, function(i,val){ 
				cat[this.pos] = {first_level: this.title, desc: this.desc};
		}); 
		return cat;
	},
	
	
	/* returns data of the requested category */
	getCategory : function(cat_name){
		var data = {};
		$.each(this.json_data.categories, function(i,val){ 
			if(this.title === cat_name){
				data = {first_level: this.title, desc: this.desc, pos: this.pos, link: this.link, icon:this.icon};
			} 
		}); 
		return data;
	},
	

	/* META DATA */

	//
	getMetadataById : function(id){ 
		return this.getStreamById(id).metadata[0];
	},
		
	//get all titles
	getTitles : function(){
		var titles = [];
		$.each(this.json_data, function(val){
				titles.push({first_level: this.metadata[0].title});
		});
		return removeDuplicates(titles);
	},
	
	//get all authors
	getAuthors : function(){
		var authors = [];
		$.each(this.json_data, function(val){
				authors.push({first_level: this.metadata[0].author});
		});
		return removeDuplicates(authors);
	},
	
	/* - - */
	getStreamsOfSameAuthor : function(id){
		var author = this.getMetadataById(id).author; 
		var authors = [];
		$.each(this.json_data, function(i, stream){ 
				if(stream.metadata[0].author === author && stream.id != id){ 
					authors.push(stream.id); //$('#debug').val($('#debug').val() + stream.id);
				}
		});
		return authors;
	}, 
	
	

	/* TAGS */	

	/* returns all tags of a video/stream **/
	getTagsById : function(id){
		if(this.json_data.tags === undefined){
			return {};
		}else{
			return this.getStreamById(id).tags;
		}
	},
	
	/* returns all comments related to an video **/
	getCommentsById : function(id){
		return this.getStreamById(id).comments;
	},
		
	/* returns all tags related to the whole video collection **/
	getTagList : function(){
		var tags = [];
		$.each(this.json_data, function(val){
			$.each(this.tags, function(val){
				tags.push({first_level: this.tagname});
			});
		});
		return this.removeDuplicates(tags).sort();
	},
	
	/* returns ordered list of all tags */
	getTagTaxonomie : function(){ 
		var tax = [];
		$.each(this.json_data._taxonomy, function(i, stream){
			tax.push({first_level: this.id, second_level: this.sub});	
		});
		return tax;
	},
	
	/* -- */ 
	getStreamsWithSameTag : function(id){
		var _this = this;
		var streams = [];
		var tags = this.getStreamById(id).tags; 
		$.each(tags, function(i, the_tag_name){	
			$.each(_this.json_data, function(j, stream){  
				$.each(stream.tags, function(k, tag){ 
					if(this.tagname === the_tag_name.tagname){ 
					 streams.push(stream.id); //$('#debug').val($('#debug').val() +' '+ stream.id);
					}
				});
			});			
		});
		return streams;
	},
	
	
	/* -- */
	getRandomStreams : function( id ){
		var _this = this;
		var streams = [];
		$.each(_this.json_data, function(j, stream){ 
			streams.push(stream.id);
		});
		return streams; // xxx need to be sort random
	},
	
	

	/* LINKS */
	
		/* -- */
	getLinkTargetsById : function(id){
		var links = []; 
		$.each(	this.getStreamById(id).hyperlinks, function(val){ 
			links.push(this.target);  //$('#debug').val($('#debug').val() + this.target);
		});
		return	links;
	},
	
	/* -- */
	getLinkSourcesById : function(id){
		var links = [];	
		$.each(this.json_data, function(i, stream){
			$.each(stream.hyperlinks, function(i, link){
				if(this.target === id){
				 links.push(stream.id); //$('#debug').val($('#debug').val() +' '+ stream.id);
				}
			});
		});			
		return links;	
	},
	
	/* -- */ 	
	getLinksById : function(id){
		return this.getStreamById(id).hyperlinks; 
	},
	
	/* -- */ 	
	getAssessmentFillInById : function(id){
		return this.getStreamById(id).assessmentfillin; 
	},
	
	/* -- */ 	
	getAssessmentWritingById : function(id){
		return this.getStreamById(id).assessmentwriting; 
	},
	
	/* -- */ 	
	getAssessmentById : function(id){
		if(this.json_data.assessment === undefined){
			return {};
		}else{	
			return this.json_data.assessment; 
			//return this.getStreamById(id).assessment;
		}
	},
	
	
	/* returns table of content of the requested video */
	getTocById : function(id){
		if(this.json_data.toc === undefined){
			return {};
		}else{ 
			return this.getStreamById(id).toc;
		}
	},
	
		/* returns highlight of the requested video */
	getHighlightById : function(id){ 
		if( this.json_data.highlight === undefined ){
			return {};
		}else{ 
			return this.getStreamById(id).highlight;
		}
	},
	
	
	/** 
	*	@param {String} Video id
	*	@returns {Object} JSON object with temporal annotation of images/slides of video with the given id.
	*/ 	  
	getSlidesById : function(id){ 
		//alert(JSON.stringify( this.getStreamById(id)['slides'] ))
		return this.getStreamById(id).slides; 
		/*
		if(this.json_data.slides === undefined){
			return {};
		}else{
			return this.json_data.slides;
		}
		*/
		/*
		var slides = {}; 
		$.each(this.json_data, function(i, val){ 
			if (this._id === id){  
				slides = this.slides;
			}
		}); 
		return slides;
		*/
	}, 
	
	/*
	*
	**/
	hasSlides : function(id){
		if(this.getStreamById(id).slides !== undefined){
			if(this.getStreamById(id).slides.length > 0){
				return true;
			}
		}
		return false;
	},
	
	
	/**
	
	*/
	getUserById : function(id){ 
		var user = {}; 
		$.each(this.json_user_data, function(i, val){ 
			if( Number(val.id) === Number(id) ){  
				user = val;
			}
		}); 
		return user;
	}, 
		
		
	/**
	
	*/
	getGroupById : function(id){
		var group = {}; 
		$.each(this.json_group_data, function(i, val){ 
			if ( Number(val.id) === Number(id) ){  
				group = val;
			}
		}); 
		return group;
	},
	
	/* --- **/
	getUserByGroupId : function(group, pos){ //alert(group+'  '+pos)
		var u = [];
		$.each(this.json_user_data, function(i, val){ 
			if ( val.groups[pos] === group){  
				u.push( val );
			}
		});
		
		return u;
	}, 
				
	






	

	



	



	
	
	
	
	
	
	
	
	
/* TO CLEAN UP */	

	//
	getVideoById : function(id){ 
		var video = $('<div></div>')
			.attr('type',"video")
			.attr('starttime',0)
			.attr('duration',7)
			.attr('id', "myvideo")
			.text(this.getStreamById(id).video);  
		return video;
	}
	
	/* returns stream by its title  // xxx remove rendering code
	getStreamsByTitle : function(title_name){
		var _this = this;
		var template = $("#item_template").val();
		
		$(_this.content_selector)
			.empty()
			.trigger('clear');
			//.append($('<h2></h2>').text('Lectures in category: '+title_name));

		$.each(this.json_data.stream, function(i, stream){
				if(stream.metadata[0].title == title_name){
					var item =$('<div></div>')
						.addClass('content-item')
						.setTemplate(template)
						.processTemplate(stream)
						.appendTo($(_this.content_selector));
				}
		});
		//$('.text').hidetext();
		// reset drop downs
		$('.getStreamsByTag').val(-1);
		$('.getStreamsByCategory').val(-1);
	},
	*/
	
	
	
	}); // end class DataBase	
/* 
*	name: Vi2.Log
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 further options:
	** standardisazion:
	* https://sites.google.com/site/camschema/home
	* http://sourceforge.net/p/role-project/svn/HEAD/tree/trunk/gadgets/cam_sjtu/CamInstance.js
	* http://sourceforge.net/p/role-project/svn/HEAD/tree/trunk/gadgets/html5Video/videoGadget.xml
	*/

	Vi2.Log = $.inherit(/** @lends Log# */{

		/** 
		*	Input:
		* 	client IP Adress via server side request
		* 	client browser, operating system, 
		* 	time in ms since 1970	
		* 	clicks: tags, category, startpage, lecture 
		* 	search terms
		* 	video: seek on timeline, link clicks, seek2link, toc clicks
		* 
		* Output options:
		* 	dom #debug
		* 	log.txt via PHP
		* 	console.log (default)
		*
		*		@constructs 
		*		@param {object} options An object containing the parameters
		*		@param {String} options.output Output channel that could be a 'logfile' or a 'debug' panel
		*		@param {Selector} options.debug_selector If options.output is set to debug at following DOM selector will used to output log data
		*		@param {String} options.logfile If options.output is set to logfile that option indicates the filename of the logfile
		*		@param {String} options.parameter Its a comma separated list of data parameters that should be logged. Possible values are: time, ip, msg, user
		*		@param {object} options.logger_path Relative path to a remote script that writes text messages to options.file
		*/
  	__constructor : function(options) { 
  			var _this = this;
  			this.options = $.extend(this.options, options); 
  			this.userAgent = this.getUserAgent();
  			// get client IP
  			if(this.options.logger_path !== '-1'){ 
					$.ajax({
						url: this.options.logger_path,
		 				success: function(res){ 
							_this.ip = res.ip;
						},
						dataType: 'json'
					});
				}				
				// clear
				$('#debug').html('');
		},
		
		name : 'log',
		options : {
			output: 'logfile', 
			debug_selector: '#debug', 
			prefix: '', 
			logfile:'log.txt', 
			parameter: 'time,ip,msg,user', 
			logger_path: '-1'//'../php/ip.php'
		}, // output: debug/logfile
		bucket : '',
		ip : '',
	
		/* ... */
		init : function(){},		
		
		/* -- */
		add : function(msg){
			//var logEntry = this.getLogTime()+', '+this.options.prefix+', '+this.getIP()+', '+msg+', '+this.getUserAgent()+'\n';
			
			//var logEntry = this.getLogTime()+', '+vi2.currentVideo+', '+', '+vi2.currentGroup+', '+vi2.userData.id+', '+msg+', '+this.getUserAgent()+'\n'; 
			//'clickcommentfromlist:'+val.name +' '+val.author+' '+ val.time 
			if(typeof msg === 'string'){
				console.log(msg);
				return;
			}else{
				console.log(msg.context);
			}
			var 
				pt = vi2.observer.player.currentTime();
				t = new Date()
				;
			t = t.getTime();
			
			var logEntry = {
				utc: 								t, 
				//phase: 						vi2.current,
				//date:  						String, 
				//time:  						String, 
				//group:  					vi2.currentGroup, 
				user:  						vi2.userData.id,   
				//user_name:  			String,
				//user_gender:			String,
				//user_culture:			String,
				//user_session:			Number,
				video_id:  				vi2.currentVideo,
				//video_file:  			String,
				//video_length:  		String,
				//video_language:  	String,
				action: msg,  /*{
					context: msg.context,
					action: msg.action,
					values: msg.values
				},						*/
				playback_time:		pt === undefined ? -1 : pt,
				user_agent:  			this.getUserAgent()
				//ip: 							String,
			
			};
			
			this.writeLog( logEntry );
			
			return;
		},
		
		/* -- */
		getLogs : function(){
			return this.bucket;
		},
		
		/* -- */
		getLogTime : function(){
			var date = new Date();
			var s = date.getSeconds();
			var mi =date.getMinutes();
			var h = date.getHours();
			var d = date.getDate();
    	var m = date.getMonth()+1;
    	var y = date.getFullYear();
    	//return date.getTime()+', ' + y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d)+', '+(h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds();
			return { 
				utc: date.getTime(), 
				date: y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d),
				time: (h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds()
			};	
		},
		
		/* -- */
		getIP : function(){
			return this.ip;
		},
						
		/* -- */
		getUserAgent : function(){
		 var ua = $.browser; 
  		return	navigator.userAgent.replace(/,/g,';');
		},
		
		/* -- */
		writeLog : function (entry){ 
			//$.post('php/log.php', { entry:entry });
			if(this.options.logger_path !== '-1'){ 
				$.post(this.options.logger_path, { data: entry }, function(data){}); 
			}
		}					
				
	
		
	}); // end class Log
	
/* 
* name: Vi2.Metadata
* author: niels.seidel@nse81.com
* license: MIT License
* description:
* depends on:
*  - lib: embedded java script
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:	
	- integrate it on server side
	- do we really need a rendering funtion?
	- complete metadata
	- think about sitemap.xml and dbpedia
	- bug: metadata width and height is Null since the video has not been loaded yet.
*/


Vi2.Metadata = $.inherit(/** @lends Vi2.Metadata# */
	{
			/** 
			*		@constructs 
			*		@param {object} options An object containing the parameters
			*/
  		__constructor : function( options ) { 
  			this.metadata = vi2.db.getMetadataById( vi2.observer.current_stream );
  			this.options = $.extend(this.options, options);
  			this.update();
  		},
  		
  		// defaults
  		options : { 
  			selector: '.metadata',
  			requiresMetatags: true, 
  			requiresDisplay: true
  		},
  		
  		
  		/** 
  		* Updates all metadata
  		*/
  		update: function(){
  			if( this.options.requiresDisplay ){
  				this.displayMetadata();
  			}
  			if( this.options.requiresMetatags){	 
  				this.buildMetaTags();
  			}	
  		},
  		
  	
  		/** 
  		* Displays metadata to the given selector
  		*/
  		displayMetadata : function(){
  			//var html = new EJS({url: vi2.templatePath+'vi2.metadata.ejs'}).render( this.metadata );
				//$( this.options.selector ).html( html );
  		},
  		
  		
  		/** 
  		* Append html meta tags to the DOM header in favour of SEO 
  		*/
			buildMetaTags : function(){ 
				$('head meta').each( function(i,val){ this.remove(); });
				$('head')
					.prepend('<meta content="text/html;charset=utf-8" http-equiv="Content-Type">')
					.prepend('<meta content="utf-8" http-equiv="encoding">')
					.prepend('<meta itemprop="duration" content="'+this.metadata.length+'" />')
					.prepend('<meta itemprop="height" content="'+ vi2.observer.player.height() +'" />')
					.prepend('<meta itemprop="width" content="'+ vi2.observer.player.width() +'" />')
					.prepend('<meta itemprop="uploadDate" content="'+this.metadata.date+'" />')
					//.prepend('<meta itemprop="thumbnailUrl" content="'+vi2.page_url+'img/thumbnails/iwrm_'+vi2.observer.current_stream+'.jpg" />')
					.prepend('<meta itemprop="contentURL" content="' + vi2.db.getStreamById( vi2.observer.current_stream ).video + '" />')
					//.prepend('<meta itemprop="embedURL" content="'+vi2.page_url+'#!'+vi2.observer.current_stream+'" />')
				;	
			}
}); // end class

/* 
* name: Vi2.Observer 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*	- clear overlay-container and other at updateVideo()
*	- allow page back, offer bread crumb menu, ...
*	- RSS: http://code.google.com/apis/youtube/2.0/reference.html
*/
	
Vi2.Observer = $.inherit(/** @lends Observer# */{
	
	/** 
	*		@constructs
	*		@params {object} options  
	*/
	__constructor : function(options) { 
		this.options = $.extend(this.options, options); 
		this.widget_list = {}; // Assoc Array is an Object // Object.size(this.widget_list)
		this.clock = new Vi2.Clock({}, this.options.clockInterval);  
		//this.init();	

		//this.testing();
	},
	
	// defaults
	name : 'observer',
	options : {
		id: 'start', 
		embed: true, 
		selector: '#screen', 
		clockInterval: 500, videoSelector: '#video1', videoWidth:500, videoHeight:375, videoControlsSelector:'.video-controls', markupType: 'wiki', childtheme:''},
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
		/*$(vi2.dom)
			.empty()
			.append(vi2.db.getVideoById(stream)); */
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
	*
	**/
	init : function(seek){  
		seek = seek === undefined ? 0 : seek;
		var _this = this;  
		var videoo = $('<video></video>')
				.attr('controls', false)
				.attr('autobuffer', true)
				.attr('preload', "metadata")
				.attr('id', this.options.videoSelector.replace(/\#|./,''))
				.addClass('embed-responsive-item the-video')
				.text('Your Browser does not support either this video format or videos at all');
		$(this.options.selector)
			.addClass('embed-responsive embed-responsive-16by9')
			.html(videoo); 
		this.player = new Video({
				embed: this.options.embed, 
				selector: this.options.videoSelector, 
				width:this.options.videoWidth, 
				height:this.options.videoHeight, 
				videoControlsSelector: this.options.videoControlsSelector, 
				theme:this.options.theme, 
				childtheme:this.options.childtheme,
				thumbnail: this.options.thumbnail, 
				seek:seek
			}, this); 
		this.clock.player = this.player;
		
		// some event bindings hooks
		$(this).bind('player.ready', function(e, id, i){ 
			_this.setAnnotations(); 
		});
	},
	
	
		/* --xxxx 
	init2 : function(seek){  
		seek = seek === undefined ? 0 : seek;
		var _this = this; 
		var videoo = $('<video></video>')
				.attr('controls', false)
				.attr('autobuffer', true)
				.attr('preload', "metadata")
				.attr('id', this.options.videoSelector.replace(/\#|./,''))
				.addClass('embed-responsive-item')
				.text('Your Browser does not support either this video format or videos at all');
		$(this.options.selector)
			.addClass('embed-responsive embed-responsive-16by9')
			.html(videoo); 
	
	},
	*/
	
	
	/**
	*
	*/
	setAnnotations : function(){   
		var _this = this; 
		this.clock.annotations = [];			 
		this.vid_arr = this.parser.run(); 
		
		$.each(_this.vid_arr[0].annotation, function(i, val){ 		
			_this.clock.addAnnotation(val); 
		}); 
		
		// initiate widgets
		$.each(_this.widget_list, function(j, widget){ 
			if( widget.type !== 'player-widget' ){ 
				widget.init( _this.vid_arr[0].annotation );			
			}else{ 
				widget.init(); 
			}	
		});
	},
  		
  		
	/** -
	checkVideo : function(){
		// proof against available videos
		if(!!document.createElement('video').canPlayType){
			var vidTest = document.createElement("video");
			oggTest = vidTest.canPlayType('video/ogg; codecs="theora, vorbis"');
			if (!oggTest){
				h264Test = vidTest.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
				if (!h264Test){
					console.log("Sorry. No video support.");
				}else{
					if (h264Test === "probably"){
						//document.getElementById("checkVideoResult").innerHTML="Yeah! Full support!";
					}else{
						//document.getElementById("checkVideoResult").innerHTML="Meh. Some support.";
					}
				}
			}else{
				if (oggTest === "probably"){
					//document.getElementById("checkVideoResult").innerHTML="Yeah! Full support!";
				}else{
					//document.getElementById("checkVideoResult").innerHTML="Meh. Some support.";
				}
			}
		}else{
			console.log("Sorry. No video support. xx");
		}
	}, 
		*/	
		
		
	/*
	*
	**/
	updateLocation : function(identifier, value){ 
		window.location.replace(window.location.href.split('#')[0] + '#!'+identifier+':'+value.replace(/\ /g, '_'));
	},
  		  		

	/*
	*
	**/
	addWidget : function(obj){ 

		var _this = this;   	
		obj.player = this.player; 
		this.clock.addHook(obj.name, obj);	

		if(obj.type === 'annotation'){   
			obj.appendToDOM( this.current_stream ); // former: this.options.id
			$(this.player).bind('annotation.begin.'+obj.name, function(e, a, b){ obj.begin(e, a, b);});
			$(this.player).bind('annotation.end.'+obj.name, function(e, a){ obj.end(e, a);});
		}	

		// xxx needs to be put into widgets
		switch(obj.name){
			case 'relatedVideos' :
				$(this.player).bind('video.end', function(e, a){ obj.showLinkSummary(); });
				break;  
			case 'log' :
				$(this.player).bind('log', function(e, msg){ obj.add(msg); });
				break;
		}
	
		// register widget	
		this.widget_list[obj.name] = obj;   
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
	*
	**/
	removeWidget : function(widget_name){
		// bugy?
		this.widget_list[widget_name] = 0;
	},
	
	
	/* 
	* append annotation data of widgets to DOM 
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
	*
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
		this.clock.startClock();
	},


	/*
	*
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
	
	
		
/* 
*	name: Vi2.Parser
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
	- separate widget-code 
	- popcorn.js export/import
	- scorm export?
	- show code box
	- inherit sub parser from Parser
	- write complex testing function
	- apply standard TTML: http://www.w3.org/TR/2010/REC-ttaf1-dfxp-20101118/#example
*/



var Parser = $.inherit(/** @lends Parser# */
	{
			/** 
			*		@constructs 
			*		@param {Selector} selector Indicates the DOM selector that contains markup code to be parsed
			*		@param {String} type Defines which markup, 'wiki' or 'html', is going to be parsed
			
			*/
  		__constructor : function(selector, type) {
  			this.selector = selector;
  			this.type = type;
  			//this.run();
  		},
  		
			vid_arr : [],
			selector : '',
			
			/* ... */
			run : function(){
				switch(this.type){
					case 'wiki' :
						return this.parseWiki();
					case 'html' :
						return this.parseHtml();
				}
			},	
			
			/* ... */
			parseWiki : function(){ 
				var _this = this;
			  var v_id = -1;
			  // dirty hack for mediawiki xxx
			  $(this.selector).val($(this.selector).val().replace(/\<p\>/, ''));
				// go through markup lines
  			$($(this.selector+' > p').text().split(/\n/)).each(function(i, val){ 
  				if(val.substr(0,8) == "[[Video:" || val.substr(0,8) == "[[video:"){ 
						// parse videos to sequence
						v_id++; 	  				  		
  					_this.vid_arr[v_id] = _this.parseWikiVideo(val);
	  				}else if(val.substr(0,2) == "[["){
	  				// parse hyperlinks related to the latter video 
  					_this.vid_arr[v_id]['annotation'].push(_this.parseWikiHyperlink(val)); //alert('ok_'+val);  					
  				}else{
  					//alert('bug_'+val);
  				}
  			}); 			
				return this.vid_arr;  			
			},
			
			/* ... */
			parseHtml : function(){ 
				var _this = this;
			  var v_id = -1;
			  var arr = [];
			  var obj = {};
  			$('div'+this.selector+' div').each(function(i, val){ 
  				if($(this).attr('type') == "video"){ 
  					// video
  					arr = {}; 
  					arr['id'] = $(this).attr('id'); 
  					arr['url'] = $(this).text();
  					arr['seek'] = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
  					arr['duration'] = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration');
  					arr['annotation'] = []; 
						v_id++; 
  					_this.vid_arr[v_id] = arr; 
  					
  				}else if($(this).attr('type') == "hyperlinks"){ 
  					// standard and external links
  					obj = {};
						obj.title = $(this).text(); 
						obj.description = $(this).attr('description');
						obj.target = $(this).attr('target');
						obj.linktype = 'standard';
						obj.type = 'hyperlinks';
						obj.author = $(this).attr('author');
						obj.date = $(this).attr('date');
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration');
						obj.seek = $(this).attr('seek');
						obj.duration2 = $(this).attr('duration2'); 

						// distinguish link types
						if(obj.target.match(/(^http:)(^https:)/)){ obj.linktype = 'external'; } // external link
  					
  					
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
  				}else if($(this).attr('type') == "cycle"){ 
  					// cycle
  					obj = {};
						obj.title = $(this).text();
						obj.target = $(this).attr('target');
						obj.description = $(this).attr('description');
						obj.linktype = 'cycle';
						obj.type = 'hyperlinks';
						obj.author = $(this).attr('author');
						obj.date = $(this).attr('date');
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration'); 
						obj.seek = $(this).attr('seek');
						obj.duration = $(this).attr('duration2'); 
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
  					 			
  				}else if($(this).attr('type') == "syncMedia"){
  					// sequential media such as pictures
  					obj = {};
						obj.title = $(this).text();
						obj.target = $(this).attr('path');
						obj.linktype = '';
						obj.type = 'syncMedia';
						obj.x = 0;
						obj.y = 0;
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
					}else if($(this).attr('type') == "map"){
  					// sequential media such as pictures
  					obj = {};
						obj.title = '';
						obj.target = $(this).text();
						obj.linktype = '';
						obj.type = 'map';
						obj.x = 0;
						obj.y = 0;
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  			
					}else if($(this).attr('type') == "toc"){
						// table of content references
						obj = {};
						obj.title = $(this).text();
						obj.target = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.type = 'toc';
						obj.note = $(this).attr('note');
						obj.author = $(this).attr('author');
						obj.date = $(this).attr('date');
						obj.x = 0;
						obj.y = 0;
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = 1;// default // $(this).attr('duration') == undefined ? 1 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
					}else if($(this).attr('type') == "tags"){
						// temporal tags
						obj = {};
						obj.title = $(this).text();
						obj.target = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.type = 'tags';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration');
						_this.vid_arr[v_id]['annotation'].push(obj);
	
					}else if($(this).attr('type') == "highlight"){
						// hight
						obj = {};
						obj.title = $(this).text();
						obj.target = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.type = 'highlight';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration');
						_this.vid_arr[v_id]['annotation'].push(obj);

					}else if($(this).attr('type') == "comments"){ 
						// comments
						obj = {};
						obj.title = $(this).text();
						obj.author = $(this).attr('author');
						obj.date = $(this).attr('date');
						obj.target = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.type = 'comments';
						obj.x = 0;
						obj.y = 0;
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = 1;// default // $(this).attr('duration') == undefined ? 1 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
					}else if($(this).attr('type') == "assessment"){ 
						// assessment
						obj = {};
						obj.title = $(this).data('task');
						obj.author = $(this).attr('author');
						obj.date = $(this).attr('date');
						obj.target = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.linktype = '';
						obj.type = 'assessment';
						obj.x = 0;
						obj.y = 0; 
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime'); 
						obj.t2 = 1;// default // $(this).attr('duration') == undefined ? 1 : $(this).attr('duration');
  					_this.vid_arr[v_id]['annotation'].push(obj);
  					
					}else if($(this).attr('type') == "assessment-fill-in"){ 
  					// standard and external links
  					obj = {};
						obj.title = $(this).attr('id');
						obj.target = $(this).text();
						obj.linktype = 'standard';
						obj.author = $(this).attr('author') == undefined ? '' : $(this).attr('author');
						obj.date = $(this).attr('date');
						obj.width = $(this).attr('width') == undefined ? 100 : $(this).attr('width');
						obj.type = 'assessment-fill-in';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration');
						obj.seek = $(this).attr('seek')
						obj.duration = $(this).attr('duration2')
  					_this.vid_arr[v_id]['annotation'].push(obj);
  				
  				}else if($(this).attr('type') == "assessment-writing"){ 
  					// standard and external links
  					obj = {}; 
						obj.title = encodeURIComponent( $(this).text() );//$(this).attr('id');
						obj.target = $(this).text();
						obj.linktype = 'standard';
						obj.author = $(this).attr('author') == undefined ? '' : $(this).attr('author');
						obj.width = $(this).attr('width') == undefined ? 100 : $(this).attr('width');
						obj.type = 'assessment-writing';
						obj.x = $(this).attr('posx');
						obj.y = $(this).attr('posy');
						obj.t1 = $(this).attr('starttime') == undefined ? 0 : $(this).attr('starttime');
						obj.t2 = $(this).attr('duration') == undefined ? 0 : $(this).attr('duration');
						obj.seek = $(this).attr('seek')
						obj.duration = $(this).attr('duration2')
  					_this.vid_arr[v_id]['annotation'].push(obj);
  				}
  				
  			});  	
  			
				return _this.vid_arr; 	
			},
  		
  		/* ... */ // all of that is quick & dirty and needs further testing / testing procedures
  		parseWikiVideo : function(str){

					var arr = [];
					var url, start, duration, id = '_';
  				str = str
  					.replace(/^\[\[Video:/, '') // start delimiter
  					.replace(/\]\]/, '') // end delimiter
  					.replace(/\# /, ' #') // start-time
  					.replace(/\| /, ' |') // duration
  					.replace(/  /, ' '); // double spaces
  				var a = str.split(/ /);
  				$.each(a, function(i, val){
  					if(val.substr(0,1) == '#'){ start = val.substr(1,val.length); }
  					else if(val.substr(0,1) == '|'){ duration = val.substr(1,val.length); }
  					else if(val.match(/(?=.ogg)/)){ url = val; }
  					else if(val.length > 0){ id = val; }
  				})
  				//alert('   url:'+url +' start:'+ start +'  duration:'+ duration +'  id:'+ id);
  				// build arr
  				arr['id'] = id;
  				arr['url'] = url;
  				arr['seek'] = start == undefined ? 0 : start;
  				arr['duration'] = duration == undefined ? 0 : duration;
  				arr['annotation'] = [];
  			return arr;
  		},
  		
  		/* ... */
  		parseWikiHyperlink : function(str){ 
  				var _this = this;
  				var re = "";
  				var tmp = '';
  				var obj = {};
  				obj.type = 'hyperlinks';
  				obj.linktype = 'standard';
  	
  				// link types // ?=.ogg | ?=.ogv | 
  				re = new RegExp(/^\[\[http:\/\//);
					if(str.match(re)){ 
						// external link
  					re = new RegExp(/\[\[http:\/\/[a-z A-Z 0-9 \#\ \_\/:.-]+/);
  					tmp = (new String(re.exec(str))).split(" ");
						obj.target = tmp[0].replace(/^\[\[/,'');
						obj.title = tmp.length >= 2 ? tmp.slice(1) : tmp[0].replace(/^[\[\[http:\/\/]/, '');
						obj.title = (new String(obj.title)).replace(/,/g,' ');
  					//alert(obj.target+' - '+obj.title);
						obj.linktype = 'external'; 
					}else{
						// standard links
  					re = new RegExp(/\[\[[a-z A-Z 0-9 \# \ \_\/\|:.-]+/);
  					tmp = (new String(re.exec(str))).split(/\|/);
						obj.target = tmp[0].replace(/^\[\[/,'');
						obj.title = tmp.length >= 2 ? tmp[1] : tmp[0].replace(/^\[\[/,'');
  					//alert(obj.target+' - '+obj.title);
					}
					//alert(obj.target +'  '+ obj.linktype);						
  				//alert(tmp.length+'  '+obj.title);
  		
					// strip start time and duration
					var str2 = str.split(/\]/);
					re = new RegExp(/[\ ]\#[0-9]+/);  				
  				obj.t1 = str.match(re) ? (new String(re.exec(str2[1]))).replace(/[\#]/, '') : 0; // .replace(/|\ /,'')
					re = new RegExp(/[\ ]\|[0-9]+/);  				
  				obj.t2 = str.match(re) ? (new String(re.exec(str2[1]))).replace(/[\|]/, '') : 1000;
//					alert(obj.t1+' - '+obj.t2);
					
					// relative width/height: 50% 20%
					re = new RegExp(/[\ ]+[0-9]{2}(?=\%)/g);
					tmp = str.match(re) ? new String(str.match(re)).split(/,/) : [50,50];
					obj.x = tmp[0] ? tmp[0] : 50;
					obj.y = tmp[1] ? tmp[1] : 50;			
					//alert(''+obj.x+' - '+obj.y+'   time: '+obj.t1+' - '+obj.t2);
					
					 return obj;
  		}

  });
	
/* 
*	name: Vi2.Utils
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*/


////////////////////////////////
/* Defines custom drop out box  (style: #div.klappe)*/
		jQuery.fn.dropdown = function(obj) {
				var head = $(this).find('h4');
				var all = $(this).html();
				$(this).toggle(
					function(){
						$(this).html(head.wrapInner('<h4></h4>').html());
					},
					function(){
						$(this).html(all).find('h4').attr('style','background-image:url(images/arrow_d.png); display:inline;');
					}
				).click();
			};

////////////////////////////////
/* ...*/
		jQuery.fn.hidetext = function(obj) {
			var text = $(this).text();
			var el = $(this).text(text.substr(0, 250)+' ').append($('<span>more</span>')); //.button()
			return el;
			};
			
			
////////////////////////////////			
		jQuery.fn.round = function(dec) {	
	    if (!dec) { dec = 0; }
    	return Math.round(this*Math.pow(10,dec))/Math.pow(10,dec);
  	};

//////////////////////////////
function delegate(obj, func){
	var f = function() {
		var target = arguments.callee.target;
		var func = arguments.callee.func;
		return func.apply(target, arguments);
	}; 
	f.target = obj;
	f.func = func; 
	return f;
}

//////////////////////////////
function removeDuplicates (cat){
	cat = cat.sort();
  for(var i = 1; i < cat.length;){
  	if(cat[i-1] == cat[i]){ cat.splice(i, 1); } 
  	else { i++; }
  }
  return cat;     
}


/*
* calcs temporal distance to a given time stamp
**/
function timeDifference (s, prefix, postfix){
			//prefix = prefix === undefined ? 'vor ' : prefix;
			//postfix = postfix === undefined ? ' ago' : postfix; 
			
			var b = moment( s );  
			var a = moment( s ); 
			
			
			var diff = a.diff(b, 'seconds'); 
			if(diff <= 60 ){
				return prefix + diff.toFixed(1) + 's' + postfix; 
			}
			
			diff = a.diff(b, 'minutes'); 
			if(diff <= 60){
				return prefix + diff.toFixed(1) + 'min' + postfix;
			}
			
			diff = a.diff(b, 'hours', true); 
			if(diff <= 24){
				return prefix + diff.toFixed(1) + 'h' + postfix; 
			}
			
			diff = a.diff(b, 'days', true); 
			if(diff < 30){
				return prefix + diff.toFixed(1) + 'd' + postfix; 
			}
			
			diff = a.diff(b, 'months', true);
			if(diff < 12){
				return prefix + diff.toFixed(1) + 'm' + postfix; 
			}
			
			diff = a.diff(b, 'years', true);
			return prefix + diff.toFixed(1) + 'y' + postfix; 
			
}




/////////////////////////////
Object.size = function(obj) {
    var 
    	size = 0, 
    	key = {}
    	;
    for (key in obj) {
        if (obj.hasOwnProperty(key)){
        	size++;
        }	
    }
    return size;
};



Vi2.Utils = $.inherit(/** @lends Utils # */{

	/** 
	*		@constructs 
	*		
	*/
	__constructor : function(options) { },
	
	name : 'utils',
	
	
	/* Converts seconds into decimal format */
	seconds2decimal : function(seconds) {
		d = Number(seconds);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "00:") + (s < 10 ? "0" : "") + s); 
	},
	
	/* 
	*Converts decimal time format into seconds 
	**/
	deci2seconds: function( decimal ){
		if(Number(decimal) < 0 || decimal === undefined ){ return 0; }
		var arr = decimal.split(':');
		return Number(arr[0])*3600+Number(arr[1])*60+Number(arr[2]);
	}
	
}); // end utils


/* 
*	name: Vi2.VideoManager
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: Implements a journaled naviagtion for browsing back and forth in a collection of videos.
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:

- kann templates laden und für seine kinder (e.g. related videos verarbeiten)


- listen to url changes and load videos and views
- list streams by category / tag / author / date / ...
- offers different rendering styles: 
Karussell, Liste, Card-Deck, Matrix, Stack, Video-Wall, Slide-Row, Slide-Matrix, ...
- sort order, change sort order .. sort by..

*/



Vi2.VideoManager = $.inherit(/** @lends Vi2.VideoManager# */{ // 

	/** 
	*		@constructs 
	*		@param {object} options An object containing the parameters
	*/
	__constructor : function(options) { 
		this.options = $.extend(this.options, options); 
	},
	
	name : 'video-manager',
	type : 'collection',
	content_selector : '#content',
	options : {
		selector : '#seq'
	},
	viewing_history : [],

	/**
	* Define paths that the video manager is listing to. 
	*/
	init : function(){  
		var _this = this; 
		
		// define default get routes
		Sammy(this.options.selector, function() { 
        
        this.get('#!/video/:stream/:time', function() {
        	_this.handleNewStream( this.params );
        });
     
        this.get('#!/video/:stream', function() {
        	_this.handleNewStream( this.params );
        });
        
        this.get('#!/videos/all', function() {
        	_this.handleAllStreams( );
        });
        
        this.get('#!/tags/:tag', function() {
        	_this.handleTags( this.params );
        });
        
        this.get('#!/category/:category', function() {
        	_this.handleCategory( this.params );
        });
        
      }).run();	
	},
	
	
	/*
	* Interface for other widgets to define routes that will be handled on their own
	* @params path {String} Path under which the the given callback function should called. For instance http://example.com/#<my-path>. The '#' is set by default and should therefore be excluded.
	* @params callback {Object}
	* @params fn {Object}
	**/
	addRoute : function(path, callback, fn){
		Sammy(this.options.selector, function() { 
		  this.get('#!'+path, function() {
		  	callback[fn]();
		  });
		}).run();
	},
	
	
	/*
	* Calls the given template from the defined template path in order to render the given data.
	**/
	render : function(template, data){ 
			return new EJS( { url: vi2.templatePath+''+template} ).render( data );
	},
	
	
	/**
	* This functions process a comma separated list of tags in order to identify the video streams that are related to these tags
	*/
	handleTags : function(params){ 
		var tags = params.tag.split(/,/); 
		var stream_names = '';
		var streams = [];
		var inverted = vi2.db.getInvertedTagIndex();
		
		for(var i = 0; i < tags.length; i++){
			if( inverted[tags[i]] !== undefined ){ 
				stream_names += inverted[tags[i]].toString() +',';
			}	
		}
		var t = []; t = removeDuplicates( stream_names.split(/,/) ); 
		for( var s = 0; s < t.length; s++){ 
			if( t[s]  !== ''){
				var str = vi2.db.getStreamById( t[s] );
				streams.push( str ); 
			}
		}
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Tags: ' + tags.toString(), items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* This functions process a single given category 
	*/
	handleCategory : function(params){ 
		var category = params.category; 
		var streams = vi2.db.getStreamsByCategory( category );
		
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Category: ' + category, items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* This functions processes all stream 
	*/
	handleAllStreams : function(params){ 
		var streams = vi2.db.getAllStreams();
		// render it
		var html = this.render('vi2.video-manager.ejs', { title: 'Category: ' + category, items: streams } );
		$( this.options.selector ).html( html );
	},
	
	
	/**
	* Load a new video stream and naviagte to the give position in time.
	*/
	handleNewStream : function(params){ 
		var _this = this;
		var seek = params.time === undefined ? 0 : params.time.split(/:/)[1];
  	if( params.stream != vi2.observer.current_stream ){ 
    	$(vi2.dom).empty(); 
    	vi2.observer.setCurrentStream( params.stream, seek ); 
			vi2.observer.player.play(); 
			_this.loadWidgets();
		}else{
			vi2.observer.player.currentTime( seek );
		}	
	},
	
	
	
	/**
	*
	*/
	loadWidgets : function(){
	
		// Define some annotation widgets
	 	var toc = new Vi2.TableOfContents( { 
	 		hasTimelineMarker: true, 
	 		hasMenu: true, 
	 		menuSelector:'.toc' 
	 	} );
		
		// Synchronize some presentation slides as 
		var syncMedia = new Vi2.SyncronizeMedia( { 
			selector: '.syncMedia', 
			hasTimelineMarker: true, 
			hasMenu: true, 
			menuSelector:'.toc' 
		} );
		
		//var userNotes = new Vi2.UserNotes();
		
		// With these widgets we make use of the video database
		
		var relatedVideos = new Vi2.RelatedVideos( { 
			resultSelector: '.related-videos', 
			criteria:[
				{ criterion: 'random-destructor', weight:0.1 },
				{ criterion: 'same-author', weight:0.8 }, 
				{ criterion: 'same-tags', weight:0.6 },
				{ criterion: 'incomming-links', weight:0.5 },
				{ criterion: 'outgoing-links', weight:0.5 }
				] 
		} );
		//relatedVideos.init();
		
		var inVideoSearch = new Vi2.Search( {
			resultSelector: '.search-results', 
			limit: 25
		} );
		//inVideoSearch.find('water basin');
		
		
		// add all the widgets
		vi2.observer.addWidget( toc );
		vi2.observer.addWidget( syncMedia );
		
			
		vi2.observer.addWidget( relatedVideos );
		//vi2.observer.addWidget( userNotes );
		//vi2.observer.addWidget( inVideoSearch );
	
	
	},




	
	
	
	/* buggy ... */
	listAllItems : function(){
			var template = $("#item_template").val();
			
		// list items of all categories		
		$.each(this.getCategoryTaxonomie(), function(i, cat_name){
			// cat name
			$(_this.content_selector).append($("<h2></h2>").addClass('cat'+i).text(cat_name)).append('<br>');
			$.each(_this.json_data.stream, function(i, stream){
				if(stream.metadata[0].category == cat_name){
					var item =$('<div></div>')
						.setTemplate(template)
						.processTemplate(stream)
						.appendTo($(_this.content_selector));
						//$('div.hyphenate').hyphenate({remoteloading:true,});//.css('color','red');
						//$('.text').hidetext();						
				}
			});		
		});
	
	}
	
	
	
}); // end class VideoManager		
/* 
* name: Vi2.VideoPlayer 
*	author: niels.seidel@nise81.com
* license: MIT License
* description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
 - variablen aufräumen
 - bug: keydown binding vary in different browsers
 -- onliest fix: https://github.com/google/closure-library/blob/master/closure/goog/events/keyhandler.js
 
 - add getter and setter for quality, playback status, video information, next, previous, playback rate

 - @createVideoHiding: build function to turn of the video screen in order to listen to the audio only.
	- YOuTube http://coding-everyday.blogspot.de/2013/03/how-to-grab-youtube-playback-video-files.html
 - visualize loaded bytes
  - simultanous playback of two clips
 - cache mangement for videos: http://www.misfitgeek.com/2012/10/html5-off-line-storing-and-retrieving-videos-with-indexeddb/
 - refine cycle including event bindings


 - manage to play parts of a video: http://www.xiph.org/oggz/doc/group__seek__api.html
- options: supported codecs / mime types
 - further: API calls: http://code.google.com/apis/youtube/js_api_reference.html
 - media fragment URI ..parser ..:: http://tomayac.com/mediafragments/mediafragments.html


 \begin{lstlisting}

\\ normal playback time
Schema: t=npt:<start-in-seconds>,<end-in-seconds>
Beispiel: t=npt:10,20 
.
t=120s,121.5s
Shema: t=npt:<m>,<s>.<ms>:<h>:<m>.<ms>
Beispiel: t=npt:120,0:02:01.5

// SMPTE timecode standard ... wie bei DVDs
Schema: t=smpte-<frame-rate>:<h>:<m>:<s>,<h>:<m>:<s>.<ms>
t=smpte-30:0:02:00,0:02:01:15
t=smpte-25:0:02:00:00,0:02:01:12.1


t=npt:10,20 			# => results in the time interval [10,20[
t=,20 						# => results in the time interval [0,20[
t=smpte:0:02:00, 	# => results in the time interval [120,end[


// Räumliche Dimension
Schema: #xywh=<einheit>:<x>:<y>:<width>:<height>
Beispiel: #xywh=pixel:10,10,30,30


track=1&track=2 track=video
track=Kids%20Video
# => results in only extracting track ’1’ and ’2’
# => results in only extracting track ’video’
# => results in only extracting track

xywh=160,120,320,240
# => results in a 320x240 box at x=160 and y=120
xywh=pixel:160,120,320,240 # => results in a 320x240 box at x=160 and y=120
xywh=percent:25,25,50,50 # => results in a 50%x50% box at x=25% and y=25%

// Named dimension
id=1 # => results in only extracting the section called ’1’
id=chapter-1 # => results in only extracting the section called ’chapter-1’
id=My%20Kids # => results in only extracting the section called ’My Kids’

\end{lstlisting}


https://developer.mozilla.org/en/Configuring_servers_for_Ogg_media
#1 determine duration
$ oggz-info /g/media/bruce_vs_ironman.ogv

#2 hard code duration for apache2 in the .htaccess-file of the media folder
<Files "elephant.ogv">
Header set X-Content-Duration "653.791"
</Files>


http://dev.opera.com/articles/view/everything-you-need-to-know-about-html5-video-and-audio/
*/



var Video = $.inherit(/** @lends VideoPlayer# */
{
	/** 
	* 	@constructs 
	*		@param {object} options An object containing the parameters
	*		@param {Observer} observer Observer of VI-TWO
	*/
  __constructor: function(options) { 
		this.options = $.extend(this.options, options); 
		// init spinner
		this.spinner = new Spinner(this.spinner_options); //this.stopSpinning();
		this.video = document.getElementById( (this.options.selector).replace(/\#/,'') );  
  	this.loadUI();
  },

	name: 'video player',
	// defaults
	options: {
		observer: null, 
		selector: '#video1', 
		width: 500, 
		height: 375, 
		seek:0, 
		videoControlsSelector: '.video-controls', 
		thumbnail:'/static/img/placeholder.jpg', 
		defaultVolume : 0 // 0..1
	},
	video: null,
	timeline : null,
	observer: null,
	url: '',

	/* selectors */
  video_container: null,
	video_wrap: null,
	play_btn: null,
	volume_btn: null,
	
	/* flags */
	volume: null,
	isMuted: false,
	isSequence: false,
	seqList: [],
	seqNum: null,
	seqLoop: false,
	videoIsPlaying: true,
	percentLoaded: 0,
	buffclick: 0,
	
	/* spinner options */
	spinner : false,
	spinner_options : {
  	lines: 6, // The number of lines to draw
  	length: 0, // The length of each line
  	width: 20, // The line thickness
  	radius: 20, // The radius of the inner circle
  	color: '#003366', // #rgb or #rrggbb
  	speed: 1, // Rounds per second
  	trail: 89, // Afterglow percentage
  	shadow: false, // Whether to render a shadow
  	hwaccel: false, // Whether to use hardware acceleration
  	className: 'spinner', // The CSS class to assign to the spinner
  	zIndex: 29, // The z-index (defaults to 2000000000)
  	top: 'auto', // Top position relative to parent in px
  	left: 'auto' // Left position relative to parent in px
	},
	

	/* load video */
	// param: url= url of video; seek = time seek within video in seconds
	loadVideo: function(url, seek) {   
		var _this = this;
		this.url = url;
	  this.seek = seek === undefined ? 0 : seek;
	  
	  var videoo = $('<video></video>')
				.attr('controls', false)
				.attr('autobuffer', true)
				.attr('preload', "metadata")
				.attr('id', 'video1')
				.addClass('embed-responsive-item')
				.text('Your Browser does not support either this video format or videos at all');
		$('#seq')
			.addClass('embed-responsive embed-responsive-16by9')
			.html(videoo); 
	  this.video = document.getElementById( ( this.options.selector ).replace(/\#/,'') );
	 
	  if(this.videoIsPlaying){
	  		$(vi2.observer.player).trigger('player.play', []);
	  }
	  this.video.pause();
		this.startSpinning(); 
		
		var supportedCodec = this.detectVideoSupport();
		this.video = $.extend( this.video, {
			loop: false,
	  	preload: 'metadata', // 'metadata' | true ??
	  	autoplay: this.videoIsPlaying,
	  	controls: false,
	  	poster: '/static/img/placeholder.jpg',
	 		// 	width: this.options.width,
	  	//	height: this.options.height,
	  	onerror: function(e) { _this.errorHandling(e); }
		});
		
		// add timeline
		this.timeline = new Vi2.AnnotatedTimeline( this.video, {}, this.seek );
		
		// add playback logger
		this.logger();
		
		var playbackSpeed = new Vi2.PlaybackSpeed();
		vi2.observer.addWidget( playbackSpeed );  
		
		//var temporalBookmarks = new Vi2.TemporalBookmarks();
		//vi2.observer.addWidget( temporalBookmarks );
		
		//var zoom = new Vi2.Zoom();
		//vi2.observer.addWidget( zoom );	
		
		var skipBack = new Vi2.SkipBack();
		vi2.observer.addWidget( skipBack );
		
		//var sharing = new Vi2.Sharing();
		//vi2.observer.addWidget( sharing ); // http://localhost/elearning/vi2/vi-two/examples/iwrm/videos/iwrm_seidel1.webm
		
		this.play_btn = $('.vi2-video-play-pause');
		
		this.video.addEventListener('play', function(e){ 
			vi2.observer.clock.startClock();
			$('header').hide();
			_this.play_btn.find('.glyphicon-pause').show();
			_this.play_btn.find('.glyphicon-play').hide();
		});
		
		this.video.addEventListener('pause', function(e){ 
			vi2.observer.clock.stopClock();
			$('header').show();
			_this.play_btn.find('.glyphicon-pause').hide();
			_this.play_btn.find('.glyphicon-play').show();
		});
		
		this.video.addEventListener('abort', function(e){  
			vi2.observer.clock.stopClock();
			$('header').show();
			_this.play_btn.find('.glyphicon-pause').hide();
			_this.play_btn.find('.glyphicon-play').show();
		});

		// event binding: on can play
		this.video.addEventListener('readystate', function(e) { 
			_this.readyStateHandler(e); 
		});

		// event binding: on time update
		this.video.addEventListener('timeupdate', function(e) { 
			_this.timeUpdateHandler(e); 
		});
		
		// event binding: on ended
		this.video.addEventListener('ended', function(e) { 
			_this.endedHandler(e); 
		}, false);

		
	// trigger event that a new video stream has been loaded
			var t = new Date();
			$(vi2.observer).trigger('stream.loaded', { 
				stream: vi2.observer.current_stream,//params['stream'], 
				playback_time: seek,//params['time'], 
				time: t.getTime()
			} );	

 	// get sources and load video
	 	if( url !== undefined){
			$( this.video ).html( this.createSource(url, supportedCodec ), this.video.firstChild);	 
		}
	 
	},


	/* HTML5 playback detection 
	* 	returns: mime type of supported video or empty string if there is no support
	*		called-by: loadVideo()
	* 	toDo: check support for video element
	**/
	detectVideoSupport: function() {
		var dummy_video = document.createElement('video');

		// prefer mp4 over webm over ogv 
		if (dummy_video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') !== '') {
			vi2.observer.log({context:'player',action:'video-support-mp4', values:['1'] });
			return 'video/mp4'; 		
		}else if (dummy_video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '') {
			vi2.observer.log({context:'player',action:'video-support-webm', values:['1'] });
			return 'video/webm'; 
		}else	 if(dummy_video.canPlayType('video/ogg; codecs="theora, vorbis"') !== ''){
			vi2.observer.log({context:'player',action:'video-support-ogv', values:['1'] });
			return 'video/ogv';
		}else{
			// no suitable video format is avalable
			vi2.observer.log({context:'player',action:'video-support-none', values:['1'] }); 
			$('#page').html('<h3>We appologize that video application is currently not supported by your browser.</h3>The provided video material can be played on Mozilla Firefox, Google Chrome and Opera. If you prefer Internet Explorer 9 you need to install a <a href="https://tools.google.com/dlpage/webmmf">webm video extension</a> provided by Google. In the near future we are going to server further video formats which will be supported by all major browsers.<br /><br /> Thank you for your understanding.');
		}
		return '';
	},

	/* load sequence */
	loadSequence: function(sources, num, seek) {  
		this.seqList = sources;
		this.seek = seek;
		this.isSequence = true;
		if (num === undefined) {
			this.seqNum = 0;
		}else {
			this.seqNum = num;// % this.seqList.length;
		} 
		this.loadVideo(this.seqList[this.seqNum].url, this.seek);
	},


	/** 
	* build video source element
	* @param src = video url; mime_type = mime_type of video
	*	@returns: video source element including src and type attribute
	*/
	createSource: function(src, mime_type) { 
  	var source = document.createElement('source'); 
  	// extract file type out of mime type
  	source.src = src+"?foo="+(new Date().getTime());//src.replace('.webm', '') + '.' + mime_type.replace('video/', '');
  	// set mime type
  	source.type = mime_type;
  	return source;
	},



	/** 
	* load UI 
	**/
	loadUI: function() { 
		var _this = this;
		// load other ui elements
		this.createPlaybackControl();
		this.createVolumeControl();
		this.createVideoHiding();
		
		
		// show/hide video controls
		$(_this.options.videoControlsSelector).addClass("open-controls");
		$("#video1, #overlay, #seq").hover(
			function() {  
		  	$(_this.options.videoControlsSelector).addClass("open-controls");
			}, 
			function() { 
		  	$(_this.options.videoControlsSelector).removeClass("open-controls");
			}
		);
		//$('#overlay').css('height', $('video').height() );
		//$('#overlay').css('width', $('#video1').width() );
		
		
		// hide cursor and controls if inactive
		var mouseTimer = null, cursorVisible = true;

		function disappearCursor() {
		    mouseTimer = null; 
		    document.body.style.cursor = "none";
		    cursorVisible = false;
		    $(_this.options.videoControlsSelector).removeClass("open-controls");
		}
		var el = document.getElementById('video1');
		document.onmousemove = function() {
		    if (mouseTimer) {
		        window.clearTimeout(mouseTimer);
		    }
		    if (!cursorVisible) {
		        document.body.style.cursor = "default";
		        cursorVisible = true;
		        $(_this.options.videoControlsSelector).addClass("open-controls");
		    }
		    mouseTimer = window.setTimeout(disappearCursor, 1000);
		};
		
		$('body').unbind('keydown').bind('keydown', function(e) { 
			//_this.keyboardCommandHandler(e); 
		});
		
	},
	
	/**
	* Creates video playback control
	*/
	createPlaybackControl : function(){
		var _this = this;
		
		this.play_btn = $('.vi2-video-play-pause');
		
		
		this.play_btn.bind('click', function() {
			_this.play(); 
		});

		$(this.play_btn).bind('play', function(e) {  
			vi2.observer.play();
			$('.screen').remove();
		});

		$(this.play_btn).bind('pause', function(e) { 
			vi2.observer.pause();
		});
		
		$(vi2.observer.player).bind('player.play', function(e, a, b) { 
  			$('.navbar').hide();
  	});
  	
  	$(vi2.observer.player).bind('player.pause', function(e, a, b) { 
  			$('.navbar').show();
  			
  	});
	},


	/** 
	* Creates a volume control element 
	*/
	createVolumeControl : function(){ 
		var _this = this;
		// intit controls
		this.volume = $('.vi2-volume-slider', this.video_container);
		this.volume_btn = $('.vi2-volume-button', this.video_container);
		// init slider
		$(this.volume).slider({
				orientation: 'horizontal',
				range: 'min',
				max: 1,
				step: 0.05,
				animate: true,
				value : _this.options.defaultVolume,
				slide: function(e,ui) { 
					if(ui.value > 0 && ui.value < 0.5 ){ 
						_this.isMuted = false;
						_this.volume_btn.addClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
					}else if( ui.value >= 0.5 ){
						_this.isMuted = false;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.addClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
						
					}else{
						_this.isMuted = true;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.addClass('glyphicon-volume-off');
					}
					//_this.video_volume = parseFloat(ui.value);
				},
				change : function(e,ui){
					// set video volume
					_this.video.volume = ui.value;
					// button states
					if(ui.value > 0 && ui.value < 0.5 ){ 
						_this.isMuted = false;
						_this.volume_btn.addClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
					}else if( ui.value >= 0.5 ){
						_this.isMuted = false;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.addClass('glyphicon-volume-up');
						_this.volume_btn.removeClass('glyphicon-volume-off');
						
					}else{
						_this.isMuted = true;
						_this.volume_btn.removeClass('glyphicon-volume-down');
						_this.volume_btn.removeClass('glyphicon-volume-up');
						_this.volume_btn.addClass('glyphicon-volume-off');
					}
					//_this.video_volume = parseFloat(ui.value);
				}	
		});
		
		this.volume_btn
			.bind('click', function(e) {
				_this.muteVolume();
			})
			;
			
		if( this.volume.slider('value') === 0 ){
			this.isMuted = true;
			this.volume_btn.addClass('glyphicon glyphicon-volume-off');
		}else{
			this.volume_btn.addClass('glyphicon glyphicon-volume-up');
		}
		
		// set initial volume
		// xxx does not work
			
	},
	
	/**
	* Get volume
	*/
	getVolume : function(){
		return this.volume.slider('value');//this.video_volume;
	},
	
	
	/**
	* Set volume
	* @param volume {Number} Number in the range of 0 and 1. Every value outside that rang will be changed to the boundaries. 
	*/
	setVolume : function(volume){
		vi2.observer.log({context:'player',action:'set-volume', values:[volume] }); 
		this.volume.slider('value', volume);
	},
	
	
	/** 
	* Increases audio volume by 5 percent 
	*/
	increaseVolume : function(){ 
		$(this.volume).slider('value', $(this.volume).slider('value') + 0.05 );
	},
	
	
	/** 
	* Decreases audio volume by 5 percent 
	*/
	decreaseVolume : function(){
		$(this.volume).slider('value', $(this.volume).slider('value') - 0.05 );
	},


	tmp_volume : 0,
	/** 
	* Toggles the button to mute/unmute the volume. If volume get unmuted the volume will be reset to the value it had befor muting.
	*/
	muteVolume: function() { 
		if( ! this.isMuted) {
			tmp_volume = this.volume.slider('value');
			this.setVolume(0);
			this.isMuted = true;
		}else {
			this.setVolume( tmp_volume );
			this.isMuted = false;
		}
	},



	
	
	
	
	/* Creates controle element to hide/show the video frame 
	*	xxx todo: this should be accomplished with a audio description and other accessibility assistance
	*/
	createVideoHiding: function(){
		
		// hide moving picture in order limit visual cognition channel to one
		// xxx: #screen should be replaced by an option
		var o = new Image(); 
		$(o).attr('src', this.options.thumbnail).addClass('toggle-pair').prependTo('#screen').hide();//.attr('src', 'img/thumbnails/iwrm_'++'.jpg')
		$(this.video).addClass('toggle-pair');
		var hidden = true;
		var btn = $('<span></span>')
			.addClass('toggle-moving-picture')
			.text('hide video')
			.prependTo('#screen')
			.click(function(){
				$(this).text(hidden ? 'show video' : 'hide video');
				hidden = ! hidden; 
				$('#screen').find('.toggle-pair').toggle();
			});
			$('#screen').find('.toggle-pair').toggle().hide();
			$('.toggle-moving-picture').hide();
		
	},
	

/********* LOADING Indicator *********************************/

	/* 
	* Starts the loading indicator in terms of a spinner. Function is called if video data is loading 
	**/
	startSpinning : function(){
		this.spinner.spin(document.getElementById('overlay'));
		$('.spinner').css('top','200px'); // xxx hardcoded repositioning of spinner element
	},

	/* 
	* Stops the loading indicator 
	**/
	stopSpinning : function(){
		this.spinner.stop();
	},



/* EVENT HANDLER *************************/


	

	/** 
	* event handler: on can play. Notifies the observer about a new video.
	*/
	readyStateHandler: function(e) {
		vi2.observer.updateVideo(this.seqList[this.seqNum].id, this.seqNum);
	},


	/* 
	* event handler: on time update
	**/
	timeUpdateHandler: function(e) {
		if ( this.video.readyState === 2 ) {
			this.startSpinning(); 
		}else if ( this.video.readyState === 4 ) {
			this.stopSpinning();
		}
	},


	/*
	* event handler: on ended
	**/
	endedHandler: function(e) { 
		vi2.observer.log({context:'player',action:'video-ended', values:[ this.url ]});
		vi2.observer.ended();
		this.video.removeEventListener('ended', arguments.callee, false);
		//this.play_btn.removeClass('vi2-video-pause');
		//this.play_btn.addClass('vi2-video-play');
		// load next video clip if its a sequence
		if (this.isSequence && ((this.seqNum + 1) < this.seqList.length || this.seqLoop)) {
			this.seqNum = (this.seqNum + 1) % this.seqList.length;
			this.loadVideo(this.seqList[this.seqNum].url);
		}else { 
			$(vi2.observer.player).trigger('video.end', null);
		}
	},
	
	
	/* 
	* Handles certain keyboad commends 
	**/
	keyboardCommandHandler : function(e){	
		
		e.preventDefault();
		this.video.focus();
		switch (e.which) {
			case 32: // space 
				this.play(); //
				break;
			case 189: // minus 173  oder 189
				vi2.observer.getWidget('playbackSpeed').decreaseSpeed();
				break;
			case 187: // plus 171 oder 187
				vi2.observer.getWidget('playbackSpeed').increaseSpeed();
				break;
			case 	38: // arrow up
				this.increaseVolume(); // volume control
				break;
			case 40: // arrow down
				this.decreaseVolume(); // volume control
				break;
			case 77: // m 
				this.muteVolume();// volume mute	
				break;
			case 39: // 39: right 
				vi2.observer.widget_list.toc.nextElement();
				break;
			case 37: // 37:left		
				vi2.observer.widget_list.toc.previousElement();
				break;
			case 34: // 39: right  presenter
				vi2.observer.player.play();
				//vi2.observer.widget_list.toc.nextElement();
				break;
			case 33: // 37:left		presenter
				vi2.observer.widget_list.toc.previousElement();
				break;	
		}
		this.video.focus(); 
	},



	/* INTERFACES *************************/

	/* just play */
	play: function() {   //alert(2)
		if ( this.video.paused === false) { 
			this.video.pause(); 
			this.isPlaying(false);
			$(vi2.observer.player).trigger('player.pause', []);
			vi2.observer.clock.stopClock();
			vi2.observer.log({context:'player',action:'pause-click', values:['1'] }); 
		} else {  
			this.video.play(); 
			this.isPlaying(true);
			$(vi2.observer.player).trigger('player.play', []);
			vi2.observer.clock.startClock();
			vi2.observer.log({context:'player',action:'play-click', values:['1'] }); 
			
		}
	},

	/* just pause */
	pause: function() {
		this.video.pause();
		this.isPlaying(false);
		$(vi2.observer.player).bind('player.pause');
		vi2.observer.log({context:'player',action:'pause2-click', values:['1'] }); 
	},
	
	/*
	**/
	isPlaying : function(x){
		if( x === undefined){
			return this.videoIsPlaying;
		}else{
			this.videoIsPlaying = x;
		}
	},

	/* returns duration of video */
	duration: function() {   
		return this.video.duration; //$(this.options.selector).attr('duration');
	},

	/* return current playback time or set the time */
	currentTime: function(x) { 
		if (x === undefined) {
			return this.video.currentTime; //$(this.options.selector).attr('currentTime');
		}else { 
			$(this.video).trigger('play');
			this.video.currentTime = x;
			this.play();
			
		}
	},

	/* sets or returns video width */
	width: function(x) {
		if (x === null) {
			return $('#video1').width();
		}else {
			this.video.width = x;
		}
	},

	/* sets or return video width */
	height: function(x) {
		if (x === null) {
			return $('#video1').height();
		}else {
			this.video.height = x;
		}
	},
	

	/* prints errors */
	errorHandling: function(e) { //alert(e)
//		console.log('Error - Media Source not supported: ' + this.video.error.code == this.video.error.MEDIA_ERR_SRC_NOT_SUPPORTED); // true
//	 	console.log('Error - Network No Source: ' + this.video.networkState == this.video.NETWORK_NO_SOURCE); // true
	},
	
	
	/*
	* Logger
	**/
	logger : function(){
		var
			_this = this,
			interval = 5,
			lastposition = -1, 
    	timer
    	;
    	
		function loop() {
        var currentinterval;
        currentinterval = (Math.round( _this.currentTime() ) / interval) >> 0;
        //console.log("i:" + currentinterval + ", p:" + player.getPosition());
        if (currentinterval != lastposition) { 
            vi2.observer.log({context:'player', action:'playback', values:[ currentinterval ]});
            lastposition = currentinterval;
        }
    }

    function start() { 
        if (timer) {
            timer = clearInterval(timer);
        }
        timer = setInterval(loop, interval * 1000);
        setTimeout(loop, 100);
    }

    function restart() {
        if (timer) {
            timer = clearInterval(timer);
        }
        lasttime = -1;
        timer = setInterval(loop, interval * 1000);
        setTimeout(loop, 100);
    }

    function stop() {
        timer = clearInterval(timer);
        loop();
    }
/*
    player.oncanplay(start);
   	 player.onSeek(restart);
    player.onPause(stop);
    	player.onBuffer(stop);
    player.onIdle(stop);
    player.onComplete(stop);
    	player.onError(stop);
  */  
    this.video.addEventListener('play', function(e){ 
			start();	
		});
		
		this.video.addEventListener('pause', function(e){ 
			stop();
		});
		
		this.video.addEventListener('abort', function(e){  
			stop();
		});

		this.video.addEventListener('timeupdate', function(e) { 
							
		});
		
		this.video.addEventListener('ended', function(e) { 
			stop();
		}, false);
    
	}
	
	
}); // end video class


/* 
* name: Vi2.Playbackspeed
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
* - show speed changes on video frame when they get changed with keyboard commands
*/


Vi2.PlaybackSpeed = $.inherit(/** @lends Vi2.PlaybackSpeed# */{

	/** 
	*	@constructs 
	*	@param options {object}
	* @param options.selector {String} 
	* @param options.videoSelector {String} 	
	* @param options.speed_steps {Array} Float array with the available steps to increase or decrease the playback speed 
	*/
	__constructor : function(options) { 
			this.options = $.extend(this.options, options);
			this.video = document.getElementById( this.options.videoSelector );
	},
	
	name : 'playbackSpeed',
	type : 'player-widget',
	options : {
		selector: '.control-bar',
		videoSelector : 'video1',
		speed_steps: [0.3,0.5,0.7,1.0,1.5,1.7,2.0]//[0.3,0.5,0.8,1.0,1.5,2.0,3.0,4.0]	
	},
	speed : 1, // default speed
	video : '',	
	speedIndex : 3,
	

	/** 
	*	Initializes the playback speed controls 
	*/
	init : function(selector){  
		var _this = this;
		// clear selector
		$( this.options.selector + '> .vi2-speed-controls' ).remove();
		
		var container = $('<div></div>')
			.append($('<div></div>').text('1.0x').addClass('speed-label'))
			.addClass('vi2-speed-controls')
			.bind('mouseenter', function(e){
				$('.vi2-speed-controls > ul').css('display','block');
			})
			.bind('mouseleave', function(e){
				$('.vi2-speed-controls > ul').css('display','none');
			})
			.tooltip({
				delay: 0, 
				showURL: false, 
				bodyHandler: function() { 
					return $('<span></span>')
						.text('Wiedergabegeschwindigkeit');
				} 
			})
			.appendTo( this.options.selector );
			
		var options = $('<ul></ul>')
			.addClass('select-speed')
			.appendTo(container);
		
		$.each( this.options.speed_steps, function(i, val){ 
			var sel = $('<li></li>')
				.attr('speed', val)
				.text(val+'x')
				.click(function(e){
					_this.setCurrentSpeed( $(this).attr('speed') );
				})
				.appendTo(options);
				
		});
	},
	
	
	/** 
	* Shows the currently changed speed option inside the video frame. This indicator disappears after a few seconds
	*/
	displaySpeed : function(){
		// need to be implemented
	},
	
	
	/** 
	* Interface that returns the current playback speed
	*/
	getCurrentSpeed : function(){
		return this.speed;
	},
	
	
	/** 
	* Interface to sets the playback speed
	*	@param speed {Number} 	 
	*/ 
	setCurrentSpeed : function(speed){ 
		if( this.options.speed_steps.indexOf( parseFloat(speed) ) !== -1){
			// log event
			vi2.observer.log({context:'playbackSpeed', action:'change-speed', values:[this.speed, speed]});
			// set speed
			this.video.defaultPlaybackRate = 1.0; 
			this.video.playbackRate = speed; 
			this.speed = speed;
			this.speedIndex = this.options.speed_steps.indexOf( parseFloat(speed) );
			// set label
			$('.speed-label').text( speed + 'x');
			// close select menu
			$('.vi2-speed-controls > ul').css('display','none');
		}	
	},
	
	
	/**
	* Interface to increases the playback speed by one step in the index of the given values 
	*/
	increaseSpeed : function(){ 
		if( this.speedIndex < this.options.speed_steps.length ){
			this.setCurrentSpeed( this.options.speed_steps[ this.speedIndex + 1 ] );
		}	
	},
	
	
	/** 
	* Interface to decreases the playback speed by one step in the index of the given values 
	*/
	decreaseSpeed : function(){ 
		if( this.speedIndex > 1 ){
			this.setCurrentSpeed( this.options.speed_steps[ this.speedIndex -1 ] );
		}	
	}
	
	
}); // end class
	
/* 
* name: Vi2.SkipBack
* author: niels.seidel@nise81.com
* license: MIT License
* description:
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
* todo:
*  - 
*/


Vi2.SkipBack = $.inherit(/** @lends Vi2.SkipBack# */{ // 

		/** @constructs
		*		@param {object} options An object containing the parameters
		*		@param {boolean} options.hasTimelineMarker Whether the TOC should be annotated on the timeline or not.
		*		
		*/
  	__constructor : function(options) { 
  			this.options = $.extend(this.options, options);  
		},
		
		name : 'skipBack',
		type : 'player-widget',
		options : {
			selector : '.control-bar',
			label : '',
			step : 5 // in seconds
		},

		/**
		* Initializes the skip back button of content and handles options
		*/
		init : function(){  
			// clear selector
			$( this.options.selector + '> .vi2-skipback-controls' ).remove();
		
			// add button to player control bar
			var _this = this;
			var container = $('<div></div>')
				.append($('<div></div>')
					.text( this.options.label )
					.addClass('vi2-skipback-label glyphicon glyphicon-step-backward')
				)
				.addClass('vi2-skipback-controls vi2-btn')
				.attr('title', this.options.step+'s zurückspringen')
				.bind('click', function(e){ 
					var current = vi2.observer.player.currentTime();
					var next = Number(Number(current) - Number(_this.options.step));
					
					vi2.observer.log({context:'skipBack',action:'skip-back',values: [current, String(next) ]});
					vi2.observer.player.currentTime( next ); 
				})
				.prependTo( this.options.selector );
		}
}); // end class  
/* 
*	name: Vi2.Utils
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
*	json_validator: http://jsonformatter.curiousconcept.com/
*
**/ 

Vi2.Maintain = $.inherit(/** @lends Maintain# */{
		/** @constructs 
		* 
		*/
  __constructor : function() {},

	
	/**
	*
	*/
	validateTags : function(){
		var tax = [];
		$.each(this.json_data._taxonomy, function(i, stream){
			$.each(stream.sub, function(i, val){
				tax.push(val);//{first_level: this.id, second_level: this.sub});	
			});
			//tax.push(stream.id);
		});
		var tags = [];
		$.each(this.json_data._stream, function(i, val){
			$.each(this.tags, function(i, tag){
				tags.push(tag.tagname);
			});
		});
		
		$.each(tax, function(i, val){
				if($.inArray(val, tags) === -1){
					$('#debug').append(val+', ');
				}
		});
		
	},


	/*
	*
	**/
	validateTags2 : function(){
	
		var tax = [];
		$.each(this.json_data._taxonomy, function(i, stream){
			$.each(stream.sub, function(i, val){
				tax.push(val);//{first_level: this.id, second_level: this.sub});	
			});
			tax.push(stream.id);
		});

		$.each(this.json_data._stream, function(i, val){
			$('#debug').append('Not found in '+val.id+': ');
			$.each(this.tags, function(i, tag){
				if($.inArray(tag.tagname, tax) === -1){
					$('#debug').append(tag.tagname+', ');
				}
			});
			$('#debug').append('<br/>');
		});

	},
	
	//
	validateLinks : function(){
		$.each(this.json_data._stream, function(i, val){
			$('#debug').append('['+val.id+'] '+val.metadata[0].title+' ('+val.metadata[0].author+'):<br/>');
			$.each(this.links, function(i, l){
					$('#debug').append('"'+l.id+'" @ '+l.start+' => '+l.text+'<br/>');
			});
			$('#debug').append('<br/>');
		});
	},
		
		
	/*

{"template":"basic","title":"New Project","guid":"E073E685-3ED6-4C5C-A210-A137894E4745","project":
{"targets":[{"id":8,"name":"Area1"},{"id":9,"name":"Area2"}],
"media":[{"id":"Media4","name":"Media41327357877524","url":"http://127.0.0.1:3033/static/videos/iwrm_cullmann.ogv","target":"main","
duration":178.378,"tracks":[

{"name":"Track1327357889581","id":"Track6","trackEvents":[

{"id":"TrackEvent128","type":"text","popcornOptions":{"start":3.5563294858342074,"end":12.915091290661069,"text":"hello","target":"Area2"},"track":"Track1327357889581","name":"Track1327357889591"}


]}]}]}}
	
	*/	
	generateButter : function(id){
		var _this = this;
		var video_url = vi2.db.getStreamById( id ).video;
		// local file
		video_url.replace('http://141.46.8.101/beta/e2script/', 'http://127.0.0.1:3033/static/videos/');
		video_url =  'http://127.0.0.1:3033' + video_url ;
		var butter = '{"template":"basic","title":"'+id+'","guid":"AA41AB3B-D145-477E-A264-3B42701F1E85", "project": {"targets":[{"id":0,"name":"Area1"},{"id":1,"name":"pop-container"}],"media":[ {"id":"Media0","name":"Media01327337635028","url":"'+video_url+'","target":"main","duration":4829.205,"tracks":[';
		var track0 = '',
		 		track1 = '',
		 		track2 = '',
		 		butter1 = '',
		 		butter2 = '', 
		 		butter3 = '';
		
		// fetch slides
		$.each(vi2.db.getStreamById(id, true).slides, function(i, val){
			//butter += '{"image":{"start": '+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1:3033/static/slides/'+id+'/'+this.img+'", "text":"", "target":"image-container", "link":{}, "id":"'+this.img.replace(/.jpg/, '')+'"}},'
			if(i % 2 === 0 ){
				butter1 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+(Number(this.starttime) + Number(this.duration)) +',"href":"","src":"http://127.0.0.1:3033/static/slides/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639244","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
			}else{
				butter2 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+ (Number(this.starttime) + Number(this.duration)) +',"href":"","src":"http://127.0.0.1:3033/static/slides/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639255","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
			}
		}); 
		
		// fetch hyperlinks 
		/*$.each(vi2.db.getStreamById(id).links, function(i, val){
			butter3 += '{"id":"TrackEventA'+i+'","type":"pop","popcornOptions":{"start":'+Number(_this.deci2seconds(this.start))+',"end":'+(Number(_this.deci2seconds(this.start))+Number(this.duration))+',"exit":"2.5","text":"'+this.id+'", "link":"'+this.text+'","target":"pop-container", "left":"'+this.x+'%", "top":"'+this.y+'%"},"track":"Track1327357889566","name":"Track1327357889'+Math.ceil(Math.random()*1000)+'"},';		
		});*/
		track0 = '{"name":"Track1327337639244","id":"Track0", "trackEvents":['+butter1.substr(0, butter1.length -1)+']},';
		track1 = '{"name":"Track1327337639255","id":"Track1", "trackEvents":['+butter2.substr(0, butter2.length -1)+']}';
		//track2 = '{"name":"Track1327357889566","id":"Track2", "trackEvents":['+butter3.substr(0, butter3.length -1)+']}';
		
		butter += track0 + track1 + ']}]}}';
		console.log('-------------------------------');
		console.log(butter);
		console.log('-------------------------------');
		//$('#debug').html(butter);
		//this.json_import();
		//this.test();
	},	

	//
	/*
	Imports popcorn json into vi-two data/slides
	*/
	json_import : function(){ 
		var _this = this;
		var lectures = '';
		var images = ''; 
		$.ajax({
    	type: "POST",
    	dataType: "json",
    	url: './data_slide_update.json',
    	success: function(lec){   
    		
    		$.each(lec.data, function(i, val){
    			images = '';//val.title+"\n";	
    				 
    			$.each(val.project.media, function(ii, media){	
    				$.each(media.tracks, function(i, track){   
    					$.each(track.trackEvents, function(i, img){    
    						if(img.type === 'image'){
    							images += '{ "type":"seq", "starttime":'+img.popcornOptions.start+', "duration":'+(img.popcornOptions.end - img.popcornOptions.start)+', "id":"", "img":"'+String(img.popcornOptions.src).replace("http://elearning.ihi-zittau.de/beta/iwrm/slides/"+val.title+"/", "")+'" },';	
								}else if(img.type === 'pop'){
									images += '#x: '+img.popcornOptions.left+'  #y: '+img.popcornOptions.top+'  #start: '+_this.seconds2deci(img.popcornOptions.start)+'  #dur: '+(img.popcornOptions.end-img.popcornOptions.start)+'  #text: '+img.popcornOptions.text+'  #target: '+img.popcornOptions.link;
    							images += "\n";
    						}  				
    					});
    				});
    			});	
    			lectures += '\n { "id": "'+val.title+'", "slides":['+ images.substr(0, images.length - 1) +']},\n';			
    		});
    		
    		var jsoon = '';
				jsoon += '{ "_name": "vi2 slides", "_slides": [\n';
				jsoon += lectures.substr(0, lectures.length -1 );
				jsoon += '\n]}';
				
				$('#debug').html(jsoon);
    	},
			error: function(e, msg, x){ alert('error at json import '+msg); }
		});
	},
	
	//
	seconds2deci : function(s){
		var date = new Date(Math.ceil(s*1000));
		return (date.getHours()-1)+':'+date.getMinutes()+':'+date.getSeconds();
	},
	
	/*
	aim: search for broken images
	output: a string into debug textarea
	usage: copy the string into a bash script (e.g. script.sh) and run it inside the slides-folder: sh ./script.sh 
	*/
	validateImages : function(){
		var err = "#!/bin/bash \n";
		var img = new Image();
		
		$.each(this.json_slide_data._slides, function(i, lecture){
			var id = lecture.id;
			err += 'mkdir '+lecture.id;
			$.each(lecture.slides, function(j, img){
				err += 'cp ./'+id+'/'+img.img+' /'+lecture.id+' ;';
				//err += 'test -e ./'+id+'/'+img.img+' || echo "bad: '+img.img+'"; ';
			
			});
			
		});
		$('#debug').html(err);
	},
	
	test : function(){
	var dataString ='cullmann';
	if ( dataString ) { 
          		
          		var butter = '{"template":"basic","title":"'+dataString+'","guid":"AA41AB3B-D145-477E-A264-3B42701F1E85", "project": {"targets":[{"id":0,"name":"Area1"},{"id":1,"name":"pop-container"}],"media":[ {"id":"Media0","name":"Media01327337635028","url":"http://127.0.0.1:3033/static/videos/iwrm_'+dataString+'.ogv","target":"main","duration":4829.205,"tracks":[';
							var track0 = '',
		 					track1 = '',
		 					track2 = '',
		 					butter1 = '',
		 					butter2 = '', 
		 					//bam = '',
		 					butter3 = '';
							// 		
          		$.ajax({
    						type: "POST",
    						dataType: "json",
    						url: 'http://127.0.0.1:3033/static/data-slides.json',
    						success: function(data){  
    							$.each(data._slides, function(j, val){ 
    								//bam += '<option value="'+val.id+'">'+val.id+'</option>'
    								if(val.id == dataString){  
    									// fetch slides
											$.each(val.slides, function(i, val){ 
												if(i % 2 === 0 ){ 
													butter1 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1:3033/static/slides/'+dataString+'/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639244","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
												}else{
													butter2 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+(this.starttime + this.duration) +',"href":"","src":"http://127.0.0.1:3033/static/slides/'+dataString+'/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639255","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
												}
											});
    								}
    							});	
    							//alert(bam);
									// fetch hyperlinks 
									/*$.each(this.getStreamById(id).links, function(i, val){
										butter3 += '{"id":"TrackEventA'+i+'","type":"pop","popcornOptions":{"start":'+Number(_this.deci2seconds(this.start))+',"end":'+(Number(_this.deci2seconds(this.start))+Number(this.duration))+',"exit":"2.5","text":"'+this.id+'", "link":"'+this.text+'","target":"pop-container", "left":"'+this.x+'%", "top":"'+this.y+'%"},"track":"Track1327357889566","name":"Track1327357889'+Math.ceil(Math.random()*1000)+'"},';		
									});*/
									track0 = '{"name":"Track1327337639244","id":"Track0", "trackEvents":['+butter1.substr(0, butter1.length -1)+']},';
									track1 = '{"name":"Track1327337639255","id":"Track1", "trackEvents":['+butter2.substr(0, butter2.length -1)+']}';
									//track2 = '{"name":"Track1327357889566","id":"Track2", "trackEvents":['+butter3.substr(0, butter3.length -1)+']}';
		
									butter += track0 + track1 + track2 + ']}]}}';
          		
          				$('#debug').html(butter);
  								//var data = JSON.parse( butter );
              		//popupManager.hidePopups();
              		//pm.importProject( data, document.getElementById( 'timeline-media-input-box' ).value );
    						},
								error: function(e){ alert('error at json import'); }
							});
          }
	
	}, 
	
	/* D3 Viz */
	chord : function(){
	var _this = this;
	var out = '';
	var links ='';
	
	$.ajax({
    			type: "POST",
    			dataType: "json",
    			url: './data.json',
    			success: function(res){  
						$.each(res._stream, function(i, val){
							links = '';
							$.each(val.links, function(ii,vall){
								var cat = String(_this.getStreamById(val.id).metadata[0].category).replace(/\ /g, '').replace(/\_/g, '').replace(/\-/g, '').toLowerCase();
								links += '"flare.'+cat+'.'+vall.text+'.x",';
							}); 
							
							out += '{"name":"flare.'+String(this.metadata[0].category).replace(/\ /g, '').replace(/\_/g, '').replace(/\-/g, '').toLowerCase()+'.'+val.id+'.x","size":1699,"imports":['+links.slice(0,links.length-1)+']},';			
						});
					$('#debug').html(out.slice(0,out.length-1));
					}
	});





}

});
