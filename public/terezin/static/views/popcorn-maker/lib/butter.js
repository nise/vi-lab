/**
 * MIT LICENSE
 * Copyright (c) 2011, Mozilla Foundation
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 *     Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     Neither the name of the Mozilla Foundation nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function () {

  // Bail if there is already a butter in the page.
  if ( this.butter ) {
    return;
  }

/**
 * almond 0.0.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
/*jslint strict: false, plusplus: false */
/*global */

var requirejs, require, define;
(function () {

    var defined = {},
        aps = Array.prototype.slice,
        ostring = Object.prototype.toString,
        req;

    function isFunction(it) {
        return ostring.call(it) === "[object Function]";
    }

    function isArray(it) {
        return ostring.call(it) === "[object Array]";
    }

    if (typeof define === "function" && define.amd) {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; (part = ary[i]); i++) {
            if (part === ".") {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === "..") {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseName = baseName.split("/");
                baseName = baseName.slice(0, baseName.length - 1);

                name = baseName.concat(name.split("/"));
                trimDots(name);

                name = name.join("/");
            }
        }
        return name;
    }

    /**
     * Helper function that creates a setExports function for a "module"
     * CommonJS dependency. Do this here to avoid creating a closure that
     * is part of a loop.
     */
    function makeSetExports(moduleObj) {
        return function (exports) {
            moduleObj.exports = exports;
        };
    }

    function makeRequire(relName) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);
            args.push(relName);
            return req.apply(null, args);
        };
    }

    function main(name, deps, callback, relName) {
        var args = [],
            usingExports = false,
            cjsModule, depName, i, ret;

        //Call the callback to define the module, if necessary.
        if (isFunction(callback)) {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            if (deps) {
                for (i = 0; i < deps.length; i++) {
                    depName = normalize(deps[i], (name || relName));

                    //Fast path CommonJS standard dependencies.
                    if (depName === "require") {
                        args[i] = makeRequire(name);
                    } else if (depName === "exports") {
                        //CommonJS module spec 1.1
                        args[i] = defined[name] = {};
                        usingExports = true;
                    } else if (depName === "module") {
                        //CommonJS module spec 1.1
                        cjsModule = args[i] = {
                            id: name,
                            uri: '',
                            exports: defined[name]
                        };
                        cjsModule.setExports = makeSetExports(cjsModule);
                    } else {
                        args[i] = defined[depName];
                    }
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undefined) {
                    ret = defined[name] = cjsModule.exports;
                } else if (ret === undefined && usingExports) {
                    //exports already set the defined value.
                    ret = defined[name];
                } else {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    }

    requirejs = req = function (deps, callback, relName) {
        var moduleName, fullName, config;

        //Determine if have config object in the call.
        //Drop the config stuff on the ground.
        if (!isArray(deps) && typeof deps !== "string") {
            // deps is a config object
            config = deps;
            if (isArray(callback)) {
                // Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
            } else {
                deps = [];
            }
        }

        if (typeof deps === "string") {

            //Just return the module wanted. In this scenario, the
            //second arg (if passed) is just the relModuleMap.
            moduleName = deps;
            relName = callback;

            //Normalize module name, if it contains . or ..
            fullName = normalize(moduleName, relName);

            if (!(fullName in defined)) {
                throw new Error("Module name '" +
                            fullName +
                            "' has not been loaded.");
            }
            return defined[fullName];
        }

        //Simulate async callback;
        setTimeout(function () {
            main(null, deps, callback, relName);
        }, 15);

        return req;
    };

    /**
     * Support require.config() to make it easier to cooperate with other
     * AMD loaders on globally agreed names.
     */
    req.config = function (config) {
        return req(config);
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (typeof require === "undefined") {
        require = req;
    }

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps;
            deps = [];
        }

        main(name, deps, callback);
    };

    define.amd = {};
}());

define("tools/almond", function(){});

/*jshint white: false, strict: false, plusplus: false, evil: true,
  onevar: false, nomen: false */
/*global require: false, document: false, console: false, window: false,
  setTimeout: false */

/**
 * In the source case, use document.write to write out the require tag,
 * and load all moduels as distinct scripts for debugging. After a build,
 * all the modules are inlined, so will not use the document.write path.
 * Use has() testing module, since the requirejs optimizer will convert
 * the has test to false, and minification will strip the false code
 * branch. http://requirejs.org/docs/optimization.html#hasjs
 */
(function () {
    // Stub for has function.
    function has() {
        return true;
    }

    var Butter = function() {
      if ( !Butter.__waiting ) {
        Butter.__waiting = [];
      } //if
      Butter.__waiting.push( arguments );
    };

    if ( !window.Butter ) {
      window.Butter = Butter;
    } //if

    if ( false ) {
        // Get the location of the butter source.
        // The last script tag should be the butter source
        // tag since in dev, it will be a blocking script tag,
        // so latest tag is the one for this script.
        var scripts = document.getElementsByTagName( 'script' ),
        path = scripts[scripts.length - 1].src;
        path = path.split( '/' );
        path.pop();
        path = path.join( '/' ) + '/';

        if ( !window.require ) {
          document.write( '<script src="' + path + '../external/require/require.js"></' + 'script>' );
        } //if

        // Set up paths to find scripts.
        document.write('<script>' + 
          '(function(){' + 
          'var ctx = require.config({ ' + 
            'baseUrl: "' + path + '",' +
            'context: "butter",' +
            'paths: {' +
              'trackLiner: "' + path + '../external/trackLiner",' +
              'butter: "' + path + '"' +
              // Paths are relative to baseUrl; Notice the commas!
            '}' +
          '});' +
          'ctx(["butter-main"])' + 
          '})()' +
        '</script>');
    }

}());

define("butter", function(){});

(function() {

  define('core/logger',[], function() {

    return function( name ) {

      this.log = function( message ) {
        console.log( "[" + name + "] " + message );
      }; //log

      this.error = function( message ) {
        throw new Error( "[" + name + "]" + message ); 
      }; //error

    }; //Logger

  }); //define

})();

/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function() {
  define('core/eventmanager',[ "core/logger" ], function( Logger ) {

    var EventManager = function( emOptions ) {

      var listeners = {},
          related = {},
          id = "EventManager" + EventManager.guid++,
          logger = emOptions.logger || new Logger( id ),
          targetName = id,
          that = this;
      
      this.listen = function( type, listener, relatedObject ) {
        if ( type && listener ) {
          if ( !listeners[ type ] ) {
            listeners[ type ] = [];
          } //if
          listeners[ type ].push( listener );
          if ( relatedObject ) {
            if ( !related[ relatedObject ] ) {
              related[ relatedObject ] = [];
            } //if
            related[ relatedObject ].push( listener );
          } //if
        }
        else {
          logger.error( "type and listener required to listen for event." );
        } //if
      }; //listen

      this.unlisten = function( type, listener ) {
        if ( type && listener ) {
          var theseListeners = listeners[ type ];
          if ( theseListeners ) {
            var idx = theseListeners.indexOf( listener );
            if ( idx > -1 ) {
              theseListeners.splice( idx, 1 );
            } //if
          } //if
        }
        else if ( type ) {
          if ( listeners[ type ] ) {
            listeners[ type ] = [];
          } //if
        }
        else {
          logger.error( "type and listener required to unlisten for event" );
        } //if
      }; //unlisten

      this.unlistenByType = function( type, relatedObject ) {
        var relatedListeners = related[ relatedObject ];
        for ( var i=0, l=relatedListeners; i<l; ++i ) {
          that.unlisten( type, relatedListeners[ i ] );
        } //for
        delete related[ relatedObject ];
      }; //unlistenByType

      this.dispatch = function( typeOrEvent, data, domain ) {
        var type,
            preparedEvent,
            varType = typeof( typeOrEvent );
        if ( varType === "object" ) {
          type = typeOrEvent.type;
          preparedEvent = typeOrEvent;
          preparedEvent.currentTarget = target || that;
        }
        else if ( varType === "string" ) {
          type = typeOrEvent;
        } //if

        if ( type ) {
          var theseListeners;
          //copy the listeners to make sure they're all called
          if ( listeners[ type ] ) {
            theseListeners = [];
            for ( var i=0, l=listeners[ type ].length; i<l; ++i ) {
              theseListeners.push( listeners[ type ][ i ] );
            } //for
            var e = preparedEvent || {
              currentTarget: target || that,
              target: target || that,
              domain: domain || targetName,
              type: type,
              data: data
            };
            for ( var i=0, l=theseListeners.length; i<l; ++i ) {
              theseListeners[ i ]( e );
            } //for
          } //if
        }
        else {
          logger.error( "type required to dispatch event" );
        } //if
      }; //dispatch

      this.apply = function( name, to ) {
        to.listen = that.listen;
        to.unlisten = that.unlisten;
        to.dispatch = that.dispatch;
        targetName = name;
        target = to;
      }; //apply

      this.repeat = function( e ) {
        that.dispatch( e );
      }; //repeat

    }; //EventManager
    EventManager.guid = 0;

    return EventManager;

  }); //define

})();

(function() {
  define('core/trackevent',[ "core/logger", "core/eventmanager" ], function( Logger, EventManager ) {

    var TrackEvent = function ( options ) {

      options = options || {};

      var that = this,
          id = "TrackEvent" + TrackEvent.guid++,
          name = options.name || 'Track' + Date.now(),
          logger = new Logger( id ),
          em = new EventManager( { logger: logger } ),
          track,
          type = options.type,
          properties = [],
          popcornOptions = options.popcornOptions || {
            start: that.start,
            end: that.end
          };

      em.apply( "TrackEvent", this );

      this.update = function( updateOptions ) {
        for ( var prop in updateOptions ) {
          if ( updateOptions.hasOwnProperty( prop ) ) {
            popcornOptions[ prop ] = updateOptions[ prop ];
          } //if
        } //for
        em.dispatch( "trackeventupdated", that );
      }; //update

      function clone( obj ) {
        var newObj = {};
        for ( var prop in obj ) {
          if ( obj.hasOwnProperty( prop ) ) {
            newObj[ prop ] = obj[ prop ];
          } //if
        } //for
        return newObj;
      } //clone

      Object.defineProperty( this, "popcornOptions", {
        enumerable: true,
        get: function() {
          return clone( popcornOptions );
        }
      });

      Object.defineProperty( this, "type", {
        enumerable: true,
        get: function() {
          return type;
        }
      });

      Object.defineProperty( this, "track", {
        get: function() {
          return track;
        },
        set: function( val ) {
          track = val;
          em.dispatch( "trackeventtrackchanged", that );
        }
      });

      Object.defineProperty( this, "name", {
        get: function() {
          return name;
        }
      });

      Object.defineProperty( this, "id", {
        get: function() {
          return id;
        }
      });

      Object.defineProperty( this, "json", {
        get: function() {
          return {
            id: id,
            type: this.type,
            popcornOptions: clone ( popcornOptions ),
            track: this.track ? this.track.name : undefined,
            name: name
          };
        },
        set: function( importData ) {

          type = popcornOptions.type = importData.type;
          if ( importData.name ) {
            name = importData.name;
          }
          popcornOptions = importData.popcornOptions;
        }
      });

    }; //TrackEvent
    TrackEvent.guid = 0;

    return TrackEvent;

  }); //define

})();

