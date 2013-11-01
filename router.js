//Router function

//intialize
//route
//navigate

var Router = Cactus.Router = function(options) {
    if(!options){
      options = {};
    }
    this.routes = options["routes"]; //this line might be wrong
    if(this.routes){ // bind routes
//     _.result(object, property)
//If the value of the named property is a function 
//then invoke it with the object as context; otherwise, return it.
//var object = {cheese: 'crumpets', stuff: function(){ return 'nonsense'; }};
//_.result(object, 'cheese');
//=> "crumpets"
//_.result(object, 'stuff');
//=> "nonsense"

//_.keys(object)
//Retrieve all the names of the object's properties.
//_.keys({one: 1, two: 2, three: 3});
//=> ["one", "two", "three"]
      var routes = _.keys(_.result(this, 'routes'));
      
      while (routes.length != 0) {
        var route=routes.pop();
        this.route(route, this.routes[route]);
      }
    }
    this.initialize.apply(this, arguments);
};


//Cached regular expressions for matching named param parts and 
//splatted parts of route strings.

var optionalParam = /\((.*?)\)/g;
var namedParam = /(\(\?)?:\w+/g;
var splatParam = /\*\w+/g;
var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;


//Set up all inheritable Backbone.Router properties and methods.
//_.extend(destination, *sources)
//Copy all of the properties in the source objects over to the destination object,
//and return the destination object. It's in-order,
//so the last source will override properties of the same name in previous arguments.
//_.extend({name: 'moe'}, {age: 50});
//=> {name: 'moe', age: 50}

_.extend(Router.prototype, Events, {


//Initialize is an empty function by default.
//Override it with your own initialization logic.

initialize: function(){},


//Manually bind a single named route to a callback.
// For example:this.route('search/:query/p:num', //'search', function(query, num) {
// ...
//});

route: function(route, name, callback) {
  //_.isRegExp(object)
//Returns true if object is a RegExp.
//_.isRegExp(/moe/);
//=> true

      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
//_.isFunction(object)
//Returns true if object is a Function.
//_.isFunction(alert);
//=> true
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Cactus.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        callback && callback.apply(router, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Cactus.history.trigger('route', router, name, args);
      });
      return this;
},


//Simple proxy to Backbone.history to save a fragment into the history.

navigate: function(fragment, options) {
      Cactus.history.navigate(fragment, options);
      return this;
},


//Convert a route string into a regular expression, 
//suitable for matching against the current //location hash.
_routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
},


//Given a route, and a URL fragment that it matches,
// return the array of extracted decoded //parameters. 
//Empty or unmatched parameters will be treated as null to 
//normalize //cross-browser behavior.
_extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      //_.map(list, iterator, [context]) Alias: collect
//Produces a new array of values by mapping each value in list through a transformation function (iterator). If the native map method exists, it will be used instead. If list is a JavaScript object, 
//iterator's arguments will be (value, key, list).
//_.map([1, 2, 3], function(num){ return num * 3; });
//=> [3, 6, 9]
//_.map({one: 1, two: 2, three: 3}, function(num, key){ return num * 3; });
//=> [3, 6, 9]
      return _.map(params, function(param) {
        return param ? decodeURIComponent(param) : null;
      });
    }

});