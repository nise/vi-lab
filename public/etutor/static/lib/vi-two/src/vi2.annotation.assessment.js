/* 
*	name: Vi2.Assessment
*	author: niels.seidel@nise81.com
* license: MIT License
*	description: 
* dependencies:
*  - jquery-1.11.2.min.js
*  - jquery.inherit-1.1.1.js
*	todo:
  further options:
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
					var obj = JSON.parse( decodeURIComponent( val.title ) );  
					events.push({ 
						name: obj,
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
			var assess = $('<ul></ul>')
				.addClass('assessment-list')
				.appendTo( this.options.menuSelector )
				;
			$.each( assessmentData, function(i, val){
				var user = vi2.db.getUserById(val.author);	
				
				var header = $('<span></span>')
					.addClass('assessment-header');
					
				$('<span></span>')
					.text( user.firstname +' '+user.name )
					.addClass('assessment-user')
					.appendTo( header )
					;  
				header.append(' ' + moment(Number(val.date), "x").fromNow() );	
				
				
				//var li = function(author, title, target, time, id){ 
				var userIcon = new Image();
				$(userIcon)
				//	.attr('src', _this.options.path+'icon.png')
					.addClass('assessment-user-icon');
				var a = $('<a></a>')
					//.append(userIcon)
					.append( val.name.question )
					.attr('author', val.author)
					//.attr('href', '#'+vi2.observer.options.id)
					.addClass('id-'+ val.time)
					.click(function(){
						vi2.observer.log('clickassessmentfromlist:'+ val.name.question +' '+val.author+' '+ val.time +' '+ val.date);
						vi2.observer.player.currentTime( val.time );
					});			
				
				
				var li = $('<li></li>')
					.attr('id', 't'+ val.time)
					.attr('author', val.author)
					//.attr('title', 'Frage von '+user.firstname+' '+user.name)
					.attr('data-toggle', "modal")
					.attr('data-target', "#myModal")
					.attr('data-annotationtype', 'assessment')
					.data('annotationdata', { content: val.name, time: val.time, date: val.date } )
					.addClass('assessment-user-icon list-item')
					//.css('list-style-image',  "url('"+_this.options.path+"user-"+author+".png')")
					.html( header)
					.append( a )
					.appendTo( assess )
					;	
				
				// edit
				if( _this.options.allowEditing ){	 
					var edit_btn = $('<a></a>')
						.addClass('tiny-edit-btn glyphicon glyphicon-pencil' )
						.attr('data-toggle', "modal")
						.attr('data-target', "#myModal")
						.attr('data-annotationtype', 'assessment')
						.data('annotationdata', { content: val.name, time: val.time, date: val.date } )
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
					.text(decodeURIComponent(val.title))
					.appendTo( vi2.dom )
					; 
			});
		},
		
			/*
		**/
		updateDOMElement : function( obj ){
			$(vi2.dom)
				.find('[date="'+ obj.identifer +'"]') // .date
				.attr('author', vi2.wp_user )
				.attr('date', new Date().getTime())
				.attr('starttime', obj.time )
				.text( JSON.stringify( obj.content ) );
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
			obj = JSON.parse( decodeURIComponent( obj.content.title ) );  
			var _this = this;
			var question_selector = 'vi2assessment'+id;
			vi2.observer.player.pause();
			vi2.observer.log('assessmentdisplaybegin');
			//{"question":"bimel","answ":[{"id":"answ0","answ":"hier"},{"id":"answ1","answ":"we"},{"id":"answ2","answ":"go"}],"correct":"answ2"}
			var o = $('<div></div>')
				.attr('id', 'vi2assessment')
				.addClass(question_selector)
				.html('')
				.show();
				
			var quest = $('<h2></h2>')
				.addClass('assessment-question')
				.text(''+obj.question);	
			var answ = $('<div></div>')
				.addClass('assessment-answers');
			
			// fill in answers box
			if(obj.answ.length == 1 && obj.answ[0].questiontype == 'fill-in'){ 
				var answer = $('<div></div>')
					.attr('id', 'answ0')
  				.addClass('assessment-answer')
  				.append('<textarea name="quest"></textarea>')
  				.append('<br/>')
  				.appendTo(answ);
			}else{ // mc answer options
				$.each(obj.answ, function(i, val){ 
					var answer = $('<div></div>')
						.attr('id', val.id)
						.addClass('assessment-answer')
						.append('<input type="checkbox" name="quest" value="1" />')
						.append(val.answ)
						.click(function(){ $(this).find('input[type="checkbox"]').attr('checked',true) })
						.append('<br/>')
						.appendTo(answ);
				});
			}	
			
			var solve = $('<div></div>')
				.addClass('assessment-btn')
				.text('abschicken')
				.button()
				.click(function(){
					$('.assessment-btn').hide();
					vi2.observer.log('submitassessmenttask:'+id);
					_this.evaluateAnswer('.'+question_selector, obj)
				});
				
			$(o).append(quest).append(answ).append(solve); 
			$(this.options.displaySelector).append(o);
	
			/*
			if(this.currImgId == obj.content.target){
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
			//add question
			if( json !== undefined ){
				json = json.content;
			}else{
				json = {question:'', answ:[], correct:[], time:["300"], date:""}; //vi2.observer.player.currentTime()
			}
			
			var question = $('<textarea></textarea>')
				.attr('id', 'annotationQuestion')
				.val(json.question);
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
								if($('.answer').length == 0){
									$('.fi-question').show();
									$('.mc-question').show();
								}else{
									$('.fi-question').show();
									$('.mc-question').show();
								}	
							})
							;
						$('.fi-question').hide();	
						var answ = $('<div></div>')
							.attr('id', 'answ'+Math.ceil(Math.random()*100))
							.addClass('answer')
							.append('<input type="checkbox" title="Setze ein Häckchen für richtige Lösungen" name="quest" value="1" />')
							.append('<input type="text" class="mc-option" value=""/>')
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
								if($('.answer').length == 0){
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
		
		
		
			// handle answers
			if(json.answ != undefined){
				if(json.answ[0].questiontype == 'mc'){
					// add existing answers
					$.each(json.answ, function(i, val){ 
						var rm = $('<span></span>')
							.addClass('close-btn glyphicon glyphicon-remove-circle')
							.attr('title', 'Antwortoption entfernen')
							.click(function(){ 
								$(this).parent().remove(); 
								if($('.answer').length == 0){
									$('.fi-question').show();
									$('.mc-question').show();
								}else{
									$('.fi-question').hide();
									$('.mc-question').hide();
								}
							});
						var checkbox = $('<input type="checkbox" title="Setze ein Häckchen für richtige Lösungen" name="quest" value="1" />');
						$.each(json.correct, function(j, el){
							if(el == val.id){ 
								checkbox.attr('checked', true);
							}
						});
						var answ = $('<div></div>')
							.attr('id', val.id)
							.addClass('answer')
							.append(checkbox)
							.append($('<input type="text" class="mc-option" />').val(val.answ))
							.append(rm)
							.append('<br/>')
							.appendTo(answer_box)
							;
					}); 
				}else if(json.answ[0].questiontype == 'fill-in'){ 
					var rm = $('<span></span>')
						.addClass('close-btn glyphicon glyphicon-remove-circle')
						.attr('title', 'Lösung entfernen')
						.click(function(){ 
							$(this).parent().remove();
							if($('.answer').length == 0){
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
							.append($('<textarea></textarea>').val(json.answ[0].answ))
							.append(rm)
							.append('<br/>')
							.appendTo(answer_box);
						//var height = Number(selector.dialog( "option", "height")); 
				}
			}
		
			var form =  $('<div></div>')
			.addClass('questionanswers')
			.append($('<label></label>').text('Frage:'))
			.append(question)
			.append(answer_box)
			.append(add)
			.append(add2)
			;
			if( answer_box.has('input.mc-option') && json.answ !== undefined){
				add2.hide();
			}
			if( answer_box.has('textarea') && json.answ != undefined ){
				//add.hide();
				add2.hide();
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
				msg += '<br> Bitte definieren Sie für diese Frage entsprechende Antwortoptionen oder Lösungen.'
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
			var obj = {};
			obj.content = $( selector ).find('[name="assessment-entry"]').attr('value');
			obj.time = $( selector ).find('[name="assessment-entry-time"]').attr('value');
			
			obj.content = {};
			obj.content.question = $('#annotationQuestion').val();
			obj.content.time = $('#annotationTime').attr('value');
			obj.content.date = String( new Date().getTime() );
			obj.content.answ = [];
			obj.content.correct = [];
			
			// get fill-in solution
			$('#answerbox').find('textarea').each(function(i,val){
					obj.content.answ[i] = { id: $(val).attr('id'), answ: $(val).val(), questiontype:"fi" };
			});
			
			// get multiple choice answer options
			$('#answerbox').find('input[type=text]').each(function(i,val){
					obj.content.answ[i] = { id: $(val).attr('id'), answ: $(val).val(), questiontype:"mc" };
			});
			
			// find correct answers
			$('#answerbox').find('input:checked').each(function(i,val){
					obj.content.correct.push( $(val).attr('id') );
			});
			
			
			alert(obj)
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
		evaluateAnswer : function(question_selector, obj){
			if(obj.answ[0].questiontype == 'fill-in'){
				$(question_selector).append($('<p>Vielen Dank für die Bearbeitung der Frage.</p>').addClass('assessment-msg-correct'));
			}else{ 
				var one_checked = false, correct = true;
				obj.checked = [];
				$('.assessment-msg-warning').hide();
				$('.assessment-answers').find('div.assessment-answer').each(function(i, val){
					if($(this).find("input[name='quest']:checked").val() == 1){
						obj.checked.push($(this).text())
						one_checked = true;
						$.each(obj.correct, function(j, corr){ 
							if(corr == $(val).attr('id')){	
								obj.correct[j] = true; 
							}
						});
					}
				});
			
				// VALIDATION
				if( ! one_checked ){
					//vi2.observer.log('[call:run_assessment, result:empty_selection]'); 
					//alert('pls select one');
					$(question_selector).append($('<p>Bitte wählen Sie eine Antwortoption</p>').addClass('assessment-msg-warning'));
					$('.assessment-btn').show();
					return false;
				}
			
				// CORRECT?
				$.each(obj.correct, function(i, val){ 
					if( val != true ) {
						vi2.observer.log('assessmentwrong');
						correct = false;
					}
				});
				if(correct == true){
					vi2.observer.log('assessmentcorrect');
					$(question_selector).append($('<p>Ihre Antwort ist richtig.</p>').addClass('assessment-msg-correct'));
					//vi2.observer.log('[call:run_assessment, result:correct]');
				}else{ // wrong
					//vi2.observer.log('[call:run_assessment, result:wrong]');
					 
					$(question_selector).append($('<p>Ihre Antwort ist leider falsch.</p>').addClass('assessment-msg-wrong'));
				}
			}
			// save result to node
			obj.type = obj.answ[0].questiontype;
			var result = {
				correct: correct,
				question : encodeURIComponent(obj.question),
				answ : obj.answ,
				res : obj.type == 'mc' ? encodeURIComponent(obj.checked) : encodeURIComponent($('.assessment-answers').find('textarea').val()),
				videoid : vi2.currentVideo
			}; 
			var question_result = {
		  	from : vi2.wp_user, // the user that answered the question
		  	to : obj.author, // the author of the question
		  	date : (new Date()).getTime(),
		  	type : 'test-result',
		  	read : false, 
		  	replied: false,
		  	title : 'Result: '+encodeURIComponent(obj.question),
		  	content : result 
    	};
			$.post('/messages', {"data":question_result}, function(res){ 
        //alert('Has been saved: '+ JSON.stringify(res)); 
    	});
		
			// proceed	
			$(question_selector).append($('<div></div>').addClass('assessment-btn-proceed').text('proceed playback').button().click(function(){
				$(question_selector).remove();
				vi2.observer.log('[call:finish_assessment]');
				vi2.observer.player.play();
			}))
		}
		
	
		
	}); // end class Comments
