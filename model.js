var Cactus = Cactus || {};

Cactus.Model = function(attributes, options) {
	var newAttributes = attributes || {};
	if (!options) {
		options = {};
	}
	this.clientId = _.uniqueId('cactusModel');
	this.attributes = {};
	
	if (options.collection) {
		this.collection = options.collection;
	}
	if (options.parse) {
		newAttributes = this.parse(newAttributes, options) || {};
	}
	var defaults = _.result(this, 'defaults');
	if (defaults) {
		newAttributes = _.defaults({}, newAttributes, defaults);
	}
	this.set(newAttributes, options);
	this.initialize.apply(this, arguments);
};

_.extend(Cactus.Model.prototype, Cactus.Events, {
	initialize: function() {},

	toJSON: function() {
		return _.clone(this.attributes);
	},

	sync: function() {
		return Cactus.sync.apply(this, arguments);
	},
	
	get: function(attribute) {
      return this.attributes[attribute];
    },
    
    has: function(attribute) {
      return this.get(attribute) != null;
    },

	set: function(key, value, options) {
		if (key === null) {
			return this;
		}
		
		var attributesToSet = {};
		if (typeof key === 'object') {
			attributesToSet = key;
			options = value;
		} else {
			attributesToSet[key] = value;
		}

		if (!options) {
			options = {};
		}

		var isSet = !options.unset;
		var changedAttributes = [];
		var newValue;
		
		for (var attribute in attributesToSet) {
			newValue = attributesToSet[attribute];

			var currentValue = this.attributes[attribute];
			if (!_.isEqual(currentValue, newValue)) {
				changedAttributes.push(attribute);
			}

			if (isSet) {
				this.attributes[attribute] = newValue;
			} else {
				delete this.attributes[attribute];
			}
		}

		if (!options.silent) {
			for (var i = changedAttributes.length - 1; i >= 0; i--) {
				newValue = this.attributes[changedAttributes[i]];
				this.trigger('change:' + changedAttributes[i], this, newValue, options);
			}
		}

		return this;
	},

	unset: function(attribute, options) {
		return this.set(attribute, undefined, _.extend({}, options, {unset: true}));
	},

	clear: function(options) {
		var emptyAttributes = {};
		for (var key in this.attributes) {
			emptyAttributes[key] = undefined;
		}
		return this.set(emptyAttributes, _.extend({}, options, {unset: true}));
	},
	
	fetch: function(options) {
		var fetchOptions = {};
		if (options) {
			fetchOptions = _.clone(options);
		}

		var model = this;
		
		var callback = fetchOptions.success;
		fetchOptions.success = function(response) {
			var parsedResponse = model.parse(response, fetchOptions);
			var setSuccess = model.set(parsedResponse, fetchOptions);
			if (!setSuccess) {
				return false;
			}

			if (callback) {
				callback(model, response, fetchOptions);
			}
			model.trigger('sync', model, response, fetchOptions);
		};
		wrapError(this, fetchOptions);

		return this.sync('read', this, fetchOptions);
	},

	destroy: function(options) {
		options = options ? _.clone(options) : {};
    	var model = this;
    	var callback = options.success;

     	var destroy = function() {
     		model.trigger('destroy', model, model.collection, options);
    	};

    	options.success = function(response) {
        	if (options.wait || model.isNew()) destroy();
        	if (callback) callback(model, response, options);
        	if (!model.isNew()) model.trigger('sync', model, response, options);
    	};

    	if (this.isNew()) {
        	options.success();
        	return false;
    	}
    	wrapError(this, options);

    	var xhr = this.sync('delete', this, options);
    	if (!options.wait) {
    		destroy();
    	}
    	return xhr;
	},

	url: function() {
		var urlRoot = _.result(this, 'urlRoot') || _.result(this.collection, 'url');
		if (!urlRoot) {
			throw new Error("A url property or function must be specified");
		}

		if (this.isNew()) return urlRoot;
    		return urlRoot + (urlRoot.charAt(urlRoot.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
	},
	
	parse: function(response, options) {
		return response;
	}
});