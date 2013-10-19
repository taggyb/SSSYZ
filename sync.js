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

if(!options.url){
	var modelURL = _.result(model, 'url');
	if(!modelURL){}
		throw new Error("Sync Error: url property not specified");
	}
	params.url = modelURL;
}


var isUpdate;
if(method === 'create' || method === 'update')
isUpdate = true;


if(options.data == null && model && isUpdate){
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

if (params.type !== 'GET') {
      params.processData = false;
    }

//**For overriding AJAX options   
options.xhr = Cactus.ajax(_.extend(params, options));
var xhr = options.xhr;
model.trigger('request', model, xhr, options);
return xhr;
//***

}; //end sync

 Cactus.ajax = function() {
    return Cactus.$.ajax.apply(Cactus.$, arguments);
  };