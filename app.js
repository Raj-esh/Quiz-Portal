var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var attempts = require('./routes/attempts');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('rajesh'));
app.use(session());
app.use(express.static(path.join(__dirname, 'public')));

app.locals.pretty = true;


app.get('/', function(req, res){
	res.redirect('/Quiz/SignIn');
});

app.get('/Quiz', function(req, res){
	res.redirect('/Quiz/SignIn');
});
/*
app.get('/Quiz/SignIn', function(req, res) {
	req.session.destroy(function(err) {
		// cannot access session here
		res.render('SignIn');
	})
	//res.render('SignIn');
});
*/
app.get('/Quiz/SignIn', function(req, res) {
	var username = req.headers['x-iisnode-auth_user'];
	username = username.substr(11);
	req.session.username = username;
	
	req.session.name='login';
	res.render('login',{username:username});
});

app.get('/Quiz/Welcome', function(req, res) {
	res.redirect('/Quiz');
});

app.post('/Quiz/Welcome', routes);

app.post('/Quiz/Ajax', routes);
app.post('/Quiz/QuizName', routes);
app.post('/Quiz/testsihadattempted', routes);

app.get('/Quiz/Logout', routes);
app.post('/Quiz/getdetails', users);
app.get('/Quiz/Quiz', routes);

app.get('/Quiz/finalScore',function(req, res){
	res.render('finalScore');
});

app.post('/Quiz/finalScore',routes);

app.get('/Quiz/setquiz',users);
app.post('/Quiz/setquiz',users);


/*app.get('/Quiz/index',function(req, res){
	res.render('index');
});*/


app.get('/Quiz/ScheduleQuiz',function(req, res){
	//if(req.session.name=='welcome'){
		//req.session.name ='admin';
		//console.log(req.session.name);
		res.render('ScheduleQuiz');
	//}
	//else
		//res.redirect('login');
});

app.post('/Quiz/Admin', users);

//app.get('/Quiz/ManageUser', users);

app.get('/Quiz/ManageUser', function(req, res){
	if(req.session.name=='welcome'){
		req.session.name ='Manage';
		res.render('ManageUser', {roleid:req.session.roleid});
	}
	else
		res.redirect('/Quiz/SignIn');
	
});

app.post('/Quiz/ManageUser', users);
app.post('/Quiz/addusertoquiz', users);
	
app.get('/Quiz/MyAttempts', attempts);
app.post('/Quiz/MyAttempts', attempts);

/*app.get('/Quiz/MyAttempts',function(req, res){
	res.render('attempts');
});*/

app.get('/Quiz/AccessExpired',function(req, res){
	res.render('AccessExpired');
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



app.listen(process.env.PORT);

module.exports = app;