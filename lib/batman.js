(function() {
  /*
  # batman.js
  # batman.coffee
  */  var $mixin, $redirect, $route, $typeOf, $unmixin, Batman, camelize_rx, escapeRegExp, filters, global, helpers, namedOrSplat, namedParam, splatParam, underscore_rx1, underscore_rx2, _objectToString;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Batman = function() {
    var mixins;
    mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return typeof result === "object" ? result : child;
    })(Batman.Object, mixins, function() {});
  };
  Batman.typeOf = $typeOf = function(object) {
    return _objectToString.call(object).slice(8, -1);
  };
  _objectToString = Object.prototype.toString;
  /*
  # Mixins
  */
  Batman.mixin = $mixin = function() {
    var hasSet, key, mixin, mixins, set, to, value, _i, _len;
    to = arguments[0], mixins = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    set = to.set;
    hasSet = $typeOf(set) === 'Function';
    for (_i = 0, _len = mixins.length; _i < _len; _i++) {
      mixin = mixins[_i];
      if ($typeOf(mixin) !== 'Object') {
        continue;
      }
      for (key in mixin) {
        value = mixin[key];
        if (key === 'initialize' || key === 'deinitialize' || key === 'prototype') {
          continue;
        }
        if (hasSet) {
          set.call(to, key, value);
        } else {
          to[key] = value;
        }
      }
      if ($typeOf(mixin.initialize) === 'Function') {
        mixin.initialize.call(to);
      }
    }
    return to;
  };
  Batman.unmixin = $unmixin = function() {
    var from, key, mixin, mixins, _i, _len;
    from = arguments[0], mixins = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = mixins.length; _i < _len; _i++) {
      mixin = mixins[_i];
      for (key in mixin) {
        if (key === 'initialize' || key === 'deinitialize') {
          continue;
        }
        from[key] = null;
        delete from[key];
      }
      if ($typeOf(mixin.deinitialize) === 'Function') {
        mixin.deinitialize.call(from);
      }
    }
    return from;
  };
  Batman._initializeObject = function(object) {
    var key, o, value, _ref, _ref2;
    if (object.prototype && ((_ref = object._batman) != null ? _ref.__initClass__ : void 0) !== this) {
      return object._batman = {
        __initClass__: this
      };
    } else if (!object.hasOwnProperty('_batman')) {
      o = {};
      if (object._batman) {
        _ref2 = object._batman;
        for (key in _ref2) {
          value = _ref2[key];
          if ($typeOf(value) === 'Array') {
            value = Array.prototype.slice.call(value);
          }
          o[key] = value;
        }
      }
      return object._batman = o;
    }
  };
  Batman._findName = function(f, context) {
    var key, value;
    if (!f.displayName) {
      for (key in context) {
        value = context[key];
        if (value === f) {
          f.displayName = key;
          break;
        }
      }
    }
    return f.displayName;
  };
  /*
  # Batman.Keypath
  */
  Batman.Keypath = (function() {
    function Keypath(base, string) {
      this.base = base;
      this.string = string;
    }
    Keypath.prototype.eachPartition = function(f) {
      var index, segments, _ref, _results;
      segments = this.segments();
      _results = [];
      for (index = 0, _ref = segments.length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
        _results.push(f(segments.slice(0, index).join('.'), segments.slice(index).join('.')));
      }
      return _results;
    };
    Keypath.prototype.eachKeypath = function(f) {
      var index, keypath, _ref, _results;
      _results = [];
      for (index = 0, _ref = this.segments().length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
        keypath = this.keypathAt(index);
        if (!keypath) {
          break;
        }
        _results.push(f(keypath, index));
      }
      return _results;
    };
    Keypath.prototype.eachValue = function(f) {
      var index, _ref, _results;
      _results = [];
      for (index = 0, _ref = this.segments().length; 0 <= _ref ? index < _ref : index > _ref; 0 <= _ref ? index++ : index--) {
        _results.push(f(this.valueAt(index), index));
      }
      return _results;
    };
    Keypath.prototype.keypathAt = function(index) {
      var obj, remainingKeypath, segments;
      segments = this.segments();
      if (index >= segments.length || index < 0 || !this.base.get) {
        return;
      }
      if (index === 0) {
        return this;
      }
      obj = this.base.get(segments.slice(0, index).join('.'));
      if (!(obj && obj.get)) {
        return;
      }
      remainingKeypath = segments.slice(index).join('.');
      return new Batman.Keypath(obj, remainingKeypath);
    };
    Keypath.prototype.valueAt = function(index) {
      var segments;
      segments = this.segments();
      if (index >= segments.length || index < 0 || !this.base.get) {
        return;
      }
      return this.base.get(segments.slice(0, index + 1).join('.'));
    };
    Keypath.prototype.segments = function() {
      return this.string.split('.');
    };
    Keypath.prototype.get = function() {
      return this.base.get(this.string);
    };
    return Keypath;
  })();
  /*
  # Batman.Observable
  */
  Batman.Observable = {
    keypath: function(string) {
      return new Batman.Keypath(this, string);
    },
    get: function(key) {
      var value;
      return value = this[key];
    },
    set: function(key, value) {
      var newValue, oldValue;
      oldValue = this.get(key);
      newValue = this[key] = value;
      if (newValue !== oldValue) {
        return this.fire(key, newValue, oldValue);
      }
    },
    unset: function(key) {
      var oldValue;
      oldValue = this[key];
      this[key] = null;
      delete this[key];
      return this.fire(key, oldValue);
    },
    observe: function(wholeKeypathString, fireImmediately, callback) {
      var keyObservers, self, value, wholeKeypath, _base, _base2;
      Batman._initializeObject(this);
      (_base = this._batman).observers || (_base.observers = {});
      if (!callback) {
        callback = fireImmediately;
        fireImmediately = false;
      }
      wholeKeypath = this.keypath(wholeKeypathString);
      keyObservers = (_base2 = this._batman.observers)[wholeKeypathString] || (_base2[wholeKeypathString] = []);
      keyObservers.push(callback);
      self = this;
      if (wholeKeypath.segments().length > 1) {
        callback._triggers = [];
        callback._refresh_triggers = function() {
          return wholeKeypath.eachKeypath(function(keypath, index) {
            var segments, trigger, _base3;
            segments = keypath.segments();
            if (trigger = callback._triggers[index]) {
              keypath.base.forget(segments[0], trigger);
            }
            trigger = function(value, oldValue) {
              var oldKeypath;
              if (segments.length > 1 && (oldKeypath = typeof oldValue.keypath === "function" ? oldValue.keypath(segments.slice(1).join('.')) : void 0)) {
                oldKeypath.eachKeypath(function(k, i) {
                  var absoluteIndex;
                  absoluteIndex = index + i;
                  console.log("forgetting trigger at '" + k.segments()[0] + "' for '" + wholeKeypathString + "'");
                  return k.base.forget(k.segments()[0], callback._triggers[index + i]);
                });
                callback._refresh_triggers(index);
                oldValue = oldKeypath.get();
              }
              return callback.call(self, self.get(wholeKeypathString), oldValue);
            };
            console.log("adding trigger to '" + segments[0] + "' for '" + wholeKeypathString + "'");
            callback._triggers[index] = trigger;
            return typeof (_base3 = keypath.base).observe === "function" ? _base3.observe(segments[0], trigger) : void 0;
          });
        };
        callback._refresh_triggers();
        callback._forgotten = __bind(function() {
          return wholeKeypath.eachKeypath(__bind(function(keypath, index) {
            var trigger;
            if (trigger = callback._triggers[index]) {
              console.log("forgetting trigger at '" + keypath.segments()[0] + "' for '" + wholeKeypathString + "'");
              keypath.base.forget(keypath.segments()[0], trigger);
              return callback._triggers[index] = null;
            }
          }, this));
        }, this);
      }
      if (fireImmediately) {
        value = this.get(wholeKeypathString);
        callback(value, value);
      }
      return this;
    },
    fire: function(key, value, oldValue) {
      var callback, observers, _i, _len, _ref;
      if (!this.allowed(key)) {
        return;
      }
      if (typeof value === 'undefined') {
        value = this.get(key);
      }
      observers = (_ref = this._batman.observers) != null ? _ref[key] : void 0;
      if (observers) {
        for (_i = 0, _len = observers.length; _i < _len; _i++) {
          callback = observers[_i];
          if (callback) {
            callback.call(this, value, oldValue);
          }
        }
      }
      return this;
    },
    forget: function(key, callback) {
      var array, ary, callbackIndex, k, o, _base, _i, _j, _len, _len2, _ref, _ref2;
      Batman._initializeObject(this);
      (_base = this._batman).observers || (_base.observers = {});
      if (key) {
        if (callback) {
          array = this._batman.observers[key];
          if (array) {
            callbackIndex = array.indexOf(callback);
            if (array && callbackIndex !== -1) {
              array.splice(callbackIndex, 1);
            }
            if (typeof callback._forgotten === "function") {
              callback._forgotten();
            }
          }
        } else {
          _ref = this._batman.observers[key];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            o = _ref[_i];
            if (typeof o._forgotten === "function") {
              o._forgotten();
            }
          }
          this._batman.observers[key] = [];
        }
      } else {
        _ref2 = this._batman.observers;
        for (k in _ref2) {
          ary = _ref2[k];
          for (_j = 0, _len2 = ary.length; _j < _len2; _j++) {
            o = ary[_j];
            if (typeof o._forgotten === "function") {
              o._forgotten();
            }
          }
        }
        this._batman.observers = {};
      }
      return this;
    },
    prevent: function(key) {
      var counts, _base;
      Batman._initializeObject(this);
      counts = (_base = this._batman).preventCounts || (_base.preventCounts = {});
      counts[key] || (counts[key] = 0);
      counts[key]++;
      return this;
    },
    allow: function(key) {
      var counts, _base;
      Batman._initializeObject(this);
      counts = (_base = this._batman).preventCounts || (_base.preventCounts = {});
      if (counts[key] > 0) {
        counts[key]--;
      }
      return this;
    },
    allowed: function(key) {
      var _ref;
      Batman._initializeObject(this);
      return !(((_ref = this._batman.preventCounts) != null ? _ref[key] : void 0) > 0);
    }
  };
  /*
  # Batman.Event
  */
  Batman.EventEmitter = {
    event: function(callback) {
      var f;
      if (!this.observe) {
        throw "EventEmitter needs to be on an object that has Batman.Observable.";
      }
      f = function(observer) {
        var key, value;
        key = Batman._findName(f, this);
        if ($typeOf(observer) === 'Function') {
          return this.observe(key, f.isOneShot && f.fired, observer);
        } else if (this.allowed(key)) {
          if (f.isOneShot && f.fired) {
            return false;
          }
          value = callback.apply(this, arguments);
          if (typeof value === 'undefined') {
            value = arguments[0];
          }
          if (typeof value === 'undefined') {
            value = null;
          }
          this.fire(key, value);
          if (f.isOneShot) {
            f.fired = true;
          }
          return value;
        } else {
          return false;
        }
      };
      return $mixin(f, {
        isEvent: true
      });
    },
    eventOneShot: function(callback) {
      return $mixin(Batman.EventEmitter.event.apply(this, arguments), {
        isOneShot: true
      });
    }
  };
  /*
  # Batman.Object
  */
  Batman.Object = (function() {
    Object.global = function(isGlobal) {
      if (isGlobal === false) {
        return;
      }
      return global[this.name] = this;
    };
    Object.property = function(foo) {
      return {};
    };
    Object.mixin = function() {
      var mixins;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return $mixin.apply(null, [this].concat(__slice.call(mixins)));
    };
    Object.prototype.mixin = function() {
      var mixins;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return $mixin.apply(null, [this].concat(__slice.call(mixins)));
    };
    function Object() {
      var mixins;
      mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Batman._initializeObject(this);
      this.mixin.apply(this, mixins);
    }
    Object.mixin(Batman.Observable, Batman.EventEmitter);
    Object.prototype.mixin(Batman.Observable);
    return Object;
  })();
  /*
  # Batman.App
  */
  Batman.App = (function() {
    function App() {
      App.__super__.constructor.apply(this, arguments);
    }
    __extends(App, Batman.Object);
    App.requirePath = '';
    App._require = function() {
      var base, name, names, path, _i, _len, _results;
      path = arguments[0], names = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      base = this.requirePath + path;
      _results = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        this.prevent('run');
        path = base + '/' + name + '.coffee';
        _results.push(new Batman.Request({
          url: path,
          type: 'html',
          success: __bind(function(response) {
            CoffeeScript.eval(response);
            this.allow('run');
            return this.run();
          }, this)
        }));
      }
      return _results;
    };
    App.controller = function() {
      var names;
      names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._require.apply(this, ['controllers'].concat(__slice.call(names)));
    };
    App.model = function() {
      var names;
      names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._require.apply(this, ['models'].concat(__slice.call(names)));
    };
    App.view = function() {
      var names;
      names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this._require.apply(this, ['views'].concat(__slice.call(names)));
    };
    App.layout = void 0;
    App.run = App.eventOneShot(function() {
      if (typeof this.layout === 'undefined') {
        return this.set('layout', new Batman.View({
          node: document
        }));
      }
    });
    return App;
  })();
  /*
  # Routing
  */
  namedParam = /:([\w\d]+)/g;
  splatParam = /\*([\w\d]+)/g;
  namedOrSplat = /[:|\*]([\w\d]+)/g;
  escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
  Batman.Route = {
    isRoute: true,
    toString: function() {
      return "route: " + this.pattern + " " + this.action;
    }
  };
  $mixin(Batman, {
    HASH_PATTERN: '#!',
    _routes: [],
    route: function(pattern, callback) {
      var callbackEater;
      callbackEater = function(callback) {
        var f;
        f = function() {
          var context;
          context = f.context || this;
          if (context && context.sharedInstance) {
            context = context.get('sharedInstance');
          }
          if (context && context.dispatch) {
            return context.dispatch(f, this);
          } else {
            return f.action.apply(context, arguments);
          }
        };
        $mixin(f, Batman.Route, {
          pattern: pattern,
          action: callback,
          context: callbackEater.context
        });
        Batman._routes.push(f);
        return f;
      };
      callbackEater.context = this;
      if ($typeOf(callback) === 'Function') {
        return callbackEater(callback);
      } else {
        return callbackEater;
      }
    },
    redirect: function(urlOrFunction) {
      var url;
      url = (urlOrFunction != null ? urlOrFunction.isRoute : void 0) ? urlOrFunction.pattern : urlOrFunction;
      return window.location.hash = "" + Batman.HASH_PATTERN + url;
    }
  });
  Batman.Object.route = $route = Batman.route;
  Batman.Object.redirect = $redirect = Batman.redirect;
  $mixin(Batman.App, {
    startRouting: function() {
      var parseUrl;
      if (typeof window === 'undefined') {
        return;
      }
      if (!Batman._routes.length) {
        return;
      }
      parseUrl = __bind(function() {
        var hash;
        hash = window.location.hash.replace(Batman.HASH_PATTERN, '');
        if (hash === this._cachedRoute) {
          return;
        }
        this._cachedRoute = hash;
        return this.dispatch(hash);
      }, this);
      if (!window.location.hash) {
        window.location.hash = "" + Batman.HASH_PATTERN + "/";
      }
      setTimeout(parseUrl, 0);
      if ('onhashchange' in window) {
        this._routeHandler = parseUrl;
        return window.addEventListener('hashchange', parseUrl);
      } else {
        return this._routeHandler = setInterval(parseUrl, 100);
      }
    },
    root: function(callback) {
      return $route('/', callback);
    }
  });
  /*
  # Batman.Controller
  */
  Batman.Controller = (function() {
    function Controller() {
      Controller.__super__.constructor.apply(this, arguments);
    }
    __extends(Controller, Batman.Object);
    Controller.sharedInstance = function() {
      if (!this._sharedInstance) {
        this._sharedInstance = new this;
      }
      return this._sharedInstance;
    };
    Controller.prototype.dispatch = function() {
      var key, params, result, route, _ref;
      route = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this._actedDuringAction = false;
      result = (_ref = route.action).call.apply(_ref, [this].concat(__slice.call(params)));
      key = Batman._findName(route, this);
      if (!this._actedDuringAction) {
        new Batman.View({
          source: ""
        });
      }
      return delete this._actedDuringAction;
    };
    Controller.prototype.redirect = function(url) {
      this._actedDuringAction = true;
      return $redirect(url);
    };
    Controller.prototype.render = function(options) {
      var key, m, push, value, view;
      if (options == null) {
        options = {};
      }
      this._actedDuringAction = true;
      if (!options.view) {
        options.source = 'views/' + helpers.underscore(this.constructor.name.replace('Controller', '')) + '/' + this._currentAction + '.html';
        options.view = new Batman.View(options);
      }
      if (view = options.view) {
        view.context = global;
        m = {};
        push = function(key, value) {
          return function() {
            Array.prototype.push.apply(this, arguments);
            return view.context.fire(key, this);
          };
        };
        for (key in this) {
          if (!__hasProp.call(this, key)) continue;
          value = this[key];
          if (key.substr(0, 1) === '_') {
            continue;
          }
          m[key] = value;
          if (typeOf(value) === 'Array') {
            value.push = push(key, value);
          }
        }
        $mixin(global, m);
        return view.ready(function() {
          Batman.DOM.contentFor('main', view.get('node'));
          return Batman.unmixin(global, m);
        });
      }
    };
    return Controller;
  })();
  /*
  # Batman.DataStore
  */
  Batman.DataStore = (function() {
    function DataStore(model) {
      this.model = model;
      this._data = {};
    }
    __extends(DataStore, Batman.Object);
    DataStore.prototype.set = function(id, json) {
      if (!id) {
        id = model.getNewId();
      }
      return this._data['' + id] = json;
    };
    DataStore.prototype.get = function(id) {
      var record, response;
      record = this._data['' + id];
      response = {};
      response[record.id] = record;
      return response;
    };
    DataStore.prototype.all = function() {
      return Batman.mixin({}, this._data);
    };
    DataStore.prototype.query = function(params) {
      var id, json, key, match, results, value, _ref;
      results = {};
      _ref = this._data;
      for (id in _ref) {
        json = _ref[id];
        match = true;
        for (key in params) {
          value = params[key];
          if (json[key] !== value) {
            match = false;
            break;
          }
        }
        if (match) {
          results[id] = json;
        }
      }
      return results;
    };
    return DataStore;
  })();
  /*
  # Batman.Model
  */
  Batman.Model = (function() {
    Model._makeRecords = function(ids) {
      var id, json, r, _results;
      _results = [];
      for (id in ids) {
        json = ids[id];
        r = new this({
          id: id
        });
        _results.push($mixin(r, json));
      }
      return _results;
    };
    __extends(Model, Batman.Object);
    Model.hasMany = function(relation) {
      var inverse, model;
      model = helpers.camelize(helpers.singularize(relation));
      inverse = helpers.camelize(this.name, true);
      return this.prototype[relation] = Batman.Object.property(function() {
        var query;
        query = {
          model: model
        };
        query[inverse + 'Id'] = '' + this.id;
        return App.constructor[model]._makeRecords(App.dataStore.query(query));
      });
    };
    Model.hasOne = function(relation) {};
    Model.belongsTo = function(relation) {
      var key, model;
      model = helpers.camelize(helpers.singularize(relation));
      key = helpers.camelize(model, true) + 'Id';
      return this.prototype[relation] = Batman.Object.property(function(value) {
        if (arguments.length) {
          this.set(key, value && value.id ? '' + value.id : '' + value);
        }
        return App.constructor[model]._makeRecords(App.dataStore.query({
          model: model,
          id: this[key]
        }))[0];
      });
    };
    Model.persist = function(mixin) {
      if (mixin === false) {
        return;
      }
      if (!this.dataStore) {
        this.dataStore = new Batman.DataStore(this);
      }
      if (mixin === Batman) {
        ;
      } else {
        return Batman.mixin(this, mixin);
      }
    };
    Model.all = Model.property(function() {
      return this._makeRecords(this.dataStore.all());
    });
    Model.first = Model.property(function() {
      return this._makeRecords(this.dataStore.all())[0];
    });
    Model.last = Model.property(function() {
      var array;
      array = this._makeRecords(this.dataStore.all());
      return array[array.length - 1];
    });
    Model.find = function(id) {
      console.log(this.dataStore.get(id));
      return this._makeRecords(this.dataStore.get(id))[0];
    };
    Model.create = Batman.Object.property(function() {
      return new this;
    });
    Model.destroyAll = function() {
      var all, r, _i, _len, _results;
      all = this.get('all');
      _results = [];
      for (_i = 0, _len = all.length; _i < _len; _i++) {
        r = all[_i];
        _results.push(r.destroy());
      }
      return _results;
    };
    function Model() {
      this.destroy = __bind(this.destroy, this);;      this._data = {};
      Model.__super__.constructor.apply(this, arguments);
    }
    Model.prototype.id = '';
    Model.prototype.isEqual = function(rhs) {
      return this.id === rhs.id;
    };
    Model.prototype.set = function(key, value) {
      return this._data[key] = Model.__super__.set.apply(this, arguments);
    };
    Model.prototype.save = function() {
      var model;
      model = this.constructor;
      model.dataStore.set(this.id, this.toJSON());
      return this;
    };
    Model.prototype.destroy = function() {
      if (typeof this.id === 'undefined') {
        return;
      }
      App.dataStore.unset(this.id);
      App.dataStore.needsSync();
      this.constructor.fire('all', this.constructor.get('all'));
      return this;
    };
    Model.prototype.toJSON = function() {
      return this._data;
    };
    Model.prototype.fromJSON = function(data) {
      return Batman.mixin(this, data);
    };
    return Model;
  })();
  /*
  # Batman.View
  */
  Batman.View = (function() {
    function View() {
      this.reloadSource = __bind(this.reloadSource, this);;      View.__super__.constructor.apply(this, arguments);
    }
    __extends(View, Batman.Object);
    View.prototype.source = '';
    View.prototype.html = '';
    View.prototype.node = null;
    View.prototype.contentFor = null;
    View.prototype.ready = View.event(function() {});
    View.prototype.observe('source', function() {
      return setTimeout(this.reloadSource, 0);
    });
    View.prototype.reloadSource = function() {
      if (!this.source) {
        return;
      }
      return new Batman.Request({
        url: "views/" + this.source,
        type: 'html',
        success: function(response) {
          return this.set('html', response);
        }
      });
    };
    View.prototype.observe('html', function(html) {
      var node;
      if (this.contentFor) {
        ;
      } else {
        node = this.node || document.createElement('div');
        node.innerHTML = html;
        this.node = null;
        return this.set('node', node);
      }
    });
    View.prototype.observe('node', function(node) {
      return new Batman.Renderer(node, __bind(function() {
        return this.ready();
      }, this));
    });
    return View;
  })();
  /*
  # Helpers
  */
  camelize_rx = /(?:^|_)(.)/g;
  underscore_rx1 = /([A-Z]+)([A-Z][a-z])/g;
  underscore_rx2 = /([a-z\d])([A-Z])/g;
  helpers = Batman.helpers = {
    camelize: function(string, firstLetterLower) {
      string = string.replace(camelize_rx, function(str, p1) {
        return p1.toUpperCase();
      });
      if (firstLetterLower) {
        return string.substr(0, 1).toLowerCase() + string.substr(1);
      } else {
        return string;
      }
    },
    underscore: function(string) {
      return string.replace(underscore_rx1, '$1_$2').replace(underscore_rx2, '$1_$2').replace('-', '_').toLowerCase();
    },
    singularize: function(string) {
      if (string.substr(-1) === 's') {
        return string.substr(0, string.length - 1);
      } else {
        return string;
      }
    },
    pluralize: function(count, string) {
      if (string) {
        if (count === 1) {
          return string;
        }
      } else {
        string = count;
      }
      if (string.substr(-1) === 'y') {
        return "" + (string.substr(0, string.length - 1)) + "ies";
      } else {
        return "" + string + "s";
      }
    }
  };
  /*
  # Filters
  */
  filters = Batman.filters = {};
  /*
  # DOM Helpers
  */
  Batman.Renderer = (function() {
    var regexp;
    function Renderer(node, callback) {
      this.node = node;
      this.callback = callback;
      this.resume = __bind(this.resume, this);;
      this.start = __bind(this.start, this);;
      Renderer.__super__.constructor.apply(this, arguments);
      setTimeout(this.start, 0);
    }
    __extends(Renderer, Batman.Object);
    Renderer.prototype.start = function() {
      this.tree = {};
      this.startTime = new Date;
      return this.parseNode(this.node);
    };
    Renderer.prototype.resume = function() {
      console.log('resume');
      this.startTime = new Date;
      return this.parseNode(this.resumeNode);
    };
    Renderer.prototype.finish = function() {
      console.log('done');
      this.startTime = null;
      return this.callback();
    };
    regexp = /data\-(.*)/;
    Renderer.prototype.parseNode = function(node) {
      var attr, name, nextNode, _i, _len, _ref;
      if ((new Date) - this.startTime > 50) {
        console.log('stopping');
        this.resumeNode = node;
        setTimeout(this.resume, 0);
        return;
      }
      if (node.getAttribute) {
        _ref = node.attributes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attr = _ref[_i];
          name = attr.nodeName;
          console.log(node.nodeName, name, name.match(regexp));
        }
      }
      if ((nextNode = this.nextNode(node))) {
        return this.parseNode(nextNode);
      } else {
        return this.finish;
      }
    };
    Renderer.prototype.nextNode = function(node) {
      var children, nextParent, parentSibling, sibling;
      children = node.childNodes;
      if (children != null ? children.length : void 0) {
        return children[0];
      }
      sibling = node.nextSibling;
      if (sibling) {
        return sibling;
      }
      nextParent = node;
      while (nextParent = nextParent.parentNode) {
        parentSibling = nextParent.nextSibling;
        if (parentSibling) {
          return parentSibling;
        }
      }
    };
    return Renderer;
  })();
  Batman.DOM = {
    readers: {},
    keyReaders: {}
  };
  /*
  # Batman.Request
  */
  Batman.Request = (function() {
    function Request() {
      Request.__super__.constructor.apply(this, arguments);
    }
    __extends(Request, Batman.Object);
    Request.prototype.url = '';
    Request.prototype.data = '';
    Request.prototype.method = 'get';
    Request.prototype.response = null;
    Request.prototype.observe('url', function() {
      return setTimeout((__bind(function() {
        return this.send();
      }, this)), 0);
    });
    Request.prototype.loading = Request.event(function() {});
    Request.prototype.loaded = Request.event(function() {});
    Request.prototype.success = Request.event(function() {});
    Request.prototype.error = Request.event(function() {});
    return Request;
  })();
  global = typeof exports !== "undefined" && exports !== null ? exports : this;
  global.Batman = Batman;
  Batman.exportGlobals = function() {
    global.$typeOf = $typeOf;
    global.$mixin = $mixin;
    global.$unmixin = $unmixin;
    global.$route = $route;
    return global.$redirect = $redirect;
  };
}).call(this);