var View = Cactus.View = function(options) {
    this.cid = _.uniqueId('view');
    if(!options){
    	options = {};
    }
    _.extend(this, _.pick(options, viewOptions));
    this.initialize.apply(this, arguments);
    //this.delegateEvents();
  }

   _.extend(Cactus.View.prototype, Cactus.Events, {

   	initialize: function(){},

   	 render: function() {
      return this;
    },

    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

     delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

});