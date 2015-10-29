


# VI-TWO
## urgent
- new video instances

- test mit vielen users
- test IE
- test safari
- css bugs in opera
- bug @ logged out members are not gettng disabled in the peers client
- bug @ aufgabe muss je video, statt je Phase angezeigt werden
- change fonts- guided tour
- display comments / links animated 
- activity log

- popcorn maker @ admin
- suche
- session mgmg?

## bugs
- video3 toc missing for comparisson
- fix some tooltip bugs (user-data, group-data)

# to befor production mode
- remove/abstract: http://127.0.0.1:3033


## last things




## admin 
-- user übersich -- links per id, statt per username wg. eindeutigkeit
-- footer

## Awareness
- chat oder komunikation zw. Gruppenmitgliedern
- explizite Frage an Dozenten
- bearbeitungsstand anzeigen
	- anzahl items je toc/tags/comments/...
	- ?gesamtstand anhand von relativer metrik

## Script

## next release / nth
- popcorn-editor
 - open slides as popcorn annotations
 - open toc, tags, links, assessment
- settings per appliction
 - placeholder definieren
- workflow für video upload
 1. select locale file
 2. convert different codecs & sizes
 3. define metadata
 4. extract stills
 5. extract text from stills
 5. select poster from stills

- admin
 - number of currently online users (to prepare a restart)
 
- @timeline: zustand für inaktive marker
- was passiert am videoende?
- @zoom: relative zoom/pan position 
- feedback für keyboard commands : insb. playback speed, zoom
- @assesment
	- comment assessment
	- ass: Aufgabenstatistik
	- Benutzerbenachrichtigung
- slide previewr
- script schedule
- cascade von settings für player widgets (einstellung f. ein Video überschreib globale Einstellung)
- bug: bookmark url fehler
- zoom log
- theresienstadt von vi-lab trennen oder umbenennen ? 
- gzip compression
- VI-TWO Datenbank auf serverseite verschieben und db-Klasse als Schnittstelle umgestalten
- bearbeitungsstand anzeigen
 - anzahl items je toc/tags/comments/...
 - gesamtstand anhand von relativer metrik
- usability: feedback beim speichern!!!
- usability: delete realy?
- usability: tooltip für Funktionen
- switch favicon.ico when playing a video == Pattern
- ass-fillin: semantische Nähe zw. Feedback und Aufgabe
- ass-ondemand: scrollbares feld bei aufgabenbearbeitung
- make widgets independent from parser
- enable youTube / vimeo / ...
- vollbild / split screen
- farbe und transparanz von player controls ändert sich in abhängigkeit der gemittelten Helligkeit und Farbe des unmittelbaren Hintergrund. Die Änderungen unterscheiden sich in der vertikalen und in der Horizontalen. (Siehe Apple Player)
- mehrsprachigkeit / spracheinheitlichkeit: l('')
- idee: "turn lights off" ... siehe videlectures.NET
- popcorn plugin für assessment.
- screencast, tagesschau-beispiel...
- popcorn-plugin en-/disable via Widget Editor (??? Wie soll das gehen)
- add links > IWRM
- convertierung von popcorn auf IWRM-ähnliche seite 
--- automatische Verlinkung via tags
-- placeholder @ videoplayer in css einbinden
- tags automatische Verlinkung via tags

- Metadaten in popcorn einpflegen >> IWRM
- ?? video upload via firefogg? 

### TEST
https://github.com/visionmedia/supertest
https://github.com/pgte/nock
http://visionmedia.github.io/mocha/#synchronous-code
https://github.com/visionmedia/should.js/





# Vorgehensweise beim Einrichten von nginx und node.js
- node 
-- sudo apt-get install mongodb nodejs libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev

