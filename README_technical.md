# How to install and setup

## Install node.js 
-- sudo apt-get install mongodb nodejs libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev npm libav-tools git

-- sudo npm install mongodb path express express-validator socket.io node-fs csv node-schedule ejs-locals passport passport-local connect-flash canvas identicon mongoose csv mv cookie-parser express-json body-parser method-override express-session mongoose fluent-ffmpeg moment depd bytes raw-body iconv-lite on-finished media-typer type-is multer ipware

* Find out install location:
 which nodejs

async



## Install additional applications

### nginx
#### install nginx
sudo apt-get install nginx

#### define config file

**delete the old config**
sudo rm /etc/nginx/sites-enabled/default

sudo vi /etc/nginx/sites-available/node

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_set_header   X-Forwarded-For $remote_addr;
        proxy_set_header   Host $http_host;
        proxy_pass         "http://127.0.0.1:3033";
    }
}
#### Set symlink to config file
sudo ln -s /etc/nginx/sites-available/node /etc/nginx/sites-enabled/node

#### Start nginx
sudo service nginx restart



**etherpad**
-- über git in einen ordner installieren
-- Datei settings.json mit port und vor allem mysql-verbindung anpassen
-- starte: sh ./_tools/etherpad-lite/bin/run.sh -s settings.json

### Betrieb
-- node server.js   oder sudo nodejs server
-- sudo forever start -a -l forever.log -o out.log -e err.log server.js
-- sudo forever stop server.js
-- both: sudo forever stop server.js && sudo forever start -a -l forever.log -o out.log -e err.log server.js

-- run etherpad: sh ./_tools/etherpad-lite/bin/run.sh -s settings.json &

=> auto update bei crah oder update: http://stackoverflow.com/questions/11084279/node-js-setup-for-easy-deployment-and-updating


## Install on server
git clone https://github.com/nise/vi-lab

## Update from this repository
git fetch --all
git reset --hard origin/master

## dump and restore mongoDB
mongodb: mongodb://localhost/etutor
**dump**
mongodump --db <application name>
mongodump --db etutor
**restore**
mongorestore --db <application name> ./dump/<application name>
mongorestore --db etutor ./dump/etutor
**convert database for inspection**
bsondump collection.bson > collection.json


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
