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
  
   model: Model, //default
   
   initialize: function(){}
   
   //same
   toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },
    
	//same
     sync: function() {
      return Cactus.sync.apply(this, arguments); //uses cactus's sync method.
    },
    
    //rearranged
    add: function(models, options) {
    var addOpt = { merge:false };
    	addOpt = _.extend(addOpt, options, addOptions);
    return this.set(models, addOpt); 
    },
    
    //rearranged. no choice. splice method is the best way to delete obj given an array
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
    
    //similar to model:set
    set: function(models, options) {
    	var singular = false;
      options = _.defaults({}, options, setOptions);
      if (options.parse) 
      models = this.parse(models, options); //?
      models = singular ? (models ? [models] : []) : _.clone(models);
      if(toString.call(models) == '[object Array]')
      	models = _.clone(models);
      else{
     singular = true;
      if(models) models = [models];
      else models = [];
      } 
      
      var sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;


//Turn bare objects into model references, and prevent invalid models from being added.
	  var attrs, id, model;
      for (var i = 0,len = models.length; i< len; i++) {
        attrs = models[i];
        if (attrs instanceof Model) { //is a model reference
          model = attrs;
          id = model;
        } else {
          id = attrs[targetModel.prototype.idAttribute];
        }

//If a duplicate is found, prevent it from being added and optionally merge it into the existing model.

 		var existing;
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
          	if (attrs===model) attrs = model.attributes;
            //if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

//If this is a new, valid model, push it to the toAdd list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);

//Listen to added models' events, and index models for lookup by id and by cid.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
        if (order) order.push(existing || model);
      }

//Remove nonexistent models if appropriate. 
      if (remove) {
        for (i = 0, len = this.length; i < len; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

//See if sorting is needed, update length and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, len = toAdd.length; i < len; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

//Silently sort the collection if appropriate.

      if (sort) this.sort({silent: true});

//Unless silenced, it's time to fire all appropriate add/sort events.

      if (!options.silent) {
        for (i = 0, len = toAdd.length; i < len; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

//Return the added (or merged) model (or models).
	if(singular) return models[0];
	else return models;

    },
    
    //same
    reset: function(models, options) {
    if(!options) options = {};
    var len = this.models.length;
      for (var i = 0; i < len; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models; //is never used.
      this.length = 0;
      this.models = [];
      this._byId  = {};
      var resetOpt = {silent:true};
      	  resetOpt = _.extend(resetOpt,options); //may have problems
      models = this.add(models, resetOpt);
      if (!options.silent) 
      this.trigger('reset', this, options);
      return models;
    },
    
    //add model to end of collection
    push: function(model, options) {
        model = this._prepareModel(model, options);
        this.add(model, _.extend({at: this.length}, options));
        return model;
    },
    
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
    },
    
    at: function(index) {
      return this.models[index];
    },
    
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) {
      	if(first)return void 0;
      	else return [];
      	} 
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },
    
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },
    
    
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
    
    //same:(
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