var Collection = Cactus.Collection = function(models, options) {
    if(!options)
     options = {};
     
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
	this.length = 0;
    this.models = [];
    this._byId  = {};
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));


};

var setOptions = {add: true, remove: true, merge: true};
var addOptions = {add: true, remove: false};
  
  //collections inheritable methods _.extend(dest, sources*)
  _.extend(Collection.prototype, Events, {
  
   model: Model, 
   
   //Initialize is an empty function by default.
   initialize: function(){}
   
   //The JSON representation of a Collection is an array of the models' attributes.
   toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },
    
	//Proxy Backbone.sync by default.
     sync: function() {
      return Cactus.sync.apply(this, arguments); //uses cactus's sync method.
    },
    
    //Add a model, or list of models to the set.
    add: function(models, options) {
    var addOpt = { merge:false };
    	addOpt = _.extend(addOpt, options, addOptions);
    return this.set(models, addOpt); 
    },
    
    //splice method is the best way to delete obj given an array
    remove: function(models, options) {
	if(!options)
	options = {};
    if( toString.call(models) == '[object Array]'){ 
    models = _.clone(models);
    var len = models.length;
    //splice method
    for(var i = 0; i < len; i++){
    model[i] = this.get(models[i]);
    model = model[i];
    if(!model) continue;
	delete this.byId(model.id); //not sure why must delete by id, but i just follow
	delete this.byId(mode.cid);
	index = this.indexOf(model);
	this.models.splice(index,1);
	len--;
	// if options is not used, i can remove this.
	// cannot find correct reference to model.trigger
		if(!options.silent){
		options.index = index;
    	model.trigger('remove', model, this, options);
		}
    }
    else{
    delete this._byId[models.id];
    delete this._byId[models.cid];
    if(!options.silent){
	options.index = index;
    models.trigger('remove', models, this, options);
    this._removeReference(models);
	}
    	}
    },

    
    //add model to end of collection
    push: function(model, options) {
        model = this._prepareModel(model, options);
        this.add(model, _.extend({at: this.length}, options));
        return model;
    },
    
    //Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },
    
    //Get a model from a collection, specified by an id, a cid, or by passing in a model.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
    },
    
    
/*Fetch the default set of models for this collection, 
 *resetting the collection when they arrive. 
 *If reset: true is passed, the response data will be passed through 
 *the reset method instead of set.
 */
    fetch: function(options) {
    if(options) options = _.clone(options);
    else options = {}:
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
      var method;
      if(options.reset) method = 'reset';
      else method = 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },
    
     create: function(model, options) {
    if(options) options = _.clone(options);
    else options = {}:
    	model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },
    
     parse: function(resp, options) {
      return resp;
    },
    
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) { //if attrs is already a model obj, just set its collection return
        if (!attrs.collection) 
        	attrs.collection = this;
        return attrs;
      }
      //if not object, we will have to create a new model
      if(options) options = _.clone(options);
      else options = {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },
    
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },
    
    });//END EXTEND
    
    //all the underscore methods we need
    var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain'];
    
    var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain'];

//Mix in each Underscore method as a proxy to Collection#models.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

//Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];
//Use attributes instead of properties.
 _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });