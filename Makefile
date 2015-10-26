

# See documentation: http://yui.github.io/yuicompressor/


# Set the source directory
srcdir = public/vi-lab/js/

# Create the list of modules
js_basic =  ${srcdir}jquery-1.5.2.js\
						${srcdir}jquery-ui-1.8.6.custom.min.js\
            ${srcdir}jquery.tinysort.js\
           	${srcdir}jquery.tooltip.js\
            ${srcdir}intro.min.js\


# Create the list of modules
js_files =  ./public/etutor/static/lib/vi-two/src/*.js
						
#<script type='text/javascript' src='/vi-lab/js/vi2.highlight.js'></script


# Set css source directory
css_srcdir = public/vi-lab/css/

# Create the list of modules
css_files =   ${css_srcdir}ui-lightness/jquery-ui-1.7.2.custom.css\
						${css_srcdir}jquery.hrzAccordion.defaults.css\
						${css_srcdir}vi2.main.css\
						${css_srcdir}vi2.videoplayer.css\
						${css_srcdir}videolab.css\
						${css_srcdir}theresienstadt.css\
						${css_srcdir}colorbox.css\
						${css_srcdir}vi2.assessment.css\
						${css_srcdir}vi2.assessment-fill-in.css\
						${css_srcdir}vi2.assessment-writing.css\
						${css_srcdir}introjs.css\

css_basic =   ${css_srcdir}ui-lightness/jquery-ui-1.7.2.custom.css\
						${css_srcdir}jquery.hrzAccordion.defaults.css\
						${css_srcdir}videolab.css\
						${css_srcdir}theresienstadt.css\
						${css_srcdir}introjs.css\


## VI-TWO
# test vi-two
test:	${js_files}
	#jshint $^ 	
	cat $^ | grep -H 'alert('				
    
# Bundle vi-two, all of the modules into vi-two.js
js: ${js_files}
		cat $^ > public/etutor/static/js/vi-two.js


#	Compress vi-two, all of the modules into vi-two.min.js
js-min: ${js_files}
		cat $^ > public/etutor/static/js/vi-two.js
	  #java -jar /usr/bin/compiler.jar --js public/etutor/static/js/vi-two.js --js_output_file public/etutor/static/js/vi-two.min.js
#	  java -jar tools/yuicompressor-2.4.8.jar public/vi-lab/js/vi-two.js -o public/vi-lab/js/vi-two.min.js	   
		gjslint --nojsdoc -r  public/etutor/static/js/vi-two.js



# LIB
#	Compress al of the modules into vi-two.min.js
js-basic: ${js_basic}
		cat $^ > public/vi-lab/js/vi-lab-basic.js
	  java -jar /usr/bin/compiler.jar --js public/vi-lab/js/vi-lab-basic.js --js_output_file public/vi-lab/js/vi-lab-basic.min.js
#	  java -jar ./_tools/yuicompressor-2.4.8.jar public/vi-lab/js/vi-two.js -o public/vi-lab/js/vi-two.min.js	   
		 
	  
# bundle css files
css: ${css_files}
	cat $^ > public/vi-lab/css/vi-two-style.css

# bundle and compress css files
css-min: ${css_files}
	cat $^ > public/vi-lab/css/vi-two-style.css
	java -jar ./_tools/yuicompressor-2.4.8.jar ./public/vi-lab/css/vi-two-style.css -o public/vi-lab/css/vi-two-style.min.css
	
css-basic: ${css_basic}
	cat $^ > public/vi-lab/css/vi-basic-style.css
	java -jar ./_tools/yuicompressor-2.4.8.jar ./public/vi-lab/css/vi-basic-style.css -o public/vi-lab/css/vi-basic-style.min.css		   
	  

all:
	make css-min
	make js-min 
	make css-basic
	make js-basic
	  
 
	  
	  
	  
	  
# generate documentation of vi-two
#	setup jsdoc:
# 1) JSDOCDIR="$HOME/Documents/www/elearning/vi2/vi-two/tools/jsdoc/jsdoc-toolkit"
# 2) JSDOCTEMPLATEDIR="$JSDOCDIR/templates/jsdoc"
# 3) make documentation
documentation: $(vi2)
		#cat $^ > vi2doc.js
		java -jar tools/jsdoc/jsdoc-toolkit/jsrun.jar tools/jsdoc/jsdoc-toolkit/app/run.js -a -t=tools/jsdoc/jsdoc-toolkit/templates/jsdoc $^ 
		# copy docs to the dedicated folder
		cp -r tools/jsdoc/jsdoc-toolkit/out/jsdoc/* doc/


#		
iwrm: ${modules}
		cat $^ > examples/iwrm/js/vi-two.js
	  java -jar /usr/bin/compiler.jar --js examples/iwrm/js/vi-two.js --js_output_file examples/iwrm/js/vi-two.min.js
		
	 
		
		
		
		
		 

