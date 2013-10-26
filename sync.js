Cactus.sync = function(method, model, options){
var methods = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };
var type = methods[method];
var params = { type: type, dataType: 'json'};
if(!options){
	options = {};
}

 if (!options.url) {
 		if(_.result(model, 'url'))
      params.url = _.result(model, 'url') 
        else
        params.url = function(){
        throw new Error("Sync Error: url property not specified")
        }
    }
    
  switch(method){
  case 'create':
  case 'update':
  if(options.data == null && model){
	params.contentType = 'application/json';
	var dataSync;
	if(options.attrs){
	dataSync = options.attrs;
	}
	else if(model.ToJSON(options)){
	dataSync = model.toJSON(options);
	}
	params.data = JSON.stringify(dataSync);
}	
  case 'delete':
  	params.processData = false;
  	break;
  }

options.xhr = Cactus.ajax(_.extend(params, options));
var xhr = options.xhr;
model.trigger('request', model, xhr, options);
return xhr;
};

Cactus.ajax = function() {
    return Cactus.$.ajax.apply(Cactus.$, arguments);
  };
