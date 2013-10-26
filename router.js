//Router function

//intialize
//route
//navigate

var Router = Cactus.Router = function(options) {
    if(!options){
      options = {};
    }
    this.routes = options["routes"];
    if(this.routes){          // bind routes
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    }
    this.initialize.apply(this, arguments);
};


//Cached regular expressions for matching named param parts and splatted parts of route strings.

var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;


//Set up all inheritable Backbone.Router properties and methods.

_.extend(Router.prototype, Events, {


//Initialize is an empty function by default. Override it with your own initialization logic.

initialize: function(){},


//Manually bind a single named route to a callback. For example:this.route('search/:query/p:num', //'search', function(query, num) {
//  ...
//});

route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
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



//Convert a route string into a regular expression, suitable for matching against the current //location hash.

_routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
},


//Given a route, and a URL fragment that it matches, return the array of extracted decoded //parameters. Empty or unmatched parameters will be treated as null to normalize //cross-browser behavior.

_extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param) {
        return param ? decodeURIComponent(param) : null;
      });
    }

});