-- sudo npm install express-validator
-- npm install mongodb path express socket.io node-fs csv node-schedule ejs-locals passport passport-local connect-flash canvas identicon mongoose csv mv async cookie-parser express-json body-parser method-override express-session
- nginx
-- apt-get install nginx
-- Einstellungen /etc/nginx/sites-available/default  (siehe unten)
-- sudo /etc/init.d/nginx restart
- etherpad
-- über git in einen ordner installieren
-- Datei settings.json mit port und vor allem mysql-verbindung anpassen
-- starte: sh ./_tools/etherpad-lite/bin/run.sh -s settings.json
- Betrieb
-- node server.js   oder auf dem Server: nodejs server.js  
--  sudo forever start -a -l forever.log -o out.log -e err.log server.js
-- sudo forever stop server.js
-- both: sudo forever stop server.js && sudo forever start -a -l forever.log -o out.log -e err.log server.js

-- run etherpad: sh ./_tools/etherpad-lite/bin/run.sh -s settings.json &

=> auto update bei crah oder update: http://stackoverflow.com/questions/11084279/node-js-setup-for-easy-deployment-and-updating





# Theresienstadt: Next Steps
- annotations-classes stärker abstrahieren/ vererben, insb. parser integrierenl
- Zwischenschritt der Datenspeicherung im DOM auslassen, statt dessen verschiedene vi2.database-Schnittstellen definieren.
- redesign of the log files: {video:, command: , value:, ...}
- guided video tour
- show propaganda ... as overlay?
- bug/firefox: flickering from timeupdate @ vi2.core.videoplayer

