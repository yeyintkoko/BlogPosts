/** main file */
var express = require('express');
var bodyParser = require('body-parser')

var app = express();

/** Parse application/x-www-form-urlencoded */ 
app.use(bodyParser.urlencoded({ extended: false }))
/** Parse application/json  */
app.use(bodyParser.json())
/** Set public route to "public" folder */
app.use(express.static('public'));
/** Allow all clients access */
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});


/** Set root directory */
app.set('root_dir', __dirname + '/');


/** Blog Routes */
var blogs = require('./server/blogs');
app.use('/', blogs);

/** Run the server */
var server = app.listen(8080, 'localhost', function(){
  var address = server.address();
  console.log('Blog server is running at '+ address.address + ' on port '+ address.port)
})
