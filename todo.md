
https://github.com/integrations

1. rename and re-order phases at script instance
2. change order of groups at admin/users/edit/:_id



# VI-TWO
## urgent
- video-patterns database
- vi-lab: script level 3 matrix
- vi2.traces: Analysiert erhobene Logdaten der Videonutzung und stellt diese in einer heat- map parallel zur Zeitleiste dar (siehe U SER T RACES ).
- vi.scrubber: Vorschaubild der Videoszenen beim Überstreichen der Zeitleiste (siehe V ISU -
AL S UMMARY )
- vi2.SynchronizedMaps: Zu einem gegebenen Zeitpunkt werden Koordinaten oder Polygo-
nen von Koordinaten auf einer Karte (hier OpenStreetMap) neben dem Video dargestellt.
- sequentielle medien
- fin: fragments
- fin: subtitles


## bugs by priorities
- css bugs in opera / msie / safari
- script scheduler not working
- bug: no login possible! => could not be reproduced

- bug: @messages:: can send message without recipient
- bug: @messages:: footer is not aligned at the bottom
- bug: @user::: when adding a new user there is no id assigned to them.
- bug: after importing users.csv the user-group relation will be lost
- bug: player: "online phase 3" als aufgabe
- scenario: add user to existing group in a running script => edit group formation
- scenario: add phase to running script => merge instance and template
- scenario: add widget to a phase of a running script  => merge instance and template
- scenario: add video to a phase of a running script
- bug@aufgabe muss je video, statt je Phase angezeigt werden
- bug@user :: online status does not change if browser window gets closed
- @script-instances indes => timeline dates 1970

- logged out members are not gettng disabled in the peers client
- fix some tooltip bugs (user-data, group-data)
- missing template :: /admin/videos/metadata/edit/<id>
- ??? is it possible to assign more then one video to a group within one phase?
- ??? how can I chose activities that corralte with the script task and widgets?

# fixed bugs
- fixed:bug: bson error on certain instnces where new versions of mongodb can not be installed
	npm uninstall -g node-gyp
	sudo npm install -g node-gyp@3.4.0 --save
	sudo npm install -g canvas --save



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
- @messages: link2image: https://github.com/brenden/node-webshot
 - chat zw. Gruppenmitgliedern
 - Anzahl der seit dem pageload neu hinzugekommenen Annotationen anzeigen
 - bearbeitungsstand anzeigen
  - anzahl items je toc/tags/comments/...
  - ?gesamtstand anhand von relativer metrik
 - daily reports about group activity send by e-mail 


#VI-TWO 
 - Datenbank auf serverseite verschieben und db-Klasse als Schnittstelle umgestalten
 - make widgets independent from parser
 - mehrsprachigkeit / spracheinheitlichkeit: l('')
 - fallback: load annotations from dom if DB is not available

- @timeline: 
 - zustand für inaktive marker
 - slide preview
- @player 
 - space == pause
 - handle 'video end' event 
 - feedback für keyboard commands : insb. playback speed, zoom
 - switch favicon.ico when playing a video == Pattern
 - enable youTube / vimeo / ...
	var request = require('request');
	var http = require('http');
	var fs = require('fs');

	http.createServer(function(req,res)
	{
		  var x = request('http://www.youtube.com/embed/XGSy3_Czz8k')
		  req.pipe(x)
		  x.pipe(res)
	}).listen(1337, '127.0.0.1');
	console.log('Server running at http://127.0.0.1:1337/');

 - node.js streaming: http://stackoverflow.com/questions/33008951/video-streaming-in-node-js
 											http://stackoverflow.com/questions/4360060/video-streaming-with-html-5-via-node-js
 											https://github.com/meloncholy/vid-streamer
https://gist.github.com/psi-4ward/7099001
https://github.com/aheckmann/gridfs-stream
https://gist.github.com/pos1tron/094ac862c9d116096572
https://gist.github.com/derMani/218bd18cc926d85a57a1
http://stackoverflow.com/questions/37408227/how-to-read-a-video-with-gridfs-stream
 											http://stackoverflow.com/questions/24976123/streaming-a-video-file-to-an-html5-video-player-with-node-js-so-that-the-video-c
 - vollbild / split screen
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

**new widgets**
 - maps
 - vi2.syncImages => conrete version of simultaneous Media
 - user notes
 - playlist
 - lesezeichen
 - search
 - user ratings
 - media fragments, see http://stackoverflow.com/questions/32548253/streaming-part-of-a-video-in-node-js
 - thinkLets integrieren
 
# scripts alternatives:
http://link.springer.com/chapter/10.1007/978-0-387-36949-5_16
http://dl.acm.org/citation.cfm?id=1599570
http://dl.acm.org/citation.cfm?id=1599577
http://dl.acm.org/citation.cfm?id=1599583
http://dl.acm.org/citation.cfm?id=2723611
https://www.w3.org/TR/scxml/#overview
https://en.wikipedia.org/wiki/SCXML
http://www.sciencedirect.com/science/article/pii/S0378720605000170
http://link.springer.com/chapter/10.1007/978-3-658-04986-7_8
http://www.tandfonline.com/doi/abs/10.1080/00219266.2014.1002518

# Technische Analyse
http://katalogbeta.slub-dresden.de/id/0009106337/#detail
http://katalogbeta.slub-dresden.de/id/0015308426/#detail
http://katalogbeta.slub-dresden.de/id/0009124387/#detail
http://katalogbeta.slub-dresden.de/id/0013772960/#detail
katalogbeta.slub-dresden.de/id/0003963083/#detail
http://katalogbeta.slub-dresden.de/id/ai-48-SUFfX0lBMzMxNTI2MTg/#detail
http://katalogbeta.slub-dresden.de/id/ai-48-UUVfX1FFMTk5ODExMDEyMjE4MjkxNzE4MTYxNzI4MjUxNDE0MTMzMTE4MTMxNDI0MTAyMzEw/#detail
http://katalogbeta.slub-dresden.de/id/ai-48-U09TSV9fMjdFMTI1NzM3NUJENjUyMkI2NEY0NzkyN0YyNDQ1RjU/#detail
http://katalogbeta.slub-dresden.de/id/ai-49-aHR0cDovL2R4LmRvaS5vcmcvMTAuMTAwNy9zMTMyMTgtMDEzLTAyMzctNA/#detail
http://katalogbeta.slub-dresden.de/id/ai-49-aHR0cDovL2R4LmRvaS5vcmcvMTAuMTA1NS9zLTIwMDQtODEzMDMx/#detail
http://katalogbeta.slub-dresden.de/id/ai-48-TUFNQV9fMDUwNTAyMDE4/#detail
katalogbeta.slub-dresden.de/id/0011344924/#detail
http://www.eltro.de/videoanalyse.html  

# technologies to use for better development
- https://github.com/mynyml/watchr
- less


# roadmap for next release
- install script including demo data
- make a nice http://127.0.0.1:3033/admin that shows starting points, include a tour
- AMD / commonjs : https://github.com/systemjs/systemjs
- S-BPM for node.js : https://github.com/e2ebridge/bpmn
- display comments / links animated 
- strict templating, e.g. page-title as <%= page.title %>
- settings page
	 - settings per appliction (e.g. terezin, etutor)
	 - include all markdown-pages (intr, about, footer, ...)
	 - load balancing location for videos / static contents
	 - page title
	 - application etutor/terezin
	 - supported mime-types for upload


- @templates: 
 - duplicate phase
 - cascade of settings for player widgets (einstellung f. ein Video überschreib globale Einstellung)

- @instance: 
 - add used template to table
 - level 3 script erzeugen inkl. videoinstanzen und gruppenzuordnung
 - only one instance should be active.
 - vizualize how users move from one group to another by using a sankey diagram (see data-viz folder at works)

- @video instance 
 - => /admin/videos/view/:id => admin darf in alle instanzen reinschauen
 - list group who is operating on the instance
 - bulk-editing of multiple instances that rely on the same file (e.g. change title)

- @video files:
 - make file names more readable
 - make it nicer to predefine annotations other then slides
 - upload and manage slides -> use popcorn maker
 - list presentation-type and annotations in the table
 - import/export metadata
 - workflow für video upload
	 1. select locale file
	 2. convert different codecs & sizes
	 3. define metadata (done)
	 4. extract stills
	 5. extract text from stills
	 5. select poster from stills
	 see https://github.com/bgrins/videoconverter.js 
 - handle different format/mimes/file extentions, incl. file conversion
 - extract more technical informations about the vide files: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
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
 - extend upload for other file types => images & PDFs