- Mehrsprachigkeit, siehe [http://i18next.com/](Ansatz)
- REST API
	-	https://tools.ietf.org/html/draft-kelly-json-hal-06#page-2
	- https://en.wikipedia.org/wiki/HATEOAS


- @persons: Idee: Alle Einzelbilder, auf denen die Personen zusehen ist kann man in einer Art Karussell durch brausen. Dabei wird die zeitliche Position der Bilder auf der Zeitleiste anotiert. Siehe: http://ninsuna.elis.ugent.be/Showcase/main.jsp#band
- verschiedene Projekte/Kurse
- Unterseiten via URL referenzieren
- nth: Transkription des Sprechers
- nth:- Hyperlinks zu Lanzmann, Geron, Dreharbeiten
- nth:- Audio aufbereiten
- nth:- Videorestauration
- nth: -- Einzelbilderzugang + gesonderte Einzelbilder
- nth: Zwischenebene für Datenhaltung entfernen
- nth:- widget: time break (für fehlende szenen)
- @scenes: link "Ort" with Map // tooltip
- @scenes: fix scrollspy / affix => its related to the dynamic height of, e.g. scene-view
- @scenes: finish description of scenes

- @Film, widget: classified marks (für kennzeichnung von propaganda-szenen) == Kommentare
- @Film, widget: maps tripple abspielposition sowie x und y auf einer Bilddatei ... alternativ Koordinaten von OSM
- Verlinkung zw. szenen, personen und dem video
- page-up beim seitenwechsel

# Backend/LMS
- Nutzerverwaltung: load csv, list user, edit user, add user, list groups, load group-csv, edit group,
- Script-Verwaltung: edit phases, add phase
- Aufgabenverwaltung: Gift-Format, edit tasks, list subited results, ...
- @backend: make all editable
- @backend: dashboard
- @backend: popcorn maker
 - einbinden
 - popcorn to vi-two
 - adopt forms
- @backend: let users register and communicate the princple of minimal data collection
- @backend: script editor > json2form




# Proof of concept
- downloadschutz für video, siehe aclroutes...

# editing scenario:
## scriptless video
1. select video
2. select widgets
3. manage access & publish

## template
1. select template
2. define users
3. define resources/videos

## script
1. import users
2. define phases (widgets, taks, timing, ...)
3. select ressources/videos per phase
4. form groups and relate them to a phase



# Maintainance
* compress files, include minified versions
* Kapselung im Backend



---------------------------------
!!!- Biografien erarbeiten,
- Zuordnung von Orten
- Zuordnung von Propaganda
- Personen-Tags definieren
- Karte mit Video synchronisieren
- GeoModell
- GeoDaten





---------------------------------
Recherchen zu Personen/Orte/Propaganda je Szene
Film: http://141.46.8.101/beta/interecine/theresienstadt.webm
Biografien: https://etherpad.mozilla.org/VrTMfgOwNR
Szenen/Propaganda: https://etherpad.mozilla.org/Avu9FN3BeQ

Hinweise nach Spiegelartikel:
http://www.spiegel.de/einestages/ss-propagandafilm-theresienstadt-90-minuten-luege-a-1011859.html
- Roman Austerlitz
-  Ernest Seinfeld, heute, 19:16 Uhr
Wie so viel über Theresienstadt ist auch dieser Film mißverstanden. Die Idee daß die Nazis im Juni 1944 einen Propagandafilm herstellten um die Welt zu täuschen macht keinen Sinn. Nicht nur daß die Welt, in diesem Fall die Alliierten, alles schon über den Holocaust wußten, noch bedeutsamer ist daß die Gestapo wußte daß es auch den Alliierten bekannt war (obwohl diese viel der Öffentlichkeit verheimlichten). Die einzige logische Erklärung ist daß dieser Film für Himmlers Zwecke gedreht wurde. Himmler führte seit 1943, also nach Stalingrad, eine zweifache Politik bezüglich Theresienstadt, eine offizielle und eine persönlich. Dafür sind mehrere Indizien vorhanden. Im Kurzen, Theresienstadt hatte einen wichtigen Platz in seinem Plan die Kontrolle ueber Deutschland mit Hilfe gewisser Kreise der Alliierten, die damals nie eine Rolle Hitlers geduldet hätten, zu erlangen. Kreise die bereit sein würden ein Deutschland ohne Hitler eher als ein Bolschewistisches Europa zu akzeptieren. Diese Idee war unter den führenden Nazis weit verbreitet. "Ich erwarte einen telephonischen Anruf der Alliierten jeden Moment", so sagte Göring, e.g. Himmler offensichtlich hoffte daß dieser Film für kurze Zeit als Alibi für diese Kreise dienen würde, sowie auch, obwohl weniger, für ihn. Daß das Ausmaß des Holocausts bald der westlichen Öffentlichkeit bekannt werden mußte und Empörung auslösen würde, war offensichtlich, aber solches wäre zu spät gekommen um dieses Arrangement zu verhindern, da ein Waffenstillstand, bereits in Kraft war. Einer der letzten Äußerungen Himmlers kurz vor dem Ende des Krieges daß "Theresienstadt einer seiner besten Karten" in seinen erhofften Treffen mit den Alliierten sei, ist bloß einer dieser Indizien. Wen nötig ist auch zwei weitere Beispiele da: ein Befehl Himmlers an Kaltenbrunner der einen Transport von 5000 Juden nach Auschwitz im Februar 1943 plante: "An den Chef der Sicherheitspolizei und des SD, Berlin, 'Der Reichsführer SS wünscht die Abtransportierung von Juden aus Theresienstadt nicht, da sonst die Tendenz, daß die Juden im Altersghetto Theresienstadt in Ruhe leben und sterben können, damit gestört würde'" (10. Februar 1943, Tgb. Nr.: 39/75/43g)





RESPONSIVE DESIGN
var screencheck = window.matchMedia("(min-width: 800px)");
if (screencheck.matches) {
<video controls>
<source src="the-sky-is-calling-large.mp4" media="screen and (min-device-width:801px)">
<source src="the-sky-is-calling-large.webm" media="screen and (min-device-width:801px)">
<source src="the-sky-is-calling-small.mp4" media="screen and (max-device-width:800px)">
<source src="the-sky-is-calling-small.webm" media="screen and (max-device-width:800px)">
</video>


Objekterkennung
http://wesbos.com/demos/html5-face-detection/
http://wesbos.com/html5-video-face-detection-canvas-javascript/
http://www.soundstep.com/blog/experiments/jstracking/
http://www.soundstep.com/blog/2012/03/19/javascript-motion-tracking/
http://trackingjs.com/docs.html#trackers
https://github.com/eduardolundgren/tracking-elements#object-tracker
http://techslides.com/demos/video-face/
https://github.com/mtschirs/js-objectdetect/blob/master/examples/example_sunglasses_jquery.htm
http://techslides.com/object-detection-with-html5-getusermedia/
http://gannon.tv/edge_demos/motiontracking/


-------------------------
GEO
------------------------
Anbei habe ich dir knapp 40 Standbilder geschickt. Du kannst ja mal schauen, welche Orte du erkennst und welche davon überhaupt zugänglich sind (Dresden Kaserne?). Ideal wäre jeweils ein Farbfoto aus der gleichen Perspektive. Gegenstände und Personen aus der heutigen Zeit stören dabei nicht - im Gegenteil. Personen sollten jedoch auf Grund möglicher Verletzungen ihrer Persönlichkeitsrechte (u.a. Recht am eigenen Bild) nicht identifizierbar sein. Darüber hinaus hast du alle künstlerischen Freiheiten. 
Zur praktischen Umsetzung ist sicher ein Ausdruck (oder Laptop) hilfreich zum Vergleich der Einstellung. 
Wenn es fünf Fotos werden, wäre es für den Anfang ausreichend. 

Drei Ziele oder Begründungen dazu:
- Drehorte identifizieren
- Gegenüberstellung der baulichen Substanz von heute und damals
- Sammlung von Zeitdokumenten von Terezin 2014


------------------------
Quellen
------------------------
Inzwischen konnten wir uns beim Neißefilmfest "Liga Terezin" ansehen. Im Film wird die Fußballszene des Propagandafilms einschließlich einiger, heute noch lebender Spieler von damals beleuchtet und heutigen antisemitischen Fankulturen gegenübergestellt. Exemplarisch wird Ajax Amsterdam angeführt, die sich selbst (auch aus Tradition) als jüdisch bezeichnen. Ebenso wird Sparta Prag mit rassistisch-antisemitistischen Slogan "Juden Slovaki" angeprangert. 
Der Film könnte für euch sehr interessant sein, um durch den Fußball einen besseren Zugang zu Jugendlichen zu finden. 

Notizen aus dem Film Liga Terezin:
- Die Mannschaften Jugendfürsorge spielte gegen die Kleiderkammer
- Spiel- und Aufnahmetag: 1. September 1944
- Sale Fischermann -- Schuster (weisses Band?)
- Pavel Breda (weisses Band?)
- Dobry, Obed, Milos (Spieler)
- Kurt und Egon Rach
- Zuschauer: Toman Broch (Professor), Honza Burka
Buch: Peter Erban
Simon Copper
Jüdische Fußballmannschaften  Ajax + Tottenham


Herbert Mandl
http://www.boerverlag.de/MANDL-B1.HTM


--------------------------
Script
---------------------------

Eine Gruppe von Lernenden wird in Zweiergruppen aufgeteilt und in die Lernumgebung eingeführt. Diese enthält neben dem/n Video/s ein interaktives Inhalts-, Personen- und Ortsverzeichnis sowie Verknüpfungen zu weiteren Filmischen Ressourcen.  
- In Phase 1 erhalten sie die Aufgabe Szenen im Film zu identifizieren, die 
-- a) stark übertrieben wirken, 
-- b) wo sie das Gefühl haben, dass etwas fehlt bzw. nicht dargestellt wird, 
-- c) die Augen der Personen im Film eine besondere Wirkung haben. Die zeitliche Position von drei solcher Szenen wird markiert und mit eigenen Worten begründet.
- In Phase 2 werden dem Lernenden lediglich die zeitlichen Markierungen ihres Gruppenpartners angezeigt. Sie erhalten die Aufgabe, diese in Bezug auf die Fragestellung in Phase 1 zu beschreiben
- In Phase 3 analysisert die Lernumgebung die am häufigsten kommentierten Szenen. Jene Gruppen, die an der Diskussion dieser Szenen beteiligt waren erläutern allen Lernenden ihre Feststellungen.



# API stuff
https://github.com/hapijs/hapi
http://fortunejs.com/api/#serializer





# Install etherpad
- git clone ...
- sh ./_tools/etherpad-lite/bin/run.sh -s settings.json --root
- replace API-kex and session.json
sh ./_tools/etherpad-lite/bin/run.sh -s settings.json -s settings.json

As service
sudo adduser --system --home=/opt/etherpad --group etherpad
sudo mkdir /var/log/etherpad-lite
sudo chown etherpad /var/log/etherpad-lite
sudo chown -R etherpad /var/log/etherpad-lite
sudo vi /etc/init/etherpad-lite.conf
sudo start etherpad-lite

--
description "etherpad-lite"
start on started networking
stop on runlevel [!2345]
env EPHOME=/home/abb/Documents/www2/e2script/_tools/etherpad-lite
env EPHOME=/home/niels/www2/e2script/_tools/etherpad-lite
env EPLOGS=/var/log/etherpad-lite
env EPUSER=etherpad


pre-start script
    cd $EPHOME
    mkdir $EPLOGS                              ||true
    chown $EPUSER:admin $EPLOGS                ||true
    chmod 0755 $EPLOGS                         ||true
    chown -R $EPUSER:admin $EPHOME/var         ||true
    $EPHOME/bin/installDeps.sh >> $EPLOGS/error.log || { stop; exit 1; }
