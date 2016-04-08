


# VI-TWO
## urgent
- monitor server, app, REST => site24x7

## bugs by priority
- bug: after importing users.csv the user-group relation will be lost
- bug: player: "online phase 3" als aufgabe
- scenario: add user to existing group in a running script => edit group formation
- scenario: add phase to running script => merge instance and template
- scenario: add widget to a phase of a running script  => merge instance and template
- scenario: add video to a phase of a running script
- bug@aufgabe muss je video, statt je Phase angezeigt werden
- bug@user :: online status does not change if browser window gets closed
- bug: bson error on certain instnces where new versions of mongodb can not be installed
- logged out members are not gettng disabled in the peers client
- fix some tooltip bugs (user-data, group-data)
- Logs are not accessible, not even for an - activity log
- css bugs in opera / msie / safari


# group page activity Thread
- activity stream
 - annotations
 - messages
  - del message
  - reply message
  - differentiate types
  - message to instructor 
 - viewing history
- chat
- integrate messaging system
- @messages: link2image: https://github.com/brenden/node-webshot


# For diss
- caption: \textit{SubRip, W3C WEBVVT} und \textit{W3C TTML}
- transcript
- maps
- vi2.syncImgaes => conrete version of simultaneous Media

# widgets
 - user notes
 - playlist
 - lesezeichen
 - search
 - user ratings
 - media fragments
 - thinkLets integrieren


# roadmap for next release
- display comments / links animated 
- @templates: 
 - add uses files and used widgets to table
 - drag'n drop order of phases
 - cascade of settings for player widgets (einstellung f. ein Video überschreib globale Einstellung)
- @instance: 
 - add used template to table
 - level 3 script erzeugen inkl. videoinstanzen und gruppenzuordnung
 - only one instance should be active.
 - drag'n drop order of phases 
- @video instance 
 - => /admin/videos/view/:id => admin darf in alle instanzen reinschauen
 - list group who is operation on the instance
- @video files:
 - workflow für video upload
	 1. select locale file
	 2. convert different codecs & sizes
	 3. define metadata
	 4. extract stills
	 5. extract text from stills
	 5. select poster from stills
 - handle different format/mimes/file extentions, incl. file conversion
 - extract more technical informations about the vide files: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
 - store annotation that instances inherit
 - use common metadata standard for video
 - automatic conversion of file to mp4 and webm
 - automatic thumbnail creation to enable scrubbing
 - hide files from beeing downloaded
 - RESPONSIVE DESIGN
			var screencheck = window.matchMedia("(min-width: 800px)");
			if (screencheck.matches) {
			<video controls>
			<source src="the-sky-is-calling-large.mp4" media="screen and (min-device-width:801px)">
			<source src="the-sky-is-calling-large.webm" media="screen and (min-device-width:801px)">
			<source src="the-sky-is-calling-small.mp4" media="screen and (max-device-width:800px)">
			<source src="the-sky-is-calling-small.webm" media="screen and (max-device-width:800px)">
			</video>
 - extend for other file types => images & PDFs
- @groups: 
 - list group member in table
 - group site ... description, tasks, log, progress, forum
- @users
 - let users register and communicate the princple of minimal data collection 
- settings page
 - settings per appliction (e.g. terezin, etutor)
 - include all markdown-pages (intr, about, footer, ...)
 - load balancing location for videos / static contents
 - page title
 - application etutor/terezin
 - supported mime-types for upload
- REST API HATEOAS
  -	https://tools.ietf.org/html/draft-kelly-json-hal-06#page-2
  - https://en.wikipedia.org/wiki/HATEOAS
  - https://github.com/hapijs/hapi
  - http://fortunejs.com/api/#serializer
- distinguish applications
 - shared files, e.g. admin-templates, libs, css
- popcorn-editor
 - save popcorn slides to database
 - open toc, tags, links, assessment
 - popcorn-plugin en-/disable via Widget Editor (??? Wie soll das gehen)
- guided tour on how to define a script
   
# Awareness
 - chat zw. Gruppenmitgliedern
 - Anzahl der seit dem pageload neu hinzugekommenen Annotationen anzeigen
 - bearbeitungsstand anzeigen
  - anzahl items je toc/tags/comments/...
  - ?gesamtstand anhand von relativer metrik
 - daily reports about group activity send by e-mail 


# Performance & quality improvements
- fully use require.js to load files
- perfomance: console.time(label)   / console.timeEnd(label) 	
- gzip compression
- usability: tooltip für Funktionen
- handle errors: 
 - https://www.joyent.com/developers/node/design/errors
 - http://stackoverflow.com/questions/14172455/get-name-and-line-of-calling-function-in-node-js
 - console.error('There was an error reading the file!', err);
- testing
		https://github.com/visionmedia/supertest
		https://github.com/pgte/nock
		http://visionmedia.github.io/mocha/#synchronous-code
		https://github.com/visionmedia/should.js/

 


# text analysis
Required for text extraction (recommended):
tesseract >= 3
Required for hunspell based text filtering (optional):
hunspell >= 1.2.8
Required for audio normalization (optional):
sox >= 14.4


#VI-TWO 
 - Datenbank auf serverseite verschieben und db-Klasse als Schnittstelle umgestalten
 - make widgets independent from parser
 - mehrsprachigkeit / spracheinheitlichkeit: l('')
 - fallback: load annotations from dom if DB is not available

- @timeline: 
 - zustand für inaktive marker
 - slide preview
- @player 
 - handle video end event 
 - feedback für keyboard commands : insb. playback speed, zoom
 - switch favicon.ico when playing a video == Pattern
 - enable youTube / vimeo / ...
 - vollbild / split screen
 - idee: "turn lights off" ... siehe videlectures.NET
 - placeholder @ videoplayer in css einbinden
- @zoom: 
 - zoom log
 - relative zoom/pan position ... in a box window
- @assesment
 - comment assessment
 - statistics
 - inform users about submitted tasks
- @other AS
 - ass-fillin: semantische Nähe zw. Feedback und Aufgabe
 - ass-ondemand: scrollbares feld bei aufgabenbearbeitung
 	

- @ bookmark 
 - url fehler

- @tags 
 - refactor code
 - include
 - automatische Verlinkung via tags

- @highlight => overlay
  - refactor
  - remove require call for consistency


# Analytics
 http://stackoverflow.com/questions/21483530/dc-js-with-node-js-server-side
 https://github.com/square/crossfilter
 http://dc-js.github.io/dc.js/
 found at: https://anmolkoul.wordpress.com/2015/06/05/interactive-data-visualization-using-d3-js-dc-js-nodejs-and-mongodb/



# Cool stuff
- farbe und transparanz von player controls ändert sich in abhängigkeit der gemittelten Helligkeit und Farbe des unmittelbaren Hintergrund. Die Änderungen unterscheiden sich in der vertikalen und in der Horizontalen. (Siehe Apple Player)