- @groups: 
 - list group member in table
 - group site ... description, tasks, log, progress, forum
- @users
 - let users register and communicate the princple of minimal data collection 
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

- wiki? https://github.com/Jermolene/TiddlyWiki5
   

# Performance & quality improvements
- http://expressjs.com/en/advanced/best-practice-performance.html#env
- fast logers: https://strongloop.com/strongblog/compare-node-js-logging-winston-bunyan/?_ga=1.58848237.1719051603.1461595496
- fully use require.js to load files
- perfomance: console.time(label)   / console.timeEnd(label) 	
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
		http://docs.casperjs.org/en/latest/modules/clientutils.html
- testing user activity
	https://github.com/marmelab/gremlins.js/		


# multi angle
http://evelyn-interactive.searchingforabby.com/

# nice
https://github.com/angular-fullstack/generator-angular-fullstack 


# text analysis
Required for text extraction (recommended):
tesseract >= 3
Required for hunspell based text filtering (optional):
hunspell >= 1.2.8
Required for audio normalization (optional):
sox >= 14.4



## nicetohave
 - idee: "turn lights off" ... siehe videlectures.NET
 - visualize audio waveform inorder to estimate audio quality in terms of low or high altitude / capturing volume: http://stackoverflow.com/questions/38727741/play-a-moving-waveform-for-wav-audio-file-in-html/39019842#39019842


# Analytics
 http://stackoverflow.com/questions/21483530/dc-js-with-node-js-server-side
 https://github.com/square/crossfilter
 http://dc-js.github.io/dc.js/
 found at: https://anmolkoul.wordpress.com/2015/06/05/interactive-data-visualization-using-d3-js-dc-js-nodejs-and-mongodb/



# Cool stuff
- farbe und transparanz von player controls ändert sich in abhängigkeit der gemittelten Helligkeit und Farbe des unmittelbaren Hintergrund. Die Änderungen unterscheiden sich in der vertikalen und in der Horizontalen. (Siehe Apple Player)


# metadata
**Dublin Core**
http://dublincore.org/documents/usageguide/elements.shtml

{
"_id": "572a1a6b7c5fdf281e0ae9e0",        
"video": "/static/uploads/14d1023907b3a84dd276c5dd5a5268bf1458077766625.mp4",
"updated_at": "2016-05-04T15:51:07.220Z",
"created_at": "2016-04-04T16:13:17.410Z",
        
       
			"metadata": 
			{
			"title": "B2B-Marketing",
			"subject":"Marketing",
			"description": "In der vorliegenden Videoaufzeichnung wird das Thema ...",
			"type":"video",
			"source": "https://www.youtube.com/watch?v=kQqktXqAqTE",
			"coverage": "university lecture",
			"creator": "Prof. Dr. Daniel Wentzel",
			"publisher": "RWTH Aachen",
			"contributor":"-",
			"rights":"Creative Commons 2.0",
			"date":"01-01-2014",
			"format":"video/mp4",
			"identifier":"/video/view/572a1a6b7c5fdf281e0ae9e0",
			"Audience":"university students, Master-level",
			"language":"German",
			"length": "3240",
			"thumbnail": [
				"still_14d1023907b3a84dd276c5dd5a5268bf1458077766625_1.png",
				"still_14d1023907b3a84dd276c5dd5a5268bf1458077766625_2.png"
			],
			"keywords": [
				"B2B",
				"Marketing"
			]
			},
			"assessment": [],
			"comments": [],
			"hyperlinks": [],
			"toc": [],
			}

**videoMD**
https://www.loc.gov/standards/amdvmd/htmldoc/videoMD.html#id160
https://www.loc.gov/standards/amdvmd/videoMD.xsd

**METS**
http://memory.loc.gov/diglib/ihas/loc.natlib.ihas.200031106/default.html
http://memory.loc.gov/diglib/ihas/loc.natlib.ihas.200031106/mets.xml
http://digitalassets.lib.berkeley.edu/jpnprints/ucm/mets/caawucm_7_1_00027801.xml

**PBCore 2.1**
http://pbcore.org/schema/
https://github.com/WGBH/PBCore_2.1/





