module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
     jshint: {
    	all: ['public/etutor/static/lib/vi-two/src/*', 'public/etutor/static/src/']
  	},
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
      	files: [
      		{
				    src: [
				    	'public/etutor/static/lib/jquery-1.9.1.js',
				    	'public/etutor/static/lib/jquery.inherit-1.1.1.js',
							'public/etutor/static/lib/jquery-migrate-1.2.1.min.js',
							'public/etutor/static/lib/bootstrap.js',
							'public/etutor/static/lib/jquery.cssemoticons.min.js',
							'public/etutor/static/lib/jquery.cookie.js', 
							'public/etutor/static/lib/splitter.js', 
							'public/etutor/static/lib/jquery.ui.core.js', 
							'public/etutor/static/lib/jquery.ui.widget.js', 
							'public/etutor/static/lib/jquery.ui.mouse.js', 
							'public/etutor/static/lib/jquery.ui.position.js', 
							'public/etutor/static/lib/jquery.ui.accordion.js', 
							'public/etutor/static/lib/jquery.ui.draggable.js', 
							'public/etutor/static/lib/jquery.ui.resizable.js', 
							'public/etutor/static/lib/jquery.ui.slider.js', 
							'public/etutor/static/lib/jquery.ui.spinner.js', 
							'public/etutor/static/lib/jquery.ui.tabs.js', 
							'public/etutor/static/lib/jquery.ui.tooltip.js', 
							'public/etutor/static/lib/jquery.ui.effect.js', 
							'public/etutor/static/lib/jquery.json-2.2.min.js',
							'public/etutor/static/lib/ejs.js',
							'public/etutor/static/lib/jquery.tinysort.js',
							'public/etutor/static/lib/jquery.sortChildren.js',
							'public/etutor/static/lib/jquery.tooltip.js',	
							'public/etutor/static/lib/jquery.spin.js',
							'public/etutor/static/lib/jquery.panzoom.min.js',
							'public/etutor/static/lib/sammy-latest.min.js',
							'public/etutor/static/lib/moment.min.js',
							'public/etutor/static/lib/jquery.colorbox-min.js',
							'public/etutor/static/lib/markdown.js',
							'public/etutor/static/lib/jquery-image-loader.js'
				    ],
				  	dest: 'public/etutor/static/dist/vi-lab-lib.min.js'
				 	},
					{
				   	src: [
							'public/etutor/static/lib/vi-two/src/vi2.core.observer.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.log.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.database.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.parser.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.videoplayer.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.annotated-timeline.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.clock.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.metadata.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.annotation.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.video-manager.js',
							'public/etutor/static/lib/vi-two/src/vi2.core.utils.js',
							'public/etutor/static/lib/vi-two/src/vi2.utils.maintanance.js',
							'public/etutor/static/lib/vi-two/src/vi2.player.playback-speed.js',
							'public/etutor/static/lib/vi-two/src/vi2.player.skip-back.js',
							'public/etutor/static/lib/vi-two/src/vi2.annotation.toc.js',
							'public/etutor/static/lib/vi-two/src/vi2.annotation.hyperlinks.js',
							'public/etutor/static/lib/vi-two/src/vi2.annotation.comments.js',
							'public/etutor/static/lib/vi-two/src/vi2.annotation.simultaneous-media.js',
							'public/etutor/static/lib/vi-two/src/vi2.annotation.assessment.js',
							'public/etutor/static/lib/vi-two/src/vi2.annotation.analysis.js',
							'public/etutor/static/src/vi-lab.js'
				   	],
				   	dest: 'public/etutor/static/dist/vi-two.min.js'
					}
				]// end files		  
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  
  grunt.registerTask('test', ['jshint']);

};
