/*
		var m = $('.messages');//.empty();//.appendTo('ui-tabs-nav');.addClass('')
		var users_online = $('<span></span>')
				
				.addClass('users-online-nav')
				.prependTo('.account-data')
				;
		this.socket.on('broadcast-user-online', function(data){
			users_online.empty();
			$.each(_this.db.getUserByGroupId(data.group_id, _this.current_phase), function(i, val){
				if(val.id != _this.userData.id){
				var hs = val.hs == 'n' ? 'FH Nordhausen' : 'TUD / IHI Zittau';
				var ol = data.user_id == val.id ? 'on' : 'op';
				var the_user = $('<a></a>')
					.addClass('users-online '+ol)
					.css('background-image', "url('img/user-icons/user-"+this.id+".png')")
					.appendTo(users_online)
					.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text(val.firstname+' '+val.name+' ('+hs+')'); } })
					.text('');
				}
			});
			
		});
		
		//	
		var msg_button = $('<span></span>')
			.text('Messages')
			.addClass('ui-button message-nav')
			//.appendTo(m)
			.click(function() {
      	$( ".msg-container" ).empty().toggle( ); // 'blind', {}, 500 
      	$.get('/messages', function(data){
					$.each(data, function(i, msg){
						if(msg.type == 'test-result' && msg.content.videoid == _this.currentVideo){	
							var user = _this.db.getUserById(msg.from);
							var date = '';//new Date(msg.date*1000);
							//date = date.getDay()+'.'+date.getMonth()+'.'+date.getFullYear()+', '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
							var title = $('<div></div>')
								.addClass('msg-title ui-button '+msg.type)
								.css('background-image',  "url('img/user-icons/user-"+msg.from+".png')")
								.click(function(e){
									$(this).parent().find('.msg-content').toggle();
								})
								.append(user.firstname+' '+user.name)
								.append($('<span></span>').text(' '+date).addClass('msg-note'));
						
							var content = $('<div></div>')
								.addClass('msg-content')
								.hide()
								.append($('<div></div>').html('<b>Frage:</b> '+decodeURIComponent(msg.content.question)))
								.append($('<div></div>').html('<b>Antwort:</b> '+decodeURIComponent(msg.content.res)));	
							
							var feedback = $('<div></div>')
								.appendTo(content)
								.append('<b>Feedback:</b> ');
							$.get('/messages', function(data){
								$.each(data, function(i, fb){ 
									if(fb.type == 'feedback' && fb.replyto == msg._id){ 
										var user = _this.db.getUserById(fb.from);
										feedback.append($('<div></div>')
											.addClass('msg-feedback')
											.css('background-image',  "url('img/user-icons/user-"+fb.from+".png')")
											.tooltip({delay: 2, showURL: false, bodyHandler: function() { return $('<span></span>').text('Feedback von '+user.firstname+' '+user.name);} })
											.append(decodeURIComponent(fb.content))
										);
									}
								});
							});
							
							var reply = $('<span></span>')
								.appendTo(content)
								.addClass('msg-feedback-reply')
								.append('<b>Feedback geben:</b> ')
								.append('<textarea></textarea>')
								.append($('<span></span>').text('send').addClass('msg-reply ui-button').click(function(){
										var the_feedback = {
											from : _this.wp_user, // the user that answered the question
											to : msg.from, // the author of the question
											date : new Date(),
											replyto: msg._id,
											type : 'feedback',
											read : false, 
											replied: false,
											title : 'Result: ',//+encodeURIComponent(obj.question),
											content : encodeURIComponent($(this).parent().find('textarea').val()) 
										};
										$.post('/messages', {"data":the_feedback}, function(res){ 
											//alert('Has been saved: '+ JSON.stringify(res));
											feedback.append($('<div></div>')
												.addClass('msg-feedback')
												.css('background-image',  "url('img/user-icons/user-"+the_feedback.from+".png')")
												.append(decodeURIComponent(the_feedback.content))); 
										});
									})// end click
								);
												
							var n = $('<div></div>')
								.addClass('msg-item')
								.append(title)
								.append(content)
								.appendTo('.msg-container');
						}
					});
				});
      	return false;
    	});
		var msg_container = $('<div></div>')
			.addClass('msg-container')
			.text('hello')
			.appendTo(m)
			.hide();
			
 
    // set effect from select menu value
    
		//m.append('Messages').addClass('ui-button').click(function(){});
		
		// build menu with other accessible videos
		// needs to be implemented with the vi2-widget
		$('.sitepanel-right').html('<strong>Related Videos</strong>');
		var list = $('<div></div>')
				.addClass('ui-menu related-video-list')
				.appendTo('.sitepanel-right');
			
		$.get('/related-videos/'+_this.groupData.videos.join(","),function(data){ //alert(JSON.stringify(data)); 
			$.each(data, function(i, video){ 
				if(this.id != _this.currentVideo){	 
					//var video = _this.db.getStreamById(this);
					var el = $('<div></div>')
						.addClass('related-video')
						.css('background-image', "url("+video.thumbnail+")")	
						.appendTo(list);
					var link = $('<a></a>')
						.addClass('ui-button')
						.click(function(){ 
							//_this.currentGroupVideoNum = i;
							_this.init('startApp', video.id); //_this.parsePopcorn(video.popcorn)
						})
						.html(video.metadata[0].title+' ')
					//.tooltip({delay: 0, showURL: false, bodyHandler: function() { return $('<span></span>').text('Bearbeitet durch: '+video.title);} });
						.appendTo(el);
					var info = $('<div></div>').addClass('related-video-info').text(video.metadata[0]["abstract"]+' ').appendTo(el)
				}
			});	
		});
		
		return;
		// editing progress
		var status = 0; 
		var length = this.videoData.metadata[0].length;
		status =+ (length * 3.5) / (this.videoData.toc.length * 10);
		status =+ (length * 3.5) / (this.videoData.tags.length * 10);
		status =+ (length * 3.5) / (this.videoData.assessment.length * 10);
//		status += (this.videoData.links.length / length ) * 0;
//		status += (this.videoData.comments.length / length ) * 0;
		//alert(status);
		*/
		
		
		
		
		/**
  	* {"content":{"question":"Eine Frage","answ":[{"id":"answ78","answ":"Antwort a","questiontype":"mc"},{"id":"answ32","answ":"Antwort b","questiontype":"mc"},{"id":"answ43","answ":"Antwort c","questiontype":"mc"}],"correct":["answ43"]},"time":["300"],"date":"1386505607283"}
  	
  	createAnnotationForm_xxx : function( assessmentData ){ 
  		var question = $('<textarea></textarea>')
  			.attr('id', 'annotionQuestion');
  		if( assessmentData ){
  			assessmentData = assessmentData.content;
  			question.val( assessmentData.question );
  		}	
  		var answer_box = $('<div></div>');
  		
  		// Multiple Choice / Singele Choice
  		var assessment_types = ['radio','checkbox','fill-in'];
  		var type = assessment_types[1];
  		var ii = 0;
  		var add = $('<div></div>')
  			.addClass('add-question mc-question')
  			.button()
  			.text('Multiple-Choice-Antwort')
  			.click(function(){
  				var rm = $('<span></span>')
  					//.button()
  					.text('x')
						.click(function(){ 
							$(this).parent().remove(); 
							if($('.answer').length == 0){
								$('.fi-question').show();
							}	
						});
					$('.fi-question').hide();
					var answ = $('<div></div>')
						.attr('id', 'answ'+Math.ceil(Math.random()*100))
						.addClass('answer')
						.append('<input type="'+ type +'" name="quest" value'+ (type == "=radio" ? 1 : "") +' />')
						.append('<input type="text" value=""/>')
						.append(rm)
						.append('<br/>');
					//var height = Number(selector.dialog( "option", "height")); 
					//selector.dialog( "option", "height", (height+25));
					ii++;
					answer_box.append(answ);
			});
  		 
  		// fill-in text
  		var add2 = $('<div></div>').addClass('add-question fi-question').button().text('Freitext-Antwort')
  			.click(function(){
					var rm = $('<span></span>').button().text('x').click(function(){ 
						$(this).parent().remove();
						$('.add-question').show();
				});
  			$('.add-question').hide();
  			var answ = $('<div></div>')
  				.attr('id', 'answ'+Math.ceil(Math.random()*100))
  				.addClass('answer')
  				.append('<textarea></textarea>')
  				.append(rm)
  				.append('<br/>');
  			//var height = Number(selector.dialog( "option", "height")); 
  			//selector.dialog( "option", "height", (height+25));
  			ii++;
  			answer_box.append(answ);
  		});
  		 
  		//
  		return $('<div></div>')
  			.addClass('questionanswers')
  			.append(question)
  			.append(answer_box)
  			.append(add)
  			.append(add2);
  	},
  	*/
  	
  	
  	
  		
		/**
		getLogTime : function(){
			var date = new Date();
			var s = date.getSeconds();
			var mi =date.getMinutes();
			var h = date.getHours();
			var d = date.getDate();
    	var m = date.getMonth()+1;
    	var y = date.getFullYear();
    	return date.getTime()+', ' + y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d)+', '+(h<=9?'0'+h:h)+':'+(mi<=9?'0'+mi:mi)+':'+(s<=9?'0'+s:s)+':'+date.getMilliseconds();
			//return date.getTime();
		}
		
		
		
		* Util function to convert seconds into decimal notation. XXX hours missing 
		*	@param {Number} Time in seconds
		*	@returns {String} Time as decimal notation  
				
		formatTime : function(secs){
			var seconds = Math.round(secs);
    	var minutes = Math.floor(seconds / 60);
    	minutes = (minutes >= 10) ? minutes : "0" + minutes;
    	seconds = Math.floor(seconds % 60);
    	seconds = (seconds >= 10) ? seconds : "0" + seconds;
    	return minutes + "-" + seconds;
		}*/
