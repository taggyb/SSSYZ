Cactus.Events = {

	on: function(name, callback, context) {
      if (!callback || !name){ 
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

      var args = Array.prototype.slice.call(arguments, 1)

      var events = this._events[name];

      var allEvents = this._events['all'];

      if (events && events.length) {
      	_.each(events, function(event){
          event.callback.apply(event.context, args);
        });
      }

      if (allEvents && allevents.length) {
      	_.each(allEvents, function(event){
          event.callback.apply(event.context. arguments)
        });
      	};

      return this;
    },
};