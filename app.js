/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var busboy = require('connect-busboy');
var hello = require('./routes/hello');
var api = require('./routes/api');

var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('MongoDB: connected.');	
});

var vcardSchema = mongoose.Schema({
    Name: String,
    Phone: String,
    Email: String,
    Address: String,
    Age: Number
});

var postSchema = mongoose.Schema({
    uid: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    title: String,
    content: String
});

var mapAgeSchema = new mongoose.Schema({
    value: {type: Number, defult: 0}
});

app.db = {
	model: {
		User: mongoose.model('user', vcardSchema),
		Post: mongoose.model('post', postSchema),
    /* MapReduce */
    MapAge: mongoose.model('map_age', mapAgeSchema)
	}
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(busboy({ immediate: true }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', require('./routes/index').index);
app.get('/post', require('./routes/index').index);

// REST API
app.post('/1/user', api.create);
app.get('/1/user', api.read);
app.get('/1/user/:id', api.readOneByUserId);
app.put('/1/user/:id', api.updateOneByUserId);
app.put('/1/user/:nickname', api.update);
app.delete('/1/user/:nickname', api.delete);

app.get('/1/user/age/:age', api.readByAge);
app.get('/1/user/age/:from/:to', api.readByAgeRange);

app.get('/1/user/map/age', api.mapByAge);


// Profile
app.post('/1/user/:nickname/:type', api.upload);

app.post('/1/post', api.createPost);
app.get('/1/post', api.readPost);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
