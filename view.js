var View = Cactus.View = function(options) {
    if(!options){
    	options = {};
    }
    this.el = options.el;
    this.events = options.events;
    this.model = options.model || {};
    this.initialize.apply(this, arguments);
  }

   _.extend(Cactus.View.prototype, Cactus.Events, {

   	initialize: function(){},

      // Default render, overwrite this with own implementation
   	 render: function() {
      return this;
    },

    setElement: function(element, delegate) {
      this.$el = element;
      this.el = this.$el[0];
      if (delegate !== false) {
        this.delegateEvents();
      }
      return this;
    },

     delegateEvents: function(events) {
      var delegateEventSplitter = /^(\S+)\s*(.*)$/;
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) {
          method = this[events[key]];
        }
        var match = key.match(delegateEventSplitter);
        var eventName = match[1];
        var select = match[2];
        method = _.bind(method, this);
        if (select === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.bind(eventName, select, method);
        }
      }
      return this;
    }
});