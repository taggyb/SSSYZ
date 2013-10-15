
  
Cactus.emulateJSON = false; //Turn on emulateJSON to support legacy 

Cactus.emulateHTTP = false; //turn on to support old HTTP servers

Cactus.sync = function(method, model, options){
var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

var type = methodMap[method];

if(!options){
	options = {};
}

_.defaults(options, {
		emulateHTTP: Cactus.emulateHTTP, 
		emulateJSON: Cactus.emulateJSON
});


var params = { type: type, dataType: 'json'};

if(!options.url){

	modelURL = _.result(model, 'url');
	
	if(!modelURL){}
	throw new Error(""url" property not specified");
	}
	params.url = modelURL;
}


var isCup;
if(method === 'create' || method === 'update'){
isCup = true;
}

if(options.data == null && model && isCup){
	params.contentType = 'application/json';

	if(options.attrs){
	prams.data = JSON.stringify(options.attrs)
	}
	else if(model.ToJSON(options)){
	params.data = JSON.stringify(model.toJSON(options));
	}
}


if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      if(params.data){
      params.data = model: param.data
    }
    else{
    params.data = {};
    }
}


var isPost;
if(type === 'PUT' || type === 'DELETE'){
isPost = true;
}

if (options.emulateHTTP && isPost){
	params.type = 'POST';
	if(options.emulateJSON){
	params.data._method = type;
	}
	
	var beforeSend = options.beforeSend;
/*_*/	
	options.beforeSend = function(xhr) {
	xhr.setRequestHeader('X-HTTP-Method-Override',type);
	if (beforeSend){
	return beforeSend.apply(this, arguments);
	}};
	
}


/*_*/
if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }
    
options.xhr = Cactus.ajax(_.extend(params, options));
var xhr = options.xhr;
model.trigger('request', model, xhr, options);
return xhr;
}; //end sync

 Cactus.ajax = function() {
    return Cactus.$.ajax.apply(Cactus.$, arguments);
  };