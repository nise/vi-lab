

## Initial download to source from github 
git clone https://github.com/nise/moduleBase


## Update source from github repository
git fetch --all
git reset --hard origin/master


## run and stop server in demo mode
node server

**to stop press:** ctrl+c

## run server in production
sudo forever start -a -l forever.log -o out.log -e err.log server.js

## stop server in production
sudo forever stop server.js



## view error log
cat err.log

or

tail err.log

## dump and restore database
mongodb: mongodb://localhost/module-base
**dump**
mongodump --db <application name>
**restore**
mongorestore --db <application name> ./dump/module-base
**convert database for inspection**
bsondump collection.bson > collection.json

