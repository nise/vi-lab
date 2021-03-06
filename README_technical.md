# How to install and setup

## Prerequisites
1. Install [node.js](https://nodejs.org/en/download/current/) version > 5
    - The latest version of npm is installed automatically with node.js installer. Additional information [here](http://blog.npmjs.org/post/85484771375/how-to-install-npm)
2. Install other dependencies
    - Windows: Python between > 2.5 and < 3.0
    - Linux: `sudo apt-get install python3 libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev npm libav-tools git`
3. Install [MongoDB latest version](https://www.mongodb.com/download-center)
    - [Instructions](https://docs.mongodb.com/manual/administration/install-community/) for installation and Setup of MongoDB
    - In the end you have to be able to run mongod.exe and mongo.exe from your command line
4. For production mode we recomment installing 'forever' globaly on you system
    - For MacOS and Linux: `$ sudo npm install forever -g`

## Start working with vi-lab
1. Fork this repository
2. Go to your command line and clone your fork to your local machine: `$ git clone https://github.com/YOUR_USERNAME/vi-lab`
3. In you command prompt go to vi-lab folder. You can use cd command to navigate to vi-lab directory: 
    - For Windows: `$ cd C:\path\to\vi-lab`
    - For MacOS and Linux: `$ cd \path\to\vi-lab`
4. Restore the data from the dump `$ mongorestore --db etutor ./dump/etutor` 
    - Make sure that you defined the right path to your database in MongoDB:
        - For Windows: `$ mongod.exe --dbpath C:\path\to\db`
5. Install the required node modules:
    - For Windows: `$ npm update`
    - For MacOS and Linux: `$ sudo npm update`
6. Run the node server: `$ node server`
7. Open the following page in your browser: http://localhost:3033/login (you can replace 'localhost' with the name of your server)
8. Check the demo login:
    - user: bob
    - password: secret




## Update from this repository
git fetch --all && git reset --hard origin/master

## dump and restore mongoDB
mongodb: mongodb://localhost/etutor
**dump**
mongodump --forceTableScan --db <application name>
mongodump --forceTableScan --db etutor
**restore**
mongorestore --db <application name> ./dump/<application name>
mongorestore --db etutor ./dump/etutor
**convert database for inspection**
bsondump collection.bson > collection.json



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
        proxy_pass http://127.0.0.1:3033;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
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
-- LINUX: export NODE_ENV=development
-- node server.js   oder sudo nodejs server
IS_PROD=1 forever start -a -l forever.log -o out.log -e err.log server.js
or
NODE_ENV=production forever start -a -l forever.log -o out.log -e err.log server.js
-- sudo forever stop server.js
-- both: sudo forever stop server.js && sudo forever start -a -l forever.log -o out.log -e err.log server.js

-- run etherpad: sh ./_tools/etherpad-lite/bin/run.sh -s settings.json &


sudo /home/niels/.nvm/versions/node/v5.0.0/bin/forever-service install vi-lab --nologrotate --script server.js
sudo /home/niels/.nvm/versions/node/v5.0.0/bin/forever-service delete vi-lab
sudo /home/niels/.nvm/versions/node/v5.0.0/bin/forever list


=> auto update bei crah oder update: http://stackoverflow.com/questions/11084279/node-js-setup-for-easy-deployment-and-updating




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
