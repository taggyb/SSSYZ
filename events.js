Cactus.Events = {

	on: function(name, callback, context) {
      if (!callback){ 
      		return this;
      	}

      if(!this._events){
      	this._events = {};
      	} 

      if(!(this._events[name])){
      	this._events[name] = [];
      }

      this._events[name].push({callback: callback, context: context || this});

      return this;
    },

    off: function(name, callback) {
      if (!this._events) {
      	return this;
      	}

      if (!this._events[name]){
      	return this;
      }

      if(name && !callback){
      	this._events[name] = [];
      	return this;
      }
      
      if (!name && !callback) {
        this._events = {};
        return this;
      }

      this._events[name] = _.reject(this._events[name] function(event){ 
      	event.callback == callback;
      })

      return this;
    },

    trigger: function(name) {
      if (!this._events){
		return this;
		}

	  if(!name){
	  	return this;
	 	 }

      var args = array.slice.call(arguments, 1);

      var events = this._events[name];

      var allEvents = this._events.all;

      if (events) {
      	triggerEvents(events, args);
      }

      if (allEvents) {
      	triggerEvents(allEvents, arguments);
      	}
      	
      return this;
    },

     listenTo: function(object, events, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = object._listenerId || (object._listenerId = _.uniqueId('l'));
      listeners[id] = object;
      object.on(events, callback || this, this);
      return this;
    },

     stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) {
      	return this;
      }
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') {
      	callback = this;
      }
      if (obj) (listeningTo = {}){
      	[obj._listenId] = obj;
      }
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) {
        	delete this._listeningTo[id];
        }
      }
      return this;
    }

};