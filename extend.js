var extend = function(properties) {

var parent = this;
var child;

//setting up a child
if (properties && _.has(properties, 'constructor')){ 
	child = properties.constructor;
	}
	
//no prototype supplied		
	else{
	child = function(){ 
		return parent.apply(this, arguments);
		}; //apply chains the constructors for an object
}

_.extend(child, parent); //puts all parent properties in to child

var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

if(properties) //if child properties are given
_.extend(chid.prototype, properties);


child.__super__ = parent.prototype;

return child;
};

Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;