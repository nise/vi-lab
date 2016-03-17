


# VI-TWO
## urgent

- Themenblöcke darstellen
- Instanzen erzeugen

- script templates 

 
- script instance
 - level 1 script erzeugen inkl. videoinstanzen und gruppenzuordnung
 
- script instanz incl. supplement und video instanzen rendern
 
- group activity Thread
	- annotations
	- messages
	- viewing history
	- chat / gruppen nachrichten


- player bug

- Features
 - comments
 - toc
 - hyperlinks
 
 
 - user notes
 - playlist
 - lesezeichen
 - search
 - user ratings
 - media fragments
 
- thinkLets integrieren

- display comments / links animated 
- test IE
- test safari
- css bugs in opera
- guided tour


- suche
- session mgmg?

# For diss
- caption: \textit{SubRip, W3C WEBVVT} und \textit{W3C TTML}
- transcript
- maps
- vi2.syncImgaes => conrete version of simultaneous Media

## bugs
- bson bug on certain instnces where new versions of mongodb can not be installed
- logged out members are not gettng disabled in the peers client
- fix some tooltip bugs (user-data, group-data)
- Logs are not accessible, not even for an - activity log



## next release / nth

- @script
 - script schedule
 - cascade von settings für player widgets (einstellung f. ein Video überschreib globale Einstellung)
 - see bug @ aufgabe muss je video, statt je Phase angezeigt werden


- fallback: load annotations from dom if DB is not available
- fully use require.js to load files
- gzip compression
- usability: tooltip für Funktionen


Required for text extraction (recommended):
tesseract >= 3

Required for hunspell based text filtering (optional):
hunspell >= 1.2.8

Required for audio normalization (optional):
sox >= 14.4


RESPONSIVE DESIGN
var screencheck = window.matchMedia("(min-width: 800px)");
if (screencheck.matches) {
<video controls>
<source src="the-sky-is-calling-large.mp4" media="screen and (min-device-width:801px)">
<source src="the-sky-is-calling-large.webm" media="screen and (min-device-width:801px)">
<source src="the-sky-is-calling-small.mp4" media="screen and (max-device-width:800px)">
<source src="the-sky-is-calling-small.webm" media="screen and (max-device-width:800px)">
</video>

- @VI-TWO 
 - Datenbank auf serverseite verschieben und db-Klasse als Schnittstelle umgestalten
 - make widgets independent from parser
 - mehrsprachigkeit / spracheinheitlichkeit: l('')

- @Vi-Lab
 - REST API
  -	https://tools.ietf.org/html/draft-kelly-json-hal-06#page-2
  - https://en.wikipedia.org/wiki/HATEOAS
  - https://github.com/hapijs/hapi
  - http://fortunejs.com/api/#serializer

 - distinguish applications
  - settings per appliction (e.g. terezin, etutor)
  - shared files, e.g. admin-templates, libs, css
 - placeholder definieren
 - @backend: let users register and communicate the princple of minimal data collection 

- Awareness
 - chat oder komunikation zw. Gruppenmitgliedern
 - explizite Frage an Dozenten
 - Anzahl der seit dem pageload neu hinzugekommenen Annotationen anzeigen
 - bearbeitungsstand anzeigen
  - anzahl items je toc/tags/comments/...
  - ?gesamtstand anhand von relativer metrik
 - daily reports about group activity send by e-mail 

- Analytics
 http://stackoverflow.com/questions/21483530/dc-js-with-node-js-server-side
 https://github.com/square/crossfilter
 http://dc-js.github.io/dc.js/
 found at: https://anmolkoul.wordpress.com/2015/06/05/interactive-data-visualization-using-d3-js-dc-js-nodejs-and-mongodb/
- workflow für video upload
 1. select locale file
 2. convert different codecs & sizes
 3. define metadata
 4. extract stills
 5. extract text from stills
 5. select poster from stills

- @ admin
 - number of currently online users (to prepare a restart)
- @groups
 - group site ... description, tasks, log, progress, forum
 - popcorn-editor
  - save popcorn slides to database
  - open toc, tags, links, assessment
  - popcorn-plugin en-/disable via Widget Editor (??? Wie soll das gehen)

 
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



# Cool stuff
- farbe und transparanz von player controls ändert sich in abhängigkeit der gemittelten Helligkeit und Farbe des unmittelbaren Hintergrund. Die Änderungen unterscheiden sich in der vertikalen und in der Horizontalen. (Siehe Apple Player)

### TEST
https://github.com/visionmedia/supertest
https://github.com/pgte/nock
http://visionmedia.github.io/mocha/#synchronous-code
https://github.com/visionmedia/should.js/