/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function() {
  define('core/track',[ "core/logger", "core/eventmanager", "core/trackevent" ], function( Logger, EventManager, TrackEvent ) {

    var Track = function ( options ) {
      options = options || {};

      var trackEvents = [],
          id = "Track" + Track.guid++,
          target = options.target,
          logger = new Logger( id ),
          em = new EventManager( { logger: logger } ),
          that = this;

      options = options || {};
      var name = options.name || 'Track' + Date.now();

      em.apply( "Track", this );

      Object.defineProperty( this, "target", {
        get: function() {
          return target;
        },
        set: function( val ) {
          target = val;
          em.dispatch( "tracktargetchanged", that );
          for( var i=0, l=trackEvents.length; i<l; i++ ) {
            trackEvents[ i ].target = val;
            trackEvents[ i ].update({ target: val });
          } //for
          logger.log( "target changed: " + val );
        }
      }); //target

      Object.defineProperty( this, "name", {
        get: function() {
          return name;
        }
      }); //name

      Object.defineProperty( this, "id", {
        get: function() {
          return id;
        }
      }); //id

      Object.defineProperty( this, "json", {
        get: function() {
          var exportJSONTrackEvents = [];
          for ( var i=0, l=trackEvents.length; i<l; ++i ) {
            exportJSONTrackEvents.push( trackEvents[ i ].json );
          }
          return {
            name: name,
            id: id,
            trackEvents: exportJSONTrackEvents
          };
        },
        set: function( importData ) {
          if ( importData.name ) {
            name = importData.name;
          }
          if ( importData.trackEvents ) {
            var importTrackEvents = importData.trackEvents;
            for ( var i=0, l=importTrackEvents.length; i<l; ++i ) {
              var newTrackEvent = new TrackEvent();
              newTrackEvent.json = importTrackEvents[ i ];
              that.addTrackEvent( newTrackEvent );
            }
          }
        }
      }); //json

      this.getTrackEvent = function ( trackEvent ) {
        for ( var i=0, l=trackEvents.length; i<l; ++i) {
          if (  ( trackEvent.id !== undefined && trackEvents[ i ].id === trackEvent.id ) || 
                ( trackEvent.name && trackEvents[ i ].name === trackEvent.name ) ||
                trackEvents[ i ].name === trackEvent ) {
            return trackEvents[i];
          } //if
        } //for
      }; //getTrackEvent

      Object.defineProperty( this, "trackEvents", {
        get: function() {
          return trackEvents;
        }
      }); //trackEvents

      this.addTrackEvent = function ( trackEvent ) {
        if ( !( trackEvent instanceof TrackEvent ) ) {
          trackEvent = new TrackEvent( trackEvent );
        } //if
        if ( target ) {
          trackEvents.target = target;
        } //if
        trackEvents.push( trackEvent );
        trackEvent.track = that;
        trackEvent.listen( "trackeventupdated", em.repeat );
        em.dispatch( "trackeventadded", trackEvent );
        return trackEvent;
      }; //addTrackEvent

      this.removeTrackEvent = function( trackEvent ) {
        if ( typeof(trackEvent) === "string" ) {
          trackEvent = that.getTrackEvent( trackEvent );
        } //if

        var idx = trackEvents.indexOf( trackEvent );

        if ( idx > -1 ) {
          trackEvents.splice( idx, 1 );
          trackEvent.track = undefined;
          trackEvent.unlisten( "trackeventupdated", em.repeat );
          em.dispatch( "trackeventremoved", trackEvent );
        } //if

      }; //removeEvent

    }; //Track
    Track.guid = 0;

    return Track;

  }); //define
})();

/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function() {
  define('core/target',[ "core/logger", "core/eventmanager" ], function( Logger, EventManager ) {

    var Target = function ( options ) {
      var id = Target.guid++,
          logger = new Logger( id ),
          em = new EventManager( { logger: logger } );

      em.apply( "Target", this );

      options = options || {};
      var name = options.name || "Target" + id + Date.now();
      this.object = options.object;

      Object.defineProperty( this, "name", {
        get: function() {
          return name;
        },
      });

      Object.defineProperty( this, "id", {
        get: function() {
          return id;
        },
      });

      Object.defineProperty( this, "json", {
        get: function() {
          var obj;
          try {
            obj = JSON.stringify( this.object );
          }
          catch ( e ) {
            obj = this.object.toString();
          }
          return {
            id: id,
            name: name,
            object: obj
          };
        },
        set: function( importData ) {
          if ( importData.name ) {
            name = importData.name
          }
          this.object = importData.object
        }
      });
    }; //Target
    Target.guid = 0;

    return Target;

  }); //define
})();

/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function() {
  define('core/media',[
      "core/logger", 
      "core/eventmanager", 
      "core/track" ], 
    function( Logger, EventManager, Track ) {

    var Media = function ( options ) {
      options = options || {};

      var tracks = [],
          id = "Media" + Media.guid++,
          logger = new Logger( id ),
          em = new EventManager( { logger: logger } ),
          name = options.name || id + Date.now(),
          url,
          target,
          registry,
          currentTime = 0,
          duration = 0,
          that = this;

      em.apply( "Media", this );

      Object.defineProperty( this, "url", {
        get: function() {
          return url;
        },
        set: function( val ) {
          if ( url !== val ) {
            url = val;
            em.dispatch( "mediacontentchanged", that );
          }
        }
      });

      Object.defineProperty( this, "target", {
        get: function() {
          return target;
        },
        set: function( val ) {
          if ( target !== val ) {
            target = val;
            em.dispatch( "mediatargetchanged", that );
          }
        }
      });

      Object.defineProperty( this, "name", {
        get: function() {
          return name;
        }
      });

      Object.defineProperty( this, "id", {
        get: function() {
          return id;
        }
      });

      Object.defineProperty( this, "tracks", {
        get: function() {
          return tracks;
        }
      });

      Object.defineProperty( this, "currentTime", {
        get: function() {
          return currentTime;
        },
        set: function( time ) {
          if ( time !== undefined ) {
            currentTime = time;
            if ( currentTime < 0 ) {
              currentTime = 0;
            }
            if ( currentTime > duration ) {
              currentTime = duration;
            } //if
            em.dispatch( "mediatimeupdate", that );
          } //if
        }
      });

      Object.defineProperty( this, "duration", {
        get: function() {
          return duration;
        },
        set: function( time ) {
          if ( time ) {
            duration = time;
            logger.log( "duration changed to " + duration );
            em.dispatch( "mediadurationchanged", that );
          }
        }
      });

      this.addTrack = function ( track ) {
        if ( !( track instanceof Track ) ) {
          track = new Track( track );
        } //if
        tracks.push( track );
        track.listen( "tracktargetchanged", em.repeat );
        track.listen( "trackeventadded", em.repeat );
        track.listen( "trackeventremoved", em.repeat );
        track.listen( "trackeventupdated", em.repeat );
        em.dispatch( "trackadded", track );
        var trackEvents = track.trackEvents;
        if ( trackEvents.length > 0 ) {
          for ( var i=0, l=trackEvents.length; i<l; ++i ) {
            track.dispatch( "trackeventadded", trackEvents[ i ] );
          } //for
        } //if
        return track;
      }; //addTrack

      this.getTrack = function ( track ) {
        for ( var i=0, l=tracks.length; i<l; ++i ) {
          if (  ( track.id !== undefined && tracks[ i ].id === track.id ) ||
                ( track.name && tracks[ i ].name === track.name ) ||
                tracks[ i ] === track ) {
            return tracks[ i ];
          } //if
        } //for
        return undefined;
      }; //getTrack

      this.removeTrack = function ( track ) {
        if ( typeof(track) === "string" ) {
          track = that.getTrack( { name: track } );
        } //if
        var idx = tracks.indexOf( track );
        if ( idx > -1 ) {
          tracks.splice( idx, 1 );
          var events = track.trackEvents;
          for ( var i=0, l=events.length; i<l; ++i ) {
            em.dispatch( "trackeventremoved", events[i] );
          } //for
          track.unlisten( "tracktargetchanged", em.repeat );
          track.unlisten( "trackeventadded", em.repeat );
          track.unlisten( "trackeventremoved", em.repeat );
          track.unlisten( "trackeventupdated", em.repeat );
          em.dispatch( "trackremoved", track );
          return track;
        } //if
        return undefined;    
      }; //removeTrack


      Object.defineProperty( this, "json", {
        get: function() {
          var exportJSONTracks = [];
          for ( var i=0, l=tracks.length; i<l; ++i ) {
            exportJSONTracks.push( tracks[ i ].json );
          }
          return {
            id: id,
            name: name,
            url: url,
            target: target,
            duration: duration,
            tracks: exportJSONTracks
          };
        },
        set: function( importData ) {
          if ( importData.name ) {
            name = importData.name;
          }
          if ( importData.target ) {
            that.target = importData.target;
          }
          if ( importData.url ) {
            that.url = importData.url;
          }
          if ( importData.tracks ) {
            var importTracks = importData.tracks;
            for ( var i=0, l=importTracks.length; i<l; ++i ) {
              var newTrack = new Track();
              newTrack.json = importTracks[ i ];
              that.addTrack( newTrack );
            }
          }
        }
      }); //json

      Object.defineProperty( this, "registry", {
        get: function() {
          return registry;
        },
        set: function( val ) {
          registry = val;
        }
      });

      this.getManifest = function( name ) {
        return registry[ name ];
      }; //getManifest

      if ( options.url ) {
        this.url = options.url;
      }
      if ( options.target ) {
        this.target = options.target;
      }

    }; //Media
    Media.guid = 0;

    return Media;

  });
})();

(function ( window, document, undefined ) {

  define('comm/comm',[ "core/logger", "core/eventmanager" ] , function( Logger, EventManager ) {

    var MESSAGE_PREFIX = "BUTTER", MESSAGE_PREFIX_LENGTH = MESSAGE_PREFIX.length;

    var parseEvent = function ( e, win ) {
      if ( e.source !== win && e.data.indexOf( MESSAGE_PREFIX ) === 0 ) {
        return JSON.parse( e.data.substring( MESSAGE_PREFIX_LENGTH ) );
      } //if
    }; //parseEvent

    var CommClient = function ( name, onmessage ) {

      var id = CommClient.guid++,
          logger = new Logger( id ),
          em = new EventManager( { logger: logger } ),
          that = this;

      em.apply( "CommClient", this );

      window.addEventListener('message', function ( e ) {
        var data = parseEvent( e, window );
        if ( data ) {
          em.dispatch( data.type, data.message );
          onmessage && onmessage( data );
        } //if
      }, false);

      this.send = function ( message, type ) {
        if ( !type ) {
          postMessage( MESSAGE_PREFIX + JSON.stringify( message ), "*" );
        }
        else {
          postMessage( MESSAGE_PREFIX + JSON.stringify( { type: type, message: message } ), "*" );
        } //if
      }; //send

      this.async = function( message, type, handler ) {
        var wrapper = function( message ) {
          that.unlisten( type, wrapper );
          handler( message );
        }; //wrapper
        that.listen( type, wrapper ); 
        that.send( message, type );
      }; //async

      this.returnAsync = function( type, handler ) {
        that.listen( type, function( message ) {
          that.send( handler( message ), type );
        });
      }; //returnAsync

    }; //CommClient
    CommClient.guid = 0;

    var CommServer = function () {

      var id = CommServer.guid++,
          clients = {},
          logger = new Logger( id ),
          em = new EventManager( { logger: logger } ),
          that = this;

      em.apply( "CommServer", this );

      var Client = function( name, client, callback ) {

        var id = Client.guid++,
            clientWindow = client,
            logger = new Logger( id ),
            em = new EventManager( { logger: logger } ),
            that = this;

        em.apply( "Client", this );

        this.getName = function () {
          return name;
        };

        this.send = function ( message, type ) {
          if ( clientWindow ) {
            if ( !type ) {
              clientWindow.postMessage( MESSAGE_PREFIX + JSON.stringify( message ), "*" );
            }
            else {
              clientWindow.postMessage( MESSAGE_PREFIX + JSON.stringify( { type: type, message: message } ), "*" );
            } //if
          } //if
        }; //send

        this.async = function( message, type, handler ) {
          var wrapper = function( message ) {
            that.unlisten( type, wrapper );
            handler( message );
          }; //wrapper
          that.listen( type, wrapper ); 
          that.send( message, type );
        }; //async

        this.init = function( readyClient ) {
          clientWindow = readyClient;
          clientWindow.addEventListener( "message", function ( e ) {
            var data = parseEvent( e, window );
            if ( data ) {
              em.dispatch( data.type, data.message );
              callback && callback( data );
            } //if
          }, false );
        }; //init

        this.destroy = function() {
        }; //destroy

      }; //Client
      Client.guid = 0;

      this.bindFrame = function ( name, frame, readyCallback, messageCallback ) {
        clients[ name ] = new Client( name, frame.contentWindow, messageCallback );
        frame.addEventListener( "load", function ( e ) {
          clients[ name ].init( frame.contentWindow );
          readyCallback && readyCallback( e );
        }, false );
      };

      this.bindWindow = function ( name, win, readyCallback, messageCallback ) {
        clients[ name ] = new Client( name, win, messageCallback );
        win.addEventListener( "load", function ( e ) {
          clients[ name ].init( win );
          readyCallback && readyCallback( e );
        }, false );
      };

      this.bindClientWindow = function ( name, client, callback ) {
        clients[ name ] = new Client( name, client, callback );
        clients[ name ].init( client );
      };

      this.listen = function ( name, type, callback ) {
        clients[ name ] && clients[ name ].listen( type, callback );
      };

      this.unlisten = function ( name, type, callback ) {
        clients[ name ] && clients[ name ].unlisten( type, callback );
      };

      this.send = function ( name, message, type ) {
        clients[ name ] && clients[ name ].send( message, type );
      };

      this.async = function( name, message, type, handler ) {
        clients[ name ] && clients[ name ].async( message, type, handler );
      };

      this.destroy = function( name ) {
        if ( name ) {
          clients[ name ] && clients[ name ].destroy();
          delete clients[ name ];
        }
        else {
          for ( var clientName in clients ) {
            if ( clients.hasOwnProperty( clientName ) ) {
              clients[ clientName ].destroy();
              delete clients[ clientName ];
            } //if
          } //for
        } //if
      }; //destroy

    }; //CommServer
    CommServer.guid = 0;

    return {
      CommClient: CommClient,
      CommServer: CommServer,
      parseStartEvent: parseEvent
    };

  }); //define
})( window, window.document );

/*********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function() {

  define('eventeditor/module',[ "core/logger", "core/eventmanager", "core/trackevent", "comm/comm" ], function( Logger, EventManager, TrackEvent, Comm ) {

    var EventEditor = function( butter, options ) {

      options = options || {};

      var editors = {},
          commServer = new Comm.CommServer(),
          logger = new Logger( "EventEditor" ),
          em = new EventManager( { logger: logger } ),
          that = this;

      em.apply( "EventEditor", this );

      var Editor = function ( options ) {
        var target = options.target,
            type = options.type,
            source = options.source,
            editorHeight,
            editorWidth,
            targetContainer,
            targetWindow,
            that = this;

        var editorLinkName = "editorLink" + Editor.guid++;

        editorWidth = options.editorWidth || 400;
        editorHeight = options.editorHeight || 400;

        function clearTarget() {
          while ( targetContainer.firstChild ) {
            targetContainer.removeChild( targetContainer.firstChild );
          }
        } //clearTarget

        if ( typeof target === "string" && target !== "window" ) {
          targetContainer = document.getElementById( target );
        } //if

        this.construct = function( trackEvent ) {
          var updateEditor = function( e ){
            var sendObj = {
              "id": e.data.id, 
              "options": e.data.popcornOptions
            };
            commServer.send( editorLinkName, sendObj, "trackeventupdated" );
          };
          var checkRemoved = function( e ) {
            commServer.send( editorLinkName, e.data.id, "trackeventremoved" );
          };
          var targetAdded = function( e ) {
            commServer.send( editorLinkName, butter.targets, "domtargetsupdated" );
          };
          var clientDimsUpdated = function( e ) {
            var dims = e.data;
            editorHeight = dims.height;
            editorWidth = dims.width;
            em.dispatch( "clientdimsupdated", that );
          };
          var undoListeners = function() {
            butter.unlisten( "trackeventupdated", updateEditor );
            butter.unlisten( "targetadded", targetAdded );
            butter.unlisten( "trackeventremoved", checkRemoved );
            butter.unlisten( "clientdimsupdated", clientDimsUpdated );
            commServer.unlisten( editorLinkName, "okayclicked" );
            commServer.unlisten( editorLinkName, "applyclicked" );
            commServer.unlisten( editorLinkName, "deleteclicked" );
            commServer.unlisten( editorLinkName, "cancelclicked" );
            commServer.unlisten( editorLinkName, "clientdimsupdated" );
            commServer.destroy( editorLinkName );
          };

          function filterKnownFields( fields ) {
            var val;

            function checkNumber( num ) {
              var val = parseFloat( num );
              if ( isNaN( val ) || val < 0 ) {
                val = 0;
              }
              return val;
            } //checkNumber

            fields[ "start" ] = checkNumber( fields[ "start" ] );
            fields[ "end" ] = checkNumber( fields[ "end" ] );
          } //filterKnownFields

          function setupServer( bindingType ) {
            var succeeded = false;

            var binding = bindingType === "window" ? "bindWindow" : "bindFrame";
            commServer[ binding ]( editorLinkName, targetWindow, function() {
              butter.listen( "trackeventupdated", updateEditor );
              butter.listen( "targetadded", targetAdded );
              butter.listen( "trackeventremoved", checkRemoved );
              
              commServer.listen( editorLinkName, "okayclicked", function( e ){
                var newOptions = e.data;
                filterKnownFields( newOptions );
                if ( targetWindow.close ) {
                  targetWindow.close();
                }
                if ( targetWindow && targetWindow.parentNode ) {
                  targetWindow.parentNode.removeChild( targetWindow );
                }
                undoListeners();
                targetWindow = undefined;
                trackEvent.update( newOptions );
                em.dispatch( "trackeditclosed", that );
              });

              commServer.listen( editorLinkName, "applyclicked", function( e ) {
                var newOptions = e.data;
                filterKnownFields( newOptions );
                trackEvent.update( newOptions );
              });

              commServer.listen( editorLinkName, "deleteclicked", function() {
                butter.removeTrackEvent( trackEvent );
                if ( targetWindow.close ) {
                  targetWindow.close();
                }
                if ( targetWindow && targetWindow.parentNode ) {
                  targetWindow.parentNode.removeChild( targetWindow );
                }
                undoListeners();
                targetWindow = undefined;
                em.dispatch( "trackeditclosed", that );
              });

              commServer.listen( editorLinkName, "cancelclicked", function() {
                if ( targetWindow.close ) {
                  targetWindow.close();
                }
                if ( targetWindow && targetWindow.parentNode ) {
                  targetWindow.parentNode.removeChild( targetWindow );
                }
                undoListeners();
                targetWindow = undefined;
                em.dispatch( "trackeditclosed", that );
              });

            });

            commServer.listen( editorLinkName, "ready", editorReady );
            commServer.listen( editorLinkName, "clientdimsupdated", clientDimsUpdated );

            var checkEditorInterval;
            function editorReady() {
              succeeded = true;
              em.dispatch( "trackeditstarted", that );
              commServer.unlisten( editorLinkName, "ready", editorReady );
              clearInterval( checkEditorInterval );
              var targetCollection = butter.targets, targetArray = [];
              for ( var i=0, l=targetCollection.length; i<l; ++i ) {
                targetArray.push( [ targetCollection[ i ].name, targetCollection[ i ].id ] );
              }
              trackEvent.manifest = butter.getManifest( trackEvent.type );
              commServer.send( editorLinkName, {
                "trackEvent": trackEvent, 
                "targets": targetArray,
                "id": trackEvent.id
              }, "edittrackevent");
            }
            checkEditorInterval = setInterval( function() {
              commServer.send( editorLinkName, "ready", "ready" );
            }, 500 );
            setTimeout( function() {
              clearInterval( checkEditorInterval );
              commServer.unlisten( editorLinkName, "ready", editorReady );
              if ( succeeded ) {
                return;
              }
              if ( targetWindow && targetWindow.close ) {
                targetWindow.close();
              }
              if ( targetWindow && targetWindow.parentNode ) {
                targetWindow.parentNode.removeChild( targetWindow );
              }
              undoListeners();
              targetWindow = undefined;
              em.dispatch( "trackeditfailed", that );
            }, 5000 );

          } //setupServer

          if ( target === "window" ) {
            if ( !targetWindow ) {
              targetWindow = window.open( source, "", "width=" + editorWidth + ",height=" + editorHeight + ",menubar=no,toolbar=no,location=no,status=no" );
              setupServer( "window" );
              targetWindow.addEventListener( "beforeunload", function() {
                undoListeners();
                em.dispatch( "trackeditclosed", that );
                targetWindow = undefined;
              }, false );
            }
          }
          else {
            if ( targetContainer ) {
              clearTarget();
            }
            targetWindow = document.createElement( "iframe" );
            targetWindow.id = "butter-editor-iframe";
            targetWindow.style.width = editorWidth;
            targetWindow.style.height = editorHeight;
            setupServer( "iframe" );
            targetWindow.setAttribute( "src", source );
            targetWindow.src = source;
            targetContainer.appendChild( targetWindow );
          } //if


        }; //construct

        this.setDimensions = function( width, height ) {
          if ( !height ) {
            height = width.height;
            width = width.width;
          }
          editorWidth = width || editorWidth;
          editorHeight = height || editorHeight;
        }; //setDimensions

        Object.defineProperty( this, "type", {
          get: function() { return target === "window" ? "window" : "iframe"; }
        });

        Object.defineProperty( this, "size", {
          get: function() { return { width: editorWidth, height: editorHeight }; },
          set: function( val ) {
            val = val || {};
            editorWidth = val.width || editorWidth;
            editorHeight = val.height || editorHeight;
          }
        });

        Object.defineProperty( this, "window", {
          get: function() { return targetWindow; }
        });
        
      } //Editor
      Editor.guid = 0;

      if ( !options || typeof options !== "object" ) {
        throw new Error( "invalid arguments for initializing editor" );
      }

      this.editTrackEvent = function( trackEvent ) {
        if ( !trackEvent || !( trackEvent instanceof TrackEvent ) ) {
          throw new Error( "Can't editor undefined trackEvent" );
        }

        var type = trackEvent.type;
        if ( !editors[ type ] ) {
          type = "default";
        }
        var editor = editors[ type ];
        editor.construct( trackEvent );
        return editor;
      }; //editTrackEvent

      this.addEditor = function( editorSource, pluginType, target ) {
        if ( !pluginType || !editorSource ) {
          throw new Error( "Can't create an editor without a plugin type and editor source" );
        }
        var editor = editors[ pluginType ] = new Editor({
          source: editorSource,
          type: pluginType,
          target: target
        });
        return editor;
      }; //addCustomEditor
            
      this.removeEditor = function( pluginType ) {
        if ( !pluginType ) {
          return;
        }
        var oldSource = editors[ pluginType ];
        editors[ pluginType ] = undefined;
        return oldSource;
      }; //removeEditor

      var defaultEditor = options.defaultEditor || "defaultEditor.html",
          defaultTarget = options.defaultTarget || "window";
      that.addEditor( defaultEditor, "default", defaultTarget );

    }; //EventEditor

    return {
      name: "eventeditor",
      init: function( butter, options ) {
        var ee = new EventEditor( butter, options );
        ee.listen( "clientdimsupdated", butter.eventManager.repeat );
        ee.listen( "trackeventupdated", butter.eventManager.repeat );
        ee.listen( "trackeditstarted", butter.eventManager.repeat );
        ee.listen( "trackeditclosed", butter.eventManager.repeat );
        ee.listen( "trackeditfailed", butter.eventManager.repeat );
        return ee;
      } //init
    };

  }); //define

})();


(function() {

  define('previewer/module',[ "core/logger", "core/eventmanager", "comm/comm" ], function( Logger, EventManager, Comm ) {

    var Previewer = function( butter, options ) {

      var id = "Previewer" + Previewer.guid++,
          logger = new Logger( id ),
          defaultExportBaseUrl = options.exportBaseUrl;

      var popcornUrl = options.popcornUrl || "http://popcornjs.org/code/dist/popcorn-complete.js";

      var target = document.getElementById( options.target );
      if ( !target ) {
        logger.error( "Previewer target, " + options.target + " does not exist");
      }

      var Preview = function( options ) {

        var that = this,
            link,
            previewIframe,
            defaultMedia = options.defaultMedia,
            importData = options.importData,
            onload = options.onload,
            onfail = options.onfail,
            exportBaseUrl = options.exportBaseUrl || defaultExportBaseUrl,
            id = "Preview" + Preview.guid++,
            logger = new Logger( id );

        logger.log( "Starting" );

        function PreviewerLink( options ) {
          var isPlaying = false,
              linkType,
              currentTime,
              server = new Comm.CommServer(),
              that = this;

          function onMediaAdded( e ) {
            logger.log( "Sending mediaadded" );
            var mediaExport = e.data.json;
            server.send( "link", mediaExport, "mediaadded" );
          }
          function onMediaChanged( e ) {
            logger.log( "Sending mediachanged" );
            var mediaExport = e.data.json;
            server.send( "link", mediaExport, "mediachanged" );
          }
          function onMediaRemoved( e ) {
            logger.log( "Sending mediaremoved" );
            var mediaExport = e.data.json;
            server.send( "link", mediaExport, "mediaremoved" );
          }
          function onMediaTimeUpdate( e ) {
            if ( e.data.currentTime !== currentTime ) {
              //logger.log( "Sending mediatimeupdate: " + currentTime + ", " + e.data.currentTime );
              server.send( "link", e.data.currentTime, "mediatimeupdate" );
            } //if
          }
          function onMediaContentChanged( e ) {
            logger.log( "Sending mediacontentchanged" );
            function changeComplete( ev ) {
              server.unlisten( "link", "mediacontentchanged", changeComplete );
              butter.dispatch( "mediacontentchangecomplete", e.data.url );
            }
            server.listen( "link", "mediacontentchanged", changeComplete );
            server.send( "link", e.data.url, "mediacontentchanged" );
          }
          function onTrackEventAdded( e ) {
            logger.log( "Sending trackeventadded" );
            var trackEventExport = e.data.json;
            server.send( "link", trackEventExport, "trackeventadded" );
          }
          function onTrackEventRemoved( e ) {
            logger.log( "Sending trackeventremoved" );
            var trackEventExport = e.data.json;
            server.send( "link", trackEventExport, "trackeventremoved" );
          }
          function onTrackEventUpdated( e ) {
            logger.log( "Sending trackeventupdated" );
            var trackEventExport = e.data.json;
            server.send( "link", trackEventExport, "trackeventupdated" );
          }

          function setup( iframeWindow ) {
            server.bindClientWindow( "link", iframeWindow, function( message ) {
            });

            that.play = function() {
              logger.log( 'Playing' );
              server.send( "link", "play", "play" );
            }; //play

            Object.defineProperty( that, "playing", {
              get: function() {
                return isPlaying;
              }
            });

            that.pause = function() {
              logger.log( 'Pausing' );
              server.send( "link", "pause", "pause" );
            }; //pause

            that.mute = function() {
              logger.log( 'Muting' );
              server.send( "link", "mute", "mute" );
            }; //mute

            server.listen( "link", "error", function( e ) {
              if ( e.data.type === "media-loading" ) {
                butter.dispatch( "previewerfail" );
                onfail && onfail( that );
              } else {
                butter.dispatch( { data: {} }, "error" );
              }
            });

            server.listen( "link", "mediatimeout", function( e ) {
              butter.dispatch( "previewertimeout", {
                preview: that,
                media: butter.getMedia( { id: e.data } )
              });
            });

            server.listen( "link", "loaded", function( e ) {
              var numMedia = butter.media.length, numReady = 0;
              linkType = e.data.type;
              logger.log( 'Loaded; waiting for ' + numMedia + ' media' );
              butter.dispatch( "previewloaded", null );

              server.listen( "link", "build", function( e ) {
                var media = butter.getMedia( { id: e.data.id } );
                if ( media ) {
                  logger.log( 'Media '+ media.id + ' built' );
                  media.registry = e.data.registry;
                  media.duration = e.data.duration;
                  butter.dispatch( "mediaready", media, "previewer" );
                } //if
                ++numReady;
                if ( numMedia === numReady ) {
                  if ( importData ) {
                    butter.importProject( importData );
                  } //if
                  butter.dispatch( "previewready", that );
                  server.send( "link", "cancelmediatimeout", "cancelmediatimeout" );
                  onload && onload( that );
                } //if
              });
            });

            server.listen( "link", "mediapaused", function( e ) {
              logger.log( "Received mediapaused" );
              isPlaying = false;
              butter.dispatch( "mediapaused", butter.getMedia( { id: e.data } ), "previewer" );
            });
            server.listen( "link", "mediaplaying", function( e ) {
              logger.log( "Received mediaplaying" );
              isPlaying = true;
              butter.dispatch( "mediaplaying", butter.getMedia( { id: e.data } ), "previewer" );
            });
            server.listen( "link", "mediatimeupdate", function( e ) {
              currentTime = e.data;
              //logger.log( "Received mediatimeupdate: " + currentTime );
              butter.currentTime = currentTime;
            });

            server.listen( "link", "addmedia", function( e ) {
              logger.log( "Received addmedia request" );
              var media = butter.addMedia( e.data );
            });
            server.listen( "link", "addtarget", function( e ) {
              logger.log( "Received addtarget request" );
              var target = butter.addTarget( e.data );
            });

            butter.listen( "mediaadded", onMediaAdded );
            butter.listen( "mediachanged", onMediaChanged );
            butter.listen( "mediaremoved", onMediaRemoved );
            butter.listen( "mediatimeupdate", onMediaTimeUpdate, "timeline" );
            butter.listen( "mediacontentchanged", onMediaContentChanged );
            butter.listen( "trackeventadded", onTrackEventAdded );
            butter.listen( "trackeventremoved", onTrackEventRemoved );
            butter.listen( "trackeventupdated", onTrackEventUpdated );

            server.listen( "link", "importData", function( e ) {
              if ( !importData && e.data ) {
                logger.log( "Received import data from preview", e.data );
                importData = e.data;
              } //if
            });

            server.listen( "link", "log", function( e ) {
              logger.log( e.data );
            });
          } //setup

          var iframeWindow = previewIframe.contentWindow || previewIframe.contentDocument;
          setup( iframeWindow );

          // Ugly hack to continue bootstrapping until Butter script is *actually* loaded.
          // Impossible to really tell when <script> has loaded (security).
          logger.log( "Bootstrapping" );
          var setupInterval;
          function sendSetup() {
            server.send( "link", {
              defaultMedia: defaultMedia,
              importData: importData,
              exportBaseUrl: exportBaseUrl
            }, "setup" );
          } //sendSetup
          server.listen( "link", "setup", function( e ) {
            clearInterval( setupInterval );
          });
          setupInterval = setInterval( sendSetup, 500 );

          this.fetchHTML = function( callback ) {
            logger.log( "Fetching HTML" );
            var data = butter.exportProject();
            server.async( "link", data, "html", function( e ) {
              logger.log( "Receiving HTML" );
              callback( e.data );
            });
          }; //fetchHTML

          this.destroy = function() {
            server.send( "link", null, "destroy" );
            server.destroy();
            butter.unlisten( "mediaadded", onMediaAdded );
            butter.unlisten( "mediachanged", onMediaChanged );
            butter.unlisten( "mediaremoved", onMediaRemoved );
            butter.unlisten( "mediatimeupdate", onMediaTimeUpdate, "timeline" );
            butter.unlisten( "mediacontentchanged", onMediaContentChanged );
            butter.unlisten( "trackeventadded", onTrackEventAdded );
            butter.unlisten( "trackeventremoved", onTrackEventRemoved );
            butter.unlisten( "trackeventupdated", onTrackEventUpdated );
          }; //destroy

          this.waitForMedia = function( media ) {
            server.send( "link", media.id, "waitformedia" );
          }; //waitForMedia

          Object.defineProperty( this, "type", {
            get: function() { return linkType; }
          });

        } //PreviewerLink

        function loadIframe( iframe, template ) {
          previewIframe = iframe;
          logger.log( "Starting IFRAME: " + iframe.src );
          function onLoad( e ) {
            logger.log( "IFRAME Loaded: " + iframe.src );
            link = new PreviewerLink({
            });
            iframe.removeEventListener( "load", onLoad, false );
          } //onLoad
          iframe.addEventListener( "load", onLoad, false );
        } //loadIfram

        if ( target.tagName === "DIV" ) {
          logger.log( "Found DIV; Creating IFRAME" );
          var rect = target.getClientRects()[ 0 ];
          var iframe = document.createElement( "IFRAME" );
          iframe.width = rect.width;
          iframe.height = rect.height;
          loadIframe( iframe, options.template );
          target.appendChild( iframe );
          iframe.src = options.template;
        }
        else if ( target.tagName === "IFRAME" ) {
          logger.log( "Found IFRAME" );
          loadIframe( target, options.template );
          target.src = options.template;
        } // else

        Object.defineProperty( this, "properties", {
          get: function() {
            return {
              target: link.target,
              template: link.template,
            };
          }
        });

        this.fetchHTML = function( callback ) {
          link.fetchHTML( callback );
        }; //fetchHTML

        Object.defineProperty( this, "playing", {
          get: function() {
            return link.playing;
          },
          set: function( val ) {
            if ( val ) {
              link.play();
            }
            else {
              link.pause();
            }
          }
        }); //playing

        this.play = function() {
          link.play();
        }; //play

        this.pause = function() {
          link.pause();
        }; //pause

        this.mute = function() {
          link.mute();
        }; //mute

        this.destroy = function() {
          link.destroy();
          if ( previewIframe ) {
            previewIframe.setAttribute( "src", "about:blank" );
          }
        }; //destroy

        this.waitForMedia = function( media ) {
          link.waitForMedia( media );
        }; //waitForMedia

        Object.defineProperty( this, "type", {
          get: function() { return link.type; }
        });

      }; //Preview
      Preview.guid = 0;

      this.Preview = Preview;

    }; //Previewer
    Previewer.guid = 0;

    return {
      name: "previewer",
      init: function( butter, options ) {
        return new Previewer( butter, options );
      } //init
    };

  }); //define

})();


/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function() {

  define('trackeditor/module',[ "core/logger", "core/eventmanager" ], function( Logger, EventManager ) {

    var TrackEditor = function( butter, options ) {
      if ( !options ) {
        throw new Error( "invalid arguments" );
      }

      if ( !options.target ) {
        throw new Error( "must supply a target" );
      }
      var target = document.getElementById( options.target ) || options.target,
          that = this;

      var Editor = function( track ) {
        var target = document.getElementById( options.target ) || options.target,
            that = this;
        butter.listen( "trackremoved", function( event ) {
          if ( event.data === track ) {
            that.close();
          }
        }); //ontrackremoved

        track.listen( "tracktargetchanged", function() {
          target = document.getElementById( track.target );
        });

        Object.defineProperty( this, "track", {
          get: function() {
            return track;
          }
        }); //track

        this.close = function() {
        }; //close

        this.remove = function() {
          butter.removeTrack( track );
        }; //remove

        this.clear = function() {
          var trackEvents = track.trackEvents;

          while ( trackEvents.length ) {
            butter.removeTrackEvent( track, trackEvents[ 0 ] );
          } //while
        }; //clear

        Object.defineProperty( this, "json", {
          get: function() {
            return track.json;
          },
          set: function( val ) {
            that.clear();
            track.json = val;

            var trackEvents = JSON.parse( val ).trackEvents;
            for ( var i = 0, l = trackEvents.length; i < l; i++ ) {
              track.addTrackEvent( new Butter.TrackEvent({ popcornOptions: trackEvents[ i ].popcornOptions, type: trackEvents[ i ].type }) )
            }
          }
        }); //json

        Object.defineProperty( this, "target", {
          get: function() {
            return track.target;
          },
          set: function( val ) {
            track.target = val;
            butter.dispatch( "trackupdated", track );
          }
        }); //target

      }; //Editor

      this.Editor = Editor;

      Object.defineProperty( this, "target", {
        get: function() { return target; }
      }); //target

    }; //TrackEditor

    return {
      name: "trackeditor",
      init: function( butter, options ) {
        return new TrackEditor( butter, options );
      } //init
    };

  });
}());


/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function() {

  define('pluginmanager/module',[ "core/logger", "core/eventmanager" ], function( Logger, EventManager ) {

    var PluginManager = function( butter, options ) {

      var plugins = [],
          numPlugins = 0,
          container,
          pluginElementPrefix = "butter-plugin-",
          pattern;
      
      var Plugin = function ( options ) {
        var id = numPlugins++,
            that = this;

        options = options || {};
        var name = options.name || 'Plugin' + Date.now();
        this.type = options.type;
        this.element = undefined;

        Object.defineProperty( this, "id", { get: function() { return id; } } );
        Object.defineProperty( this, "name", { get: function() { return name; } } );
        
        this.createElement = function ( pattern ) {
          var pluginElement;
          if ( !pattern ) {
            pluginElement = document.createElement( "span" );
            pluginElement.innerHTML = that.type + " ";
          }
          else {
            var patternInstance = pattern.replace( /\$type/g, that.type );
            var $pluginElement = $( patternInstance );
            pluginElement = $pluginElement[ 0 ];
          }
          pluginElement.id = pluginElementPrefix + that.type;
          $( pluginElement ).draggable({ helper: "clone", appendTo: "body", zIndex: 9001, revert: true, revertDuration: 0 });
          this.element = pluginElement;
          return pluginElement;
        }; //createElement

      }; //Plugin

      options = options || {};
      container = document.getElementById( options.target ) || options.target;
      pattern = options.pattern;

      this.add = function( plugin ) {

        if ( !( plugin instanceof Plugin ) ) {
          plugin = new Plugin( plugin );
        } //if
        plugins.push( plugin );

        butter.dispatch( "pluginadded", plugin );

        container.appendChild( plugin.createElement( pattern ) );
        
        return plugin;
      }; //add

      Object.defineProperty( this, "plugins", {
        get: function() {
          return plugins;
        }
      }); //plugins

      this.clear = function () {
        while ( plugins.length > 0 ) {
          var plugin = plugins.pop();
          container.removeChild( plugin.element );
          butter.dispatch( "pluginremoved", plugin );
        }
      }; //clear

      this.get = function( name ) {
        for ( var i=0, l=plugins.length; i<l; ++i ) {
          if ( plugins[ i ].name === name ) {
            return plugins[ i ];
          } //if
        } //for
      }; //get

      Object.defineProperty( this, "pluginElementPrefix", {
        get: function() {
          return pluginElementPrefix;
        }
      });

    }; //PluginManager

    return {
      name: "pluginmanager",
      init: function( butter, options ) {
        return new PluginManager( butter, options );
      } //init
    };

  }); //define

})();


(function(window) {
  //<script src="http://code.jquery.com/jquery-1.5.js"></script>
  //<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.js"></script>

  var Logger = function( name ) {

    this.log = function( message ) {
      console.log( "[" + name + "] " + message );
    }; //log

    this.error = function( message ) {
      throw new Error( "[" + name + "]" + message ); 
    }; //error

  }; //Logger

  var EventManager = function( emOptions ) {

    var listeners = {},
        related = {},
        id = "EventManager" + EventManager.guid++,
        logger = emOptions.logger || new Logger( id ),
        targetName = id,
        that = this;
    
    this.listen = function( type, listener, relatedObject ) {
      if ( type && listener ) {
        if ( !listeners[ type ] ) {
          listeners[ type ] = [];
        } //if
        listeners[ type ].push( listener );
        if ( relatedObject ) {
          if ( !related[ relatedObject ] ) {
            related[ relatedObject ] = [];
          } //if
          related[ relatedObject ].push( listener );
        } //if
      }
      else {
        logger.error( "type and listener required to listen for event." );
      } //if
    }; //listen

    this.unlisten = function( type, listener ) {
      if ( type && listener ) {
        var theseListeners = listeners[ type ];
        if ( theseListeners ) {
          var idx = theseListeners.indexOf( listener );
          if ( idx > -1 ) {
            theseListeners.splice( idx, 1 );
          } //if
        } //if
      }
      else if ( type ) {
        if ( listeners[ type ] ) {
          listeners[ type ] = [];
        } //if
      }
      else {
        logger.error( "type and listener required to unlisten for event" );
      } //if
    }; //unlisten

    this.unlistenByType = function( type, relatedObject ) {
      var relatedListeners = related[ relatedObject ];
      for ( var i=0, l=relatedListeners; i<l; ++i ) {
        that.unlisten( type, relatedListeners[ i ] );
      } //for
      delete related[ relatedObject ];
    }; //unlistenByType

    this.dispatch = function( type, data, tempTarget ) {
      if ( type ) {
        var theseListeners = listeners[ type ];
        if ( theseListeners ) {
          var e = {
            target: tempTarget || targetName,
            type: type,
            data: data
          };
          for ( var i=0, l=theseListeners.length; i<l; ++i ) {
            theseListeners[ i ]( e );
          } //for
        } //if
      }
      else {
        logger.error( "type required to dispatch event" );
      } //if
    }; //dispatch

    this.apply = function( name, to ) {
      to.listen = that.listen;
      to.unlisten = that.unlisten;
      to.dispatch = that.dispatch;
      targetName = name;
    }; //apply

    this.repeat = function( e ) {
      that.dispatch( e.type, e.data, e.target );
    }; //repeat

  }; //EventManager
  EventManager.guid = 0;

  var TrackLiner = this.TrackLiner = function( options ) {

    if ( this !== window ) {

      options = options || {};

      var tracks = {},
          trackCount = 0,
          eventCount = 0,
          userElement,
          dynamicTrackCreation = options.dynamicTrackCreation,
          duration = options.duration || 1,
          scale = options.scale || 1,
          parent = document.createElement( "div" ),
          container = document.createElement( "div" ),
          self = this;

      var eventManager = new EventManager({});
      eventManager.apply( "trackLiner", this );

      if ( typeof( options ) === "string" ) {

        userElement = document.getElementById( options );
      }
      else {

        userElement = document.getElementById( options.element ) || options.element;
      } //if

      userElement.appendChild( parent );
      parent.style.height = "100%";
      parent.appendChild( container );

      $( container ).sortable({
        containment: "parent",
        tolerance: "pointer",
        update: function( event, ui ) {

          eventManager.dispatch( "trackupdated", {
            track: self.getTrack( ui.item[ 0 ].id ),
            index: ui.item.index()
          });
        }
      }).droppable({
        greedy: true
      });

      var trackEventDropped = function ( track, e, ui ) {

        var eventId = ui.draggable[ 0 ].id,
            trackId = track.id,
            parentId = ui.draggable[ 0 ].parentNode.id;

        if ( self.getTrack( parentId ) ) {

          track.addTrackEvent( self.getTrack( parentId ).removeTrackEvent( eventId ) );
        } else {

          var clientRects = parent.getClientRects();

          track.addTrackEvent( track.createTrackEvent({
              left: ( e.clientX - clientRects[ 0 ].left ) / scale,
              width: 50,
              innerHTML: ui.draggable[ 0 ].innerHTML
            }, true ));
        } //if
      };

      $( parent ).droppable({
        // this is dropping an event on empty space
        drop: function( event, ui ) {
  
          if ( dynamicTrackCreation && ui.draggable[ 0 ].className.indexOf( "ui-draggable" ) > -1 ) {

            var newTrack = self.createTrack();
            self.addTrack( newTrack );

            trackEventDropped( newTrack, event, ui );
          } //if
        }
      });

      this.clear = function () {

        while ( container.children.length ) {

          container.removeChild( container.children[ 0 ] );
        } //while

        tracks = [];
        trackCount = 0;
        eventCount = 0;
      };

      this.createTrack = function( name ) {

        var track = new Track(),
            element = track.getElement();

        if ( name ) {

          var titleElement = document.createElement( "span" );

          titleElement.style.postion = "absolute";
          titleElement.style.left = "5px";
          titleElement.style.top = "50%";
          titleElement.innerHTML = name;
          titleElement.className = "track-title";
          
          element.appendChild( titleElement );
        } //if

        return tracks[ track.getElement().id ] = track;
      };

      this.getTracks = function () {

        return tracks;
      };

      this.getTrack = function( id ) {

        return tracks[ id ];
      };

      this.addTrack = function( track ) {

        container.appendChild( track.getElement() );
        tracks[ track.getElement().id ] = track;
        eventManager.dispatch( "trackadded", {
          track: track
        });
      };

      this.removeTrack = function( track ) {

        container.removeChild( track.getElement() );
        delete tracks[ track.getElement().id ];
        eventManager.dispatch( "trackremoved", {
          track: track
        });
        return track;
      };

      this.deselectOthers = function() {

        for ( var j in tracks ) {

          var events = tracks[ j ].getTrackEvents();

          for ( var i in events ) {

            if ( events[ i ].selected ) {

              events[ i ].deselect();
            } //if
          } //for
        } //for

        return self;
      };

      this.setScale = function ( scale ) {

        userElement.style.width = userElement.style.width || duration * scale + "px";
        userElement.style.minWidth = duration * scale + "px";
      };

      this.setScale( scale );

      var Track = function( inc ) {

        var trackId = "trackLiner" + trackCount++,
            events = {},
            that = this,
            element = document.createElement( "div" );

        element.className = "trackliner-track";
        this.id = element.id = trackId;

        $( element ).droppable({ 
          greedy: true,
          // this is dropping an event on a track
          drop: function( event, ui ) {

            trackEventDropped( that, event, ui );
          }
        });

        this.getElement = function() {

          return element;
        };

        this.createEventElement = function ( options ) {

          var element = document.createElement( "div" );

          // set options if they exist
          options.cursor && (element.style.cursor = options.cursor);
          options.background && (element.style.background = options.background);
          options.opacity && (element.style.opacity = options.opacity);
          options.height && (element.style.height = options.height);
          options.width && (element.style.width = options.width*scale + "px");
          options.position && (element.style.position = options.position);
          options.top && (element.style.top = options.top);
          options.left && (element.style.left = options.left*scale + "px");
          options.innerHTML && (element.innerHTML = options.innerHTML);
          element.style.position = options.position ? options.position : "absolute";

          // add css options if they exist
          if ( options.css ) {

            $( element ).css( options.css );
          } //if

          element.className = "trackliner-event";

          if ( options.classes ) {

            for ( var i = 0; i < options.classes.length; ++i ) {

              $( element ).addClass( options.classes[ i ] );
            } //for
          } //if

          return element;
        } //createEventElement

        this.createTrackEvent = function( inputOptions, ui ) {

          var trackEvent = {},
              eventId = "trackEvent" + eventCount++;

          if ( inputOptions ) {

            var movedCallback = function( event, ui ) {

              var eventElement = trackEvent.element,
                  track = self.getTrack( this.parentNode.id );

              eventElement.style.top = "0px";

              trackEvent.options.left = eventElement.offsetLeft;
              trackEvent.options.width = eventElement.offsetWidth;

              eventManager.dispatch( "trackeventupdated", {
                track: track,
                trackEvent: trackEvent,
                ui: true
              });
            };

            trackEvent.options = inputOptions;

            trackEvent.element = inputOptions.element || this.createEventElement ( inputOptions );
            trackEvent.element.id = eventId;
            trackEvent.element.addEventListener( "click", function ( e ) {

              eventManager.dispatch( "trackeventclicked", {
                track: self.getTrack( this.parentNode.id ),
                trackEvent: trackEvent,
                event: e
              });
            }, false);

            trackEvent.element.addEventListener( "dblclick", function ( e ) {

              eventManager.dispatch( "trackeventdoubleclicked", {
                track: self.getTrack( this.parentNode.id ),
                trackEvent: trackEvent,
                event: e
              });
            }, false);

            trackEvent.selected = false;
            trackEvent.select = function ( e ) {

              self.deselectOthers();
              trackEvent.selected = true;
              eventManager.dispatch( "trackeventselecteded", {
                track: that,
                trackEvent: trackEvent
              });
            };

            trackEvent.deselect = function ( e ) {

              trackEvent.selected = false;
              eventManager.dispatch( "trackeventdeselecteded", {
                track: that,
                trackEvent: trackEvent
              });
            };

            $( trackEvent.element ).draggable({
              containment: parent,
              zIndex: 9001,
              scroll: true,
              // this is when an event stops being dragged
              start: function ( event, ui ) {},
              stop: movedCallback
            }).resizable({ 
              autoHide: true, 
              containment: "parent", 
              handles: "e, w", 
              scroll: false,
              stop: movedCallback
            });

            return this.addTrackEvent( trackEvent, ui );
          } //if
        };

        this.addTrackEvent = function( trackEvent, ui ) {

          events[ trackEvent.element.id ] = trackEvent;
          element.appendChild( trackEvent.element );
          trackEvent.trackId = trackId;
          ui = ui || false;

          eventManager.dispatch( "trackeventadded", {
            track: that,
            trackEvent: trackEvent,
            ui: ui
          });

          return trackEvent;
        };

        this.updateTrackEvent = function( trackEvent ) {

          var eventElement = trackEvent.element,
              track = self.getTrack( trackEvent.trackId );

          eventElement.style.top = "0px";
          eventElement.style.width = trackEvent.options.width + "px";
          eventElement.style.left = trackEvent.options.left + "px";

          eventManager.dispatch( "trackeventupdated", {
            track: track,
            trackEvent: trackEvent,
            ui: false
          });

          return trackEvent;
        };

        this.getTrackEvent = function( id ) {

          return events[ id ];
        };

        this.getTrackEvents = function () {

          return events;
        };

        this.removeTrackEvent = function( id ) {

          var trackEvent = events[ id ];

          delete events[ id ];
          element.removeChild( trackEvent.element );
          eventManager.dispatch( "trackeventremoved", trackEvent );

          return trackEvent;
        };

        this.toString = function() {

          return trackId;
        };
      };

      return this;
    } //if (this !== window)
  }; //TrackLiner
}(window));



define("trackLiner/trackLiner", function(){});

/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function() {

  define('timeline/module',[ "core/logger", "core/eventmanager", "core/trackevent", "comm/comm", "trackLiner/trackLiner" ], function( Logger, EventManager, TrackEvent, Comm ) {

    var Timeline = function( butter, options ) {

      var mediaInstances = {},
          currentMediaInstance,
          target = document.getElementById( options.target ) || options.target;

      this.findAbsolutePosition = function ( obj ) {

        var curleft = curtop = 0;

        if ( obj.offsetParent ) {

          do {

            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
          } while ( obj = obj.offsetParent );
        }

        //returns an array
        return [ curleft, curtop ];
      };

      this.moveFrameLeft = function( event ) {

        if ( butter.targettedEvent ) {

          event.preventDefault();

          var cornOptions = butter.targettedEvent.popcornOptions,
              inc = event.shiftKey ? 2.5 : 0.25;

          if ( cornOptions.start > inc ) {

            cornOptions.start -= inc;

            if ( !event.ctrlKey && !event.metaKey ) {

              cornOptions.end -= inc;
            }
          } else {

            if ( !event.ctrlKey ) {

              cornOptions.end = cornOptions.end - cornOptions.start;
            }

            cornOptions.start = 0;
          }

          butter.targettedEvent.update( cornOptions );
        }
      };

      this.moveFrameRight = function( event ) {

        if ( butter.targettedEvent ) {

          event.preventDefault();

          var cornOptions = butter.targettedEvent.popcornOptions,
              inc = event.shiftKey ? 2.5 : 0.25;

          if ( cornOptions.end < butter.duration - inc ) {

            cornOptions.end += inc;

            if ( !event.ctrlKey && !event.metaKey ) {

              cornOptions.start += inc;
            }
          } else {

            if ( !event.ctrlKey ) {

              cornOptions.start += butter.duration - cornOptions.end;
            }

            cornOptions.end = butter.duration;
          }

          butter.targettedEvent.update( cornOptions );
        }
      };

      // Convert an SMPTE timestamp to seconds
      this.smpteToSeconds = function( smpte ) {

        var t = smpte.split( ":" );

        if ( t.length === 1 ) {

          return parseFloat( t[ 0 ], 10 );
        }

        if ( t.length === 2 ) {

          return parseFloat( t[ 0 ], 10 ) + parseFloat( t[ 1 ] / 12, 10 );
        }

        if ( t.length === 3 ) {

          return parseInt( t[ 0 ] * 60, 10 ) + parseFloat( t[ 1 ], 10 ) + parseFloat( t[ 2 ] / 12, 10 );
        }

        if ( t.length === 4 ) {

          return parseInt( t[ 0 ] * 3600, 10 ) + parseInt( t[ 1 ] * 60, 10 ) + parseFloat( t[ 2 ], 10 ) + parseFloat( t[ 3 ] / 12, 10 );
        }
      }; //smpteToSeconds

      this.secondsToSMPTE = function( time ) {

        var timeStamp = new Date( 1970,0,1 ),
            seconds;

        timeStamp.setSeconds( time );

        seconds = timeStamp.toTimeString().substr( 0, 8 );

        if ( seconds > 86399 )  {

          seconds = Math.floor( (timeStamp - Date.parse("1/1/70") ) / 3600000) + seconds.substr(2);

        }
        return seconds;
      }; //secondsToSMPTE
      
      var createContainer = function() {

        var container = document.createElement( "div" );

        container.style.width = "100%";
        container.style.height = "100%";
        container.style.position = "relative";
        container.style.MozUserSelect = "none";
        container.style.webkitUserSelect = "none";
        container.style.oUserSelect = "none";
        container.style.userSelect = "none";
        container.id = "timeline-container";

        return container;
      };

      var MediaInstance = function( media ) {

        // capturing self to be used inside element event listeners
        var self = this;
        
        this.initialized = false;
        
        target.appendChild( this.container = createContainer() );

        this.tracks = document.createElement( "div" );
        this.tracks.style.width = "100%";
        this.tracks.style.height = "100%";
        this.tracks.id = "tracks-container";

        this.init = function() {
        
          this.initialized = true;
          this.duration = media.duration;

          this.trackLine = new TrackLiner({
            element: this.tracks,
            dynamicTrackCreation: true,
            scale: 1,
            duration: this.duration
          });

          this.trackLine.listen( "trackupdated", function( event ) {

            var track = event.data.track,
                index = event.data.index;

            currentMediaInstance.butterTracks[ track.id ].newPos = index;
            butter.dispatch( "trackmoved", currentMediaInstance.butterTracks[ track.id ] );
          });

          this.trackLine.listen( "trackadded", function( event ) {

            var trackLinerTrack = event.data.track,
                butterTrack = currentMediaInstance.butterTracks[ trackLinerTrack.id ];

            // track is being created by trackLiner
            if ( !butterTrack ) {

              butterTrack = new Butter.Track();

              // make a function for this
              currentMediaInstance.trackLinerTracks[ butterTrack.id ] = trackLinerTrack;
              currentMediaInstance.butterTracks[ trackLinerTrack.id ] = butterTrack;

              butter.addTrack( butterTrack );
            }
          });

          this.trackLine.listen( "trackremoved", function( event ) {

            butter.removeTrack( event.data.track, "timeline" );
          });

          this.trackLine.listen( "trackeventupdated", function( e ) {

            if ( e.data.ui ) {
              var trackLinerTrack = e.data.track,
                  butterTrack = currentMediaInstance.butterTracks[ trackLinerTrack.id ],
                  trackLinerTrackEvent = e.data.trackEvent,
                  butterTrackEvent = currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ];

              var cornOptions = butterTrackEvent.popcornOptions;
              cornOptions.start = Math.max( 0, trackLinerTrackEvent.options.left / currentMediaInstance.container.offsetWidth * currentMediaInstance.duration );
              cornOptions.end = Math.max( 0, ( trackLinerTrackEvent.options.left + trackLinerTrackEvent.options.width ) / currentMediaInstance.container.offsetWidth * currentMediaInstance.duration );

              if ( trackLinerTrack.id !== currentMediaInstance.trackLinerTracks[ butterTrackEvent.track.id ].id ) {

                currentMediaInstance.trackLinerTrackEvents[ butterTrackEvent.id ] = trackLinerTrackEvent;
                currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ] = butterTrackEvent;

                butterTrackEvent.track.removeTrackEvent( butterTrackEvent );
                butterTrack.addTrackEvent( butterTrackEvent );
              }
              
              butterTrackEvent.update( cornOptions );
            } //if
          });

          this.trackLine.listen( "trackeventadded", function( e ) {

            if ( e.data.ui ) {

              var trackLinerTrack = e.data.track,
                  butterTrack = currentMediaInstance.butterTracks[ trackLinerTrack.id ],
                  trackLinerTrackEvent = e.data.trackEvent,
                  butterTrackEvent = currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ],
                  name = e.data.name;

              if ( !butterTrackEvent ) {

                var start = trackLinerTrackEvent.options.left / currentMediaInstance.container.offsetWidth * currentMediaInstance.duration,
                    end = start + ( trackLinerTrackEvent.options.width / currentMediaInstance.container.offsetWidth * currentMediaInstance.duration ),
                    type = e.data.trackEvent.element.children[ 0 ].title || e.data.trackEvent.options.innerHTML;

                butterTrackEvent = new Butter.TrackEvent({
                  popcornOptions: {
                    start: start,
                    end: end },
                  type: type
                });

                // make a function for this
                currentMediaInstance.trackLinerTrackEvents[ butterTrackEvent.id ] = trackLinerTrackEvent;
                currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ] = butterTrackEvent;

                butter.addTrackEvent( butterTrack, butterTrackEvent );
              }
            }
          });

          this.trackLine.listen( "trackeventclicked", function( e ) {

            var track = e.data.track,
                trackLinerTrackEvent = e.data.trackEvent,
                butterTrackEvent = currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ];

            butter.targettedEvent = butterTrackEvent;
          });

          this.trackLine.listen( "trackeventdoubleclicked", function( e ) {

            var trackLinerTrack = e.data.track,
                butterTrack = currentMediaInstance.butterTracks[ trackLinerTrack.id ],
                trackLinerTrackEvent = e.data.trackEvent,
                butterTrackEvent = currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ];

            if ( butter.eventeditor ) {

              butter.eventeditor.editTrackEvent( butterTrackEvent );
            }
          });

          this.butterTracks = {};
          this.trackLinerTracks = {};
          this.butterTrackEvents = {};
          this.trackLinerTrackEvents = {};
          this.container.appendChild( this.tracks );
        };

        this.destroy = function() {

          target.removeChild( this.container );
        };

        this.hide = function() {

          this.container.style.display = "none";
        };

        this.show = function() {

          this.container.style.display = "block";
        };
        
        this.media = media;
      };
      
      var addTrack = function( track ) {

        if( !currentMediaInstance.trackLine ) {

          return;
        }
      };

      butter.listen( "trackadded", function( event ) {
      
        if ( !currentMediaInstance ) {

          return;
        }

        var butterTrack = event.data,
            trackLinerTrack = currentMediaInstance.trackLinerTracks[ butterTrack.id ];

        // track is being created by butter
        if ( !trackLinerTrack ) {

          trackLinerTrack = currentMediaInstance.trackLine.createTrack();

          // make a function for this
          currentMediaInstance.trackLinerTracks[ butterTrack.id ] = trackLinerTrack;
          currentMediaInstance.butterTracks[ trackLinerTrack.id ] = butterTrack;

          currentMediaInstance.trackLine.addTrack( trackLinerTrack );
        }
      });

      butter.listen( "trackremoved", function( event ) {

        if ( event.target !== "timeline" ) {

          var track = event.data,
              trackLinerTrack = currentMediaInstance.trackLinerTracks[ track.id ],
              trackEvents = trackLinerTrack.trackEvents,
              trackEvent;

          currentMediaInstance.trackLine.removeTrack( trackLinerTrack );

          delete currentMediaInstance.butterTracks[ trackLinerTrack.id ];
          delete currentMediaInstance.trackLinerTracks[ track.id ];
        }
      });

      var addTrackEvent = function( trackEvent ) {

        if( !currentMediaInstance.trackLinerTracks ) {

          return;
        }

        var trackLinerTrackEvent = currentMediaInstance.trackLinerTracks[ trackEvent.track.id ].createTrackEvent( trackEvent );

        currentMediaInstance.trackLinerTrackEvents[ trackEvent.id ] = trackLinerTrackEvent;
        currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ] = trackEvent;
      };

      butter.listen( "trackeventadded", function( e ) {
      
        if ( !currentMediaInstance ) {

          return;
        }

        var butterTrack = e.data.track,
            trackLinerTrack = currentMediaInstance.trackLinerTracks[ butterTrack.id ],
            butterTrackEvent = e.data,
            trackLinerTrackEvent = currentMediaInstance.trackLinerTrackEvents[ butterTrackEvent.id ];

        if ( !trackLinerTrackEvent ) {

          var corn = butterTrackEvent.popcornOptions,
              start = corn.start,
              end = corn.end,
              width = Math.max( 3, ( end - start ) / currentMediaInstance.duration * trackLinerTrack.getElement().offsetWidth ),
              left = start / currentMediaInstance.duration * trackLinerTrack.getElement().offsetWidth;

          trackLinerTrackEvent = trackLinerTrack.createTrackEvent({
            width: width,
            left: left,
            innerHTML: butterTrackEvent.type
          });

          currentMediaInstance.trackLinerTrackEvents[ butterTrackEvent.id ] = trackLinerTrackEvent;
          currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ] = butterTrackEvent;

          trackLinerTrack.addTrackEvent( trackLinerTrackEvent );
        }

        butter.targettedEvent = butterTrackEvent;
      });

      butter.listen( "trackeventremoved", function( event ) {

        var trackEvent = event.data,
            trackLinerTrackEvent = currentMediaInstance.trackLinerTrackEvents[ trackEvent.id ],
            trackLinerTrack = currentMediaInstance.trackLine.getTrack( trackLinerTrackEvent.trackId );

        trackLinerTrack && trackLinerTrack.removeTrackEvent( trackLinerTrackEvent.element.id );

        delete currentMediaInstance.butterTrackEvents[ trackLinerTrackEvent.element.id ];
        delete currentMediaInstance.trackLinerTrackEvents[ trackEvent.id ];
      });

      butter.listen( "mediaadded", function( event ) {
        
        mediaInstances[ event.data.id ] = new MediaInstance( event.data );

        function mediaChanged( event ) {

          if ( currentMediaInstance !== mediaInstances[ event.data.id ] ) {

            currentMediaInstance && currentMediaInstance.hide();
            currentMediaInstance = mediaInstances[ event.data.id ];
            currentMediaInstance && currentMediaInstance.show();
            butter.dispatch( "timelineready", {}, "timeline" );
          }
        }

        function mediaReady ( event ) {

          var mi = mediaInstances[ event.data.id ];

          if ( !mi.initialized ) {

            mi.init();
            
            var media = event.data,
                tracks = media.tracks;
            
            for ( var i = 0, tlength = tracks.length; i < tlength; i++ ) {

              var t = tracks[ i ],
                  trackEvents = t.trackEvents;
              
              addTrack( t );
              
              for ( var j = 0, teLength = trackEvents.length; j < teLength; j++ ) {

                addTrackEvent( trackEvents [ j ] );
              } // add Track Events per Track
            } //add Tracks

            butter.dispatch( "timelineready", {}, "timeline" );
          }
        };

        function mediaRemoved( event ) {
        
          if ( mediaInstances[ event.data.id ] ) {

            mediaInstances[ event.data.id ].destroy();
          }

          delete mediaInstances[ event.data.id ];

          if ( currentMediaInstance && ( event.data.id === currentMediaInstance.media.id ) ) {

            currentMediaInstance = undefined;
          }

          butter.unlisten( "mediachanged", mediaChanged );
          butter.unlisten( "mediaremoved", mediaRemoved );
          butter.unlisten( "mediaready", mediaReady );
        }

        butter.listen( "mediachanged", mediaChanged );
        butter.listen( "mediaremoved", mediaRemoved );
        butter.listen( "mediaready", mediaReady );
      });


      butter.listen( "trackeventupdated", function( e ) {

        // accounting for new events changed from butter
        var butterTrackEvent = e.data
            trackLinerTrackEvent = currentMediaInstance.trackLinerTrackEvents[ butterTrackEvent.id ],
            corn = butterTrackEvent.popcornOptions,
            start = corn.start,
            end = corn.end;

        trackLinerTrackEvent.options.left = start / currentMediaInstance.duration * target.offsetWidth;
        trackLinerTrackEvent.options.width = Math.max( 3, ( end - start ) / currentMediaInstance.duration * target.offsetWidth );

        currentMediaInstance.trackLine.getTrack( trackLinerTrackEvent.trackId ).updateTrackEvent( trackLinerTrackEvent );
      });

      this.currentTimeInPixels = function( pixel ) {

        if ( pixel != null) {

          butter.currentTime = pixel / currentMediaInstance.container.offsetWidth * currentMediaInstance.duration;
          butter.dispatch( "mediatimeupdate", currentMediaInstance.media, "timeline" );
        } //if

        return butter.currentTime / currentMediaInstance.duration * ( currentMediaInstance.container.offsetWidth );
      };

      var trackLinerEvent,
          butterTrackEvent,
          start,
          end,
          corn,
          originalWidth = target.offsetWidth,
          currentZoom = 1;

      this.zoom = function( detail ) {

        if ( originalWidth === 0 ) {

          //in case target is invisible or something first
          originalWidth = target.offsetWidth;
        }

        if ( detail < 0 && currentZoom < 6 ) {

          currentZoom++;
        } else if ( detail > 0 && currentZoom > 1 ) {

          currentZoom--;
        }

        target.style.width = originalWidth * currentZoom + "px";

        for ( var i in currentMediaInstance.trackLinerTrackEvents ) {

          trackLinerEvent = currentMediaInstance.trackLinerTrackEvents[ i ];
          butterTrackEvent = currentMediaInstance.butterTrackEvents[ trackLinerEvent.element.id ];
          corn = butterTrackEvent.popcornOptions,
          start = corn.start;
          end = corn.end;

          trackLinerEvent.element.style.width = Math.max( 3, ( end - start ) / currentMediaInstance.duration * target.offsetWidth ) + "px";
          trackLinerEvent.element.style.left = start / currentMediaInstance.duration * target.offsetWidth + "px";
        }

        return currentZoom;
      };
    }; //Timeline

    return {
      name: "timeline",
      init: function( butter, options ) {

        return new Timeline( butter, options );
      }
    };
  }); //define
})();


/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function () {

  define('butter-main',[ "require",
            "core/logger",
            "core/eventmanager",
            "core/track",
            "core/trackevent",
            "core/target",
            "core/media",
            "comm/comm",
            "eventeditor/module",
            "previewer/module",
            "trackeditor/module",
            "pluginmanager/module",
            "timeline/module" ],
          function( require, Logger, EventManager, Track, TrackEvent, Target, Media ) {

    var Butter = function ( options ) {

      options = options || {};

      var events = {},
          medias = [],
          currentMedia,
          targets = [],
          moduleRoot = options.moduleRoot || "/",
          id = "Butter" + Butter.guid++,
          logger = new Logger( id ),
          em = new EventManager( { logger: logger } ),
          that = this;

      if ( moduleRoot && moduleRoot[ moduleRoot.length - 1 ] !== "/" ) {
        moduleRoot += "/";
      }

      em.apply( "Butter", this );

      Object.defineProperty( this, "id", { get: function() { return id; } } );
      Object.defineProperty( this, "eventManager", { get: function() { return em; } } );

      function checkMedia() {
        if ( !currentMedia ) {
          throw new Error("No media object is selected");
        } //if
      }

      this.getManifest = function ( name ) {
        checkMedia();
        return currentMedia.getManifest( name );
      }; //getManifest

      /****************************************************************
       * TrackEvent methods
       ****************************************************************/
      //addTrackEvent - Creates a new Track Event
      this.addTrackEvent = function ( track, trackEvent ) {
        checkMedia();
        if ( typeof(track) === "string" ) {
          track = currentMedia.getTrack( track );
        } //if
        if ( track ) {
          if ( !(trackEvent instanceof TrackEvent) ) {
            trackEvent = new TrackEvent( trackEvent );
          } //if
          track.addTrackEvent( trackEvent );
          return trackEvent;
        }
        else {
          throw new Error("No valid track specified");
        } //if
      }; //addTrackEvents

      Object.defineProperty( this, "trackEvents", {
        get: function() {
          checkMedia();
          var tracks = currentMedia.tracks, trackEvents = {};
          for ( var i=0, l=tracks.length; i<l; ++i ) {
            var track = tracks[i];
            trackEvents[ track.name ] = track.trackEvents;
          } //for
          return trackEvents;
        }
      });

      //flattenTrackEvents - Get a list of Track Events
      this.flattenTrackEvents = function ( flatten ) {
        checkMedia();
        var tracks = currentMedia.tracks, trackEvents = [];
        for ( var i=0, l=tracks.length; i<l; ++i ) {
          var track = tracks[i];
          trackEvents = trackEvents.concat( track.trackEvents );
        } //for
        return trackEvents;
      }; //flattenTrackEvents

      this.getTrackEvent = function ( track, trackEvent ) {
        checkMedia();
        if ( track && trackEvent ) {
          if ( typeof(track) === "string" ) {
            track = that.getTrack( track );
          } //if
          return track.getTrackEvent( trackEvent );
        }
        else {
          var events = that.trackEvents;
          for ( var trackName in events ) {
            var t = events[ trackName ];
            for ( var i=0, l=t.length; i<l; ++i ) {
              if ( t[ i ].name === track ) {
                return t[ i ];
              }
            }
          } //for
        } //if
      }; //getTrackEvent

      //removeTrackEvent - Remove a Track Event
      this.removeTrackEvent = function ( track, trackEvent ) {

        checkMedia();

        // one param given
        if ( !trackEvent ) {
          if ( track instanceof TrackEvent ) {
            trackEvent = track;
            track = trackEvent.track;
          }
          else if ( typeof(track) === "string" ) {
            trackEvent = that.getTrackEvent( track );
            track = trackEvent.track;
          }
          else {
            throw new Error("Invalid parameters for removeTrackEvent");
          }
        } //if

        if ( typeof( track ) === "string") {
          track = that.getTrack( track );
        }

        if ( typeof( trackEvent ) === "string" ) {
          trackEvent = track.getTrackEvent( trackEvent );
        }

        track.removeTrackEvent( trackEvent );
        return trackEvent;
      };

      /****************************************************************
       * Track methods
       ****************************************************************/
      //addTrack - Creates a new Track
      this.addTrack = function ( track ) {
        checkMedia();
        return currentMedia.addTrack( track );
      }; //addTrack

      //tracks - Get a list of Tracks
      Object.defineProperty( this, "tracks", {
        get: function() {
          return currentMedia.tracks;
        }
      });

      //getTrack - Get a Track by its id
      this.getTrack = function ( name ) {
        checkMedia();
        return currentMedia.getTrack( name );
      }; //getTrack

      //removeTrack - Remove a Track
      this.removeTrack = function ( track ) {
        checkMedia();
        return currentMedia.removeTrack( track );
      };

      /****************************************************************
       * Target methods
       ****************************************************************/
      //addTarget - add a target object
      this.addTarget = function ( target ) {
        if ( !(target instanceof Target ) ) {
          target = new Target( target );
        } //if

        targets.push( target );

        logger.log( "Target added: " + target.name );
        em.dispatch( "targetadded", target );

        return target;
      }; //addTarget

      //removeTarget - remove a target object
      this.removeTarget = function ( target ) {
        if ( typeof(target) === "string" ) {
          target = that.getTarget( target );
        } //if
        var idx = targets.indexOf( target );
        if ( idx > -1 ) {
          targets.splice( idx, 1 );
          delete targets[ target.name ];
          em.dispatch( "targetremoved", target );
          return target;
        } //if
        return undefined;
      }; //removeTarget

      Object.defineProperty( this, "targets", {
        get: function() {
          return targets;
        }
      });

      //serializeTargets - get a list of targets objects
      this.serializeTargets = function () {
        var sTargets = [];
        for ( var i=0, l=targets.length; i<l; ++i ) {
          sTargets.push( targets[ i ].json );
        }
        return sTargets;
      }; //serializeTargets

      //getTarget - get a target object by its id
      this.getTarget = function ( target ) {
        for ( var i=0; i<targets.length; ++i ) {
          if (  ( target.id !== undefined && targets[ i ].id === target.id ) ||
                ( target.name && targets[ i ].name === target.name ) ||
                targets[ i ].name === target ) {
            return targets[ i ];
          }
        }
        return undefined;
      }; //getTaget

      /****************************************************************
       * Project methods
       ****************************************************************/
      //importProject - Import project data
      this.importProject = function ( projectData ) {
        if ( projectData.targets ) {
          for ( var i=0, l=projectData.targets.length; i<l; ++i ) {

            var t, targets = that.targets, targetData = projectData.targets[ i ];
            for ( var k=0, j=targets.length; k<j; ++k ) {
              if ( targets[ k ].name === targetData.name ) {
                t = targets[ k ];
                break;
              }
            }

            if ( !t ) {
              t = new Target();
              t.json = projectData.targets[ i ];
              that.addTarget( t );
            }
            else {
              t.json = projectData.targets[ i ];
            }
          }
        }
        if ( projectData.media ) {
          for ( var i=0, l=projectData.media.length; i<l; ++i ) {

            var mediaData = projectData.media[ i ],
                m = that.getMedia( { target: mediaData.target } );

            if ( !m ) {
              m = new Media();
              m.json = projectData.media[ i ];
              that.addMedia( m );
            }
            else {
              m.json = projectData.media[ i ];
            }

          } //for
        } //if projectData.media
      }; //importProject

      //exportProject - Export project data
      this.exportProject = function () {
        var exportJSONMedia = [];
        for ( var m=0, lm=medias.length; m<lm; ++m ) {
          exportJSONMedia.push( medias[ m ].json );
        }
        var projectData = {
          targets: that.serializeTargets(),
          media: exportJSONMedia
        };
        return projectData;
      };

      this.clearProject = function() {
        while ( targets.length > 0 ) {
          that.removeTarget( targets[ 0 ] );
        }
        while ( medias.length > 0 ) {
          that.removeMedia( medias[ 0 ] );
        }
      };

      /****************************************************************
       * Media methods
       ****************************************************************/

      //currentTime - Gets and Sets the media's current time.
      Object.defineProperty( this, "currentTime", {
        get: function() {
          checkMedia();
          return currentMedia.currentTime;
        },
        set: function( time ) {
          checkMedia();
          currentMedia.currentTime = time;
        }
      });

      //duration - Gets and Sets the media's duration.
      Object.defineProperty( this, "duration", {
        get: function() {
          checkMedia();
          return currentMedia.duration;
        },
        set: function( time ) {
          checkMedia();
          currentMedia.duration = time;
        }
      });

      Object.defineProperty( this, "media", {
        get: function() {
          return medias;
        }
      });

      Object.defineProperty( this, "currentMedia", {
        get: function() {
          return currentMedia;
        },
        set: function( media ) {
          if ( typeof( media ) === "string" ) {
            media = that.getMedia( media );
          } //if

          if ( media && medias.indexOf( media ) > -1 ) {
            currentMedia = media;
            logger.log( "Media Changed: " + media.name );
            em.dispatch( "mediachanged", media );
            return currentMedia;
          } //if
        }
      });

      //getMedia - get the media's information
      this.getMedia = function ( media ) {
        for ( var i=0,l=medias.length; i<l; ++i ) {
          if (  ( media.id !== undefined && medias[ i ].id === media.id ) ||
                ( media.name && medias[ i ].name === media.name ) ||
                ( media.target && medias[ i ].target === media.target ) ||
                medias[ i ].name === media ) {
            return medias[ i ];
          }
        }

        return undefined;
      };

      //addMedia - add a media object
      this.addMedia = function ( media ) {
        if ( !( media instanceof Media ) ) {
          media = new Media( media );
        } //if

        var mediaName = media.name;
        medias.push( media );

        media.listen( "mediacontentchanged", em.repeat );
        media.listen( "mediadurationchanged", em.repeat );
        media.listen( "mediatargetchanged", em.repeat );
        media.listen( "mediatimeupdate", em.repeat );
        media.listen( "mediaready", em.repeat );
        media.listen( "trackadded", em.repeat );
        media.listen( "trackremoved", em.repeat );
        media.listen( "tracktargetchanged", em.repeat );
        media.listen( "trackeventadded", em.repeat );
        media.listen( "trackeventremoved", em.repeat );
        media.listen( "trackeventupdated", em.repeat );

        if ( media.tracks.length > 0 ) {
          for ( var ti=0, tl=media.tracks.length; ti<tl; ++ti ) {
            var track = media.tracks[ ti ];
                trackEvents = track.trackEvents;
                media.dispatch( "trackadded", track );
            if ( trackEvents.length > 0 ) {
              for ( var i=0, l=trackEvents.length; i<l; ++i ) {
                track.dispatch( "trackeventadded", trackEvents[ i ] );
              } //for
            } //if
          } //for
        } //if

        em.dispatch( "mediaadded", media );
        if ( !currentMedia ) {
          that.currentMedia = media;
        } //if
        return media;
      }; //addMedia

      //removeMedia - forget a media object
      this.removeMedia = function ( media ) {
        if ( typeof( media ) === "string" ) {
          media = that.getMedia( media );
        } //if

        var idx = medias.indexOf( media );
        if ( idx > -1 ) {
          medias.splice( idx, 1 );
          media.unlisten( "mediacontentchanged", em.repeat );
          media.unlisten( "mediadurationchanged", em.repeat );
          media.unlisten( "mediatargetchanged", em.repeat );
          media.unlisten( "mediatimeupdate", em.repeat );
          media.unlisten( "mediaready", em.repeat );
          media.unlisten( "trackadded", em.repeat );
          media.unlisten( "trackremoved", em.repeat );
          media.unlisten( "tracktargetchanged", em.repeat );
          media.unlisten( "trackeventadded", em.repeat );
          media.unlisten( "trackeventremoved", em.repeat );
          media.unlisten( "trackeventupdated", em.repeat );
          var tracks = media.tracks;
          for ( var i=0, l=tracks.length; i<l; ++i ) {
            em.dispatch( "trackremoved", tracks[i] );
          } //for
          if ( media === currentMedia ) {
            currentMedia = undefined;
          } //if
          em.dispatch( "mediaremoved", media );
          return media;
        } //if
        return undefined;
      }; //removeMedia

      this.extend = function () {
        Butter.extend( that, [].slice.call( arguments, 1 ) );
      };

      /*
      this.registerModule = function( modules, modulesOptions, callback ) {
        if ( typeof modules !== "object" ) {
          modules = [ modules ];
        }
        if ( typeof modules !== "object" ) {
          modulesOptions = [ modulesOptions ];
        }
        require( modules, function() {
          for ( var i=0, l=arguments.length; i<l; ++i ) {
            var loadedModule = arguments[ i ];
            that[ loadedModule.name ] = loadedModule.init( that, modulesOptions[ i ] );
          } //for
          callback( arguments );
        });
      }; //registerModule
      */

      if ( options.ready ) {
        em.listen( "ready", options.ready );
      } //if

      if ( options.modules ) {
        var modulesToLoad = [];
            optionsToGive = [];
        for ( var moduleName in options.modules ) {
          that[ moduleName ] = require( moduleName + "/module" ).init( that, options.modules[ moduleName ] );
          //modulesToLoad.push( moduleRoot + moduleName + "/module" );
          //optionsToGive.push( options.modules[ moduleName ] );
        } //for
        em.dispatch( "ready", that );

        /*
        that.registerModule( modulesToLoad, optionsToGive, function() {
          em.dispatch( "ready", that );
        });
        */
      }
      else {
        em.dispatch( "ready", that );
      } //if

    }; //Butter
    Butter.guid = 0;

    Butter.getScriptLocation = function () {
      var scripts = document.querySelectorAll( "script" );
      for ( var i=0; i<scripts.length; ++i ) {
        var pos = scripts[ i ].src.lastIndexOf( 'butter.js' );
        if ( pos > -1 ) {
          return scripts[ i ].src.substr( 0, pos ) + "/";
        } //if
      } //for
    }; //getScriptLocation

    Butter.extend = function ( obj /* , extra arguments ... */) {
      var dest = obj, src = [].slice.call( arguments, 1 );
      src.forEach( function( copy ) {
        for ( var prop in copy ) {
          dest[ prop ] = copy[ prop ];
        }
      });
    }; //extend

    Butter.Media = Media;
    Butter.Track = Track;
    Butter.TrackEvent = TrackEvent;
    Butter.Target = Target;
    Butter.Logger = Logger;
    Butter.EventManager = EventManager;

    if ( window.Butter.__waiting ) {
      for ( var i=0, l=window.Butter.__waiting.length; i<l; ++i ) {
        Butter.apply( {}, window.Butter.__waiting[ i ] );
      }
      delete Butter._waiting;
    } //if
    window.Butter = Butter;
    return Butter;
  });

})();


}());
