
/*
It should be possible to convert an odinary lecturnity electure into a html video-lecture build upon vi-two.

todo:
- routine: 
-- scan for flv-files and list them with path and last-edit, enable playback
-- scan for lmd-files and list them with path and last-edit, enable preview

**/

var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/../_tools/lecturnity/lecture5/document.lmd', function(err, data) {
    parser.parseString(data, function (err, result) {
//        console.dir(result);
        console.log('Done');
       // console.log(result.docinfo.structure[0].chapter[0].page)
        var session_name = "e2script_5";
        var slides = {};
        slides.id = session_name;
        slides.slides = new Array(); 
				var toc = {toc:new Array()};
				var tmp_title = '';

        // traverse chapters and pages
        var slide_id = 0;
        for(var struc = 0; struc < result.docinfo.structure.length; struc++){
		      for(var chap = 0; chap < result.docinfo.structure[struc].chapter.length; chap++){
		      	for(var page = 0; page < result.docinfo.structure[struc].chapter[chap].page.length; page++){
		      		var t = result.docinfo.structure[struc].chapter[chap].page[page];
		      		var begin = (t.begin[0]/1000).toFixed(1);
		      		var end = (t.end[0]/1000).toFixed(1);
		      		// extract slides
		      		var a_slide = { 
		      			type: "seq", 
		      			id: '',//t.title[0], 
		      			img: session_name+"-"+slide_id+".jpg", 
		      			starttime: begin, 
		      			duration: ( end - begin ).toFixed(1) 
		      		};
		      		slides.slides.push(a_slide)
		      		slide_id++;
		      		// extract toc
		      		if(tmp_title !== t.title[0]){
					  		var a_toc = {
					  			label: t.title[0],
					  			duration: 1, 
					  			start: begin
					  		}
					  		toc.toc.push(a_toc);
					  	}
					  	tmp_title = t.title[0];	
		      	}
		      }
        }
        console.log(JSON.stringify(toc))
        console.log('----------------------')
        console.log(JSON.stringify(slides))
    });
});


/*
Slide conversion

# convert pdf to jpg
convert -quality 100 -verbose -density 300 -trim  slides3.pdf e2script_3.jpg

# optional croping ()
find . -type f -iname "*.jpg" -exec convert {} -crop 719x538+62+30 {} \;

# scale to output size
find . -type f -iname "*.jpg" -exec mogrify -scale 700 {} \;

# jpeg-compression
find . -type f -iname "*.jpg" -exec mogrify -quality 91 {} \;

**/