end script

script
	$EPHOME/bin/run.sh -s settings.json >> $EPLOGS/error.log || { stop; exit 1; }
end script
--


## Etherpad as a service

-    Create a user called etherpad-lite
-    Create a log folder for the service /var/log/etherpad-lite
-    Ensure the etherpad-lite user have full access to the log and the git folder
-    Copy following script to /etc/init.d/ and configure the variables. You might want also configure the runSafe script in your git folder to ensure you get email notifications if there are problems with the applications
-    Make sure the script is marked as executable: chmod +x /etc/init.d/etherpad-lite
-    If etherpad-lite is not installed in /usr/share/etherpad-lite create a link with ln -s /your-path-to/etherpad-lite /usr/share/etherpad-lite
-    Enable it with update-rc.d etherpad-lite defaults
-    start with sudo service etherpad-lite start

--
#!/bin/sh

### BEGIN INIT INFO
# Provides:          etherpad-lite
# Required-Start:    $local_fs $remote_fs $network $syslog
# Required-Stop:     $local_fs $remote_fs $network $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts etherpad lite
# Description:       starts etherpad lite using start-stop-daemon
### END INIT INFO

PATH="/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin:/opt/node/bin"
LOGFILE="/var/log/etherpad-lite/etherpad-lite.log"
EPLITE_DIR="/usr/share/etherpad-lite" 
EPLITE_BIN="bin/run.sh"
USER="etherpad"
GROUP="etherpad"
DESC="Etherpad Lite"
NAME="etherpad-lite"

set -e

. /lib/lsb/init-functions

start() {
  echo "Starting $DESC... "

    start-stop-daemon --start --chuid "$USER:$GROUP" --background --make-pidfile --pidfile /var/run/$NAME.pid --exec $EPLITE_DIR/$EPLITE_BIN -s settings.json -- $LOGFILE || true
  echo "done"
}

#We need this function to ensure the whole process tree will be killed
killtree() {
    local _pid=$1
    local _sig=${2-TERM}
    for _child in $(ps -o pid --no-headers --ppid ${_pid}); do
        killtree ${_child} ${_sig}
    done
    kill -${_sig} ${_pid}
}

stop() {
  echo "Stopping $DESC... "
  if test -f /var/run/$NAME.pid; then
    while test -d /proc/$(cat /var/run/$NAME.pid); do
      killtree $(cat /var/run/$NAME.pid) 15
      sleep 0.5
    done
    rm /var/run/$NAME.pid
  fi
  echo "done"
}

status() {
  status_of_proc -p /var/run/$NAME.pid "" "etherpad-lite" && exit 0 || exit $?
}

case "$1" in
  start)
      start
      ;;
  stop)
    stop
      ;;
  restart)
      stop
      start
      ;;
  status)
      status
      ;;
  *)
      echo "Usage: $NAME {start|stop|restart|status}" >&2
      exit 1
      ;;
esac

exit 0
--
