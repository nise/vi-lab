(function() {

  var rctx = require.config({
    baseUrl: "/static/views/popcorn-maker/js",
    paths: {
      context: "popcorn-maker"
    }
  });

  rctx( [ "external" ], function() {

    rctx( [ "popcorn-maker" ], function( PopcornMaker ) {

      var pm;
      
      /*
      	*
      	**/
      	var 
      		server = '/static/',
      		butter = ''
      		;
     			// call http://127.0.0.1:3033/admin/videos/annotations/edit/52a13d2e2aa9d35f24000548#
          var dataString = '52a13d2e2aa9d35f24000548';//$("#import-json-select option:selected").val();
          if ( dataString ) { 
          		
      		var track0 = '',
 					track1 = '',
 					track2 = '',
 					butter1 = '',
 					butter2 = '', 
 					butter3 = '';
 					
 					var deci2seconds = function(s){
						if(Number(s) < 0 || s == null){ return 0; }
						var arr = s.split(':');
						return Number(arr[0])*3600+Number(arr[1])*60+Number(arr[2]);
					};
 					
					// 		
      		$.ajax({
						type: "GET",
						dataType: "json",
						url: '/json/videos/52a13d2e2aa9d35f24000548',
						success: function(data){ 
							if( data._id !== 'undefined'){ 
								var id = '52a13d2e2aa9d35f24000046';
								var video_url = data.video;
								// local file
								video_url = video_url.replace('http://141.46.8.101/beta/e2script/', 'http://127.0.0.1:3033/static/videos/');
								video_url = video_url.replace('.mp4', '.webm');
							
								butter = '{"template":"basic","title":"'+id+'","guid":"AA41AB3B-D145-477E-A264-3B42701F1E85", "project": {"targets":[{"id":0,"name":"Area1"},{"id":1,"name":"pop-container"}],"media":[ {"id":"Media0","name":"Media01327337635028","url":"'+video_url+'","target":"main","duration":4829.205,"tracks":[';
								var track0 = '',
								 		track1 = '',
								 		track2 = '',
								 		butter1 = '',
								 		butter2 = '', 
								 		butter3 = '';

								// fetch slides
								$.each( data.slides, function(i, val){ 
									if(i % 2 === 0 ){
										butter1 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+(Number(this.starttime) + Number(this.duration)) +',"href":"","src":"http://127.0.0.1:3033/static/slides/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639244","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
									}else{
										butter2 += '{"id":"TrackEvent'+i+'","type":"image","popcornOptions": {"start":'+this.starttime+',"end":'+ (Number(this.starttime) + Number(this.duration)) +',"href":"","src":"http://127.0.0.1:3033/static/slides/'+this.img+'","text":"","target":"Area1"}, "track":"Track1327337639255","name":"Track1327337639'+Math.ceil(Math.random()*1000)+'"},';		
									}
								}); 

								track0 = '{"name":"Track1327337639244","id":"Track0", "trackEvents":['+butter1.substr(0, butter1.length -1)+']},';
								track1 = '{"name":"Track1327337639255","id":"Track1", "trackEvents":['+butter2.substr(0, butter2.length -1)+']}';
								//track2 = '{"name":"Track1327357889566","id":"Track2", "trackEvents":['+butter3.substr(0, butter3.length -1)+']}';

								butter += track0 + track1 + ']}]}}';
								pop_data = JSON.parse( butter );
		        		pm = new PopcornMaker();
	//          		pm.hidePopups();
		        		pm.importProject( pop_data, document.getElementById( 'timeline-media-input-box' ).value );
							}
						},
						error: function(e){ console.log('error at json import'+JSON.stringify(e)); },
					});
  	}	

      $(function() {
        $( ".draggable" ).draggable();
      });

      var d = {
        links: {
          position: {
            at: "top right",
            my: "bottom left",
            viewport: $(window)
          }
        },
      },
      c = $("#contentheader");

      $('a[title!=""]', c).qtip(d.links);

      $(window).bind("beforeunload", function( event ) {
        return "Are you sure you want to leave Popcorn Maker?";
      });

      $(window).keypress( function( event ) {
        var elem = event.srcElement || event.target;
        if ( (event.which === 46 || event.which === 8) &&
             (elem.nodeName !== "INPUT" && elem.nodeName !== "TEXTAREA") ) {
          event.preventDefault();
        }
      });

    }); //require

  }); //require
})();
