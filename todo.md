


# VI-TWO
## urgent
- bug @ assessment .. multiple instances loaded
- test mit vielen users
- test IE
- test safari
- css bugs in opera
- bug @ logged out members are not gettng disabled in the peers client

- guided tour
- display comments / links animated 


- popcorn maker @ admin
- suche
- session mgmg?

## bugs
- video3 toc missing for comparisson
- fix some tooltip bugs (user-data, group-data)
- Logs are not accessible, not even for an - activity log

# to befor production mode
- remove/abstract: http://127.0.0.1:3033


## last things




## admin 
-- user übersich -- links per id, statt per username wg. eindeutigkeit
-- footer


## next release / nth

- fallback: load annotations from dom if DB is not available
- fully use require.js to load files
- gzip compression
- usability: tooltip für Funktionen

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
 - – http://stats.stackexchange.com/search?q=%22group+comparison%22

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
 	
- @script
 - script schedule
 - cascade von settings für player widgets (einstellung f. ein Video überschreib globale Einstellung)
 - see bug @ aufgabe muss je video, statt je Phase angezeigt werden

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








