/*
* Primary file for the API
*
*/

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var httpServer = http.createServer(function(req,res){
	// Get the url and parse it
	var parsedUrl = url.parse(req.url,true);

	//Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	//Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';

	req.on('data',function(data){
		buffer += decoder.write(data);
	});

	req.on('end',function(){
		buffer += decoder.end();

		//Choose the handler this request shoud go to. If one is not found, use the notFound handler
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		//Construct the data object to send to the handler
		var data = {
			'trimmedPath': trimmedPath,
			'payload': buffer
		};

		//Route the request to the handler specified in the router
		chosenHandler(data,function(statusCode, payload){
			// Use the status code called back by the handler, or default to 200
			statusCode = typeof(statusCode) =='number' ? statusCode : 200;

			//Use the payload called back by the hanlder, or default to an empty object
			payload = typeof(payload) == 'object' ? payload : {};

			//Conver the payload to a string
			var payloadString = JSON.stringify(payload);

			//return the response
			res.setHeader('Content-Type',"application/JSON");
			res.writeHead(statusCode);
			res.end(payloadString);

			//Log the request path
			console.log("--------- INIT ---------");
			console.log("Path: "+trimmedPath);
			console.log("Status Code: ",statusCode);
			console.log("Payload: ",payloadString);
			console.log("--------- END ---------");
		});
	});
});

// Start the HTTP server
httpServer.listen(3000,function(){
	console.log('The server is listening on port 3000');
});

//Define the handlers
var handlers = {};

//Sample handler
handlers.helloApi = function(data, callback){
	//callback a http status code, and a payload object
	callback(202,{'apiResponse':'Hello from the API'})
};

//Not found handlers
handlers.notFound = function(data, callback){
	callback(404,{'apiResponse':'Not Found'})
};

//Define a request router
var router = {
	'hello': handlers.helloApi
};