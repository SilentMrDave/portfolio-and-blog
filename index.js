var express = require('express');
var mysql = require('mysql');
var md5 = require('md5');
var parser = require('body-parser');
var app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(parser.urlencoded({
  extended: true
}));

const { Pool, Client } = require('pg')

const pool = new Pool(
{
  user: 'postgres',
  host: 'localhost',
  database: 'post',
  password: 'n3tw0rk',
  port: 5432,
});

const client = new Client(
{
  user: 'postgres',
  host: 'localhost',
  database: 'post',
  password: 'n3tw0rk',
  port: 5432,
});

client.connect();

app.get('/', function(req, res)
{
	res.render("home");
});

app.get('/posts', function(req, res)
{
	pool.query('SELECT * from posts', (err, pres) => 
	{
	  res.render('posts', {posts: pres.rows});
	})
});

app.get('/users', function(req, res)
{
	pool.query('SELECT * from users', (err, pres) => 
	{
		res.render('users', {data: pres.rows});
	})
});

app.post('/createuser', function(req, res)
{
	var username = req.body.username;
	var password = md5(req.body.password);
	var email = req.body.email;
	
	if (username != "" && password != "" && email != "")
	{
		pool.query(`insert into users (username, password, email) values ('${username}', '${password}', '${email}')`, (err, pres) => 
		{
			res.redirect('userform?submitted=true');
		})
	}
	else
	{		
		res.redirect('userform?submitted=false');
	}
});

app.post('/createpost', function(req, res)
{
	var author = req.body.author;
	var title = req.body.title;
	var content = req.body.content;
	
	if (author != "" && title != "" && content != "")
	{
		pool.query(`insert into posts (author, title, content) values ('${author}', '${title}', '${content}')`, (err, pres) => 
		{
			console.log(err);
			res.redirect('submitpost?submitted=true');
		})
	}
	else
	{		
		res.redirect('submitpost?submitted=false');
	}
});

app.get('/userform', function(req, res)
{
	var passedVariable = req.query.submitted;
	res.render('userform', {submitted: passedVariable});
});

app.get('/submitpost', function(req, res)
{
	var passedVariable = req.query.submitted;
	res.render('submitpost', {submitted: passedVariable});
});

app.listen(1337, function()
{
	console.log("App is listening on port 1337");
});

process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) 
{
    if (options.cleanup) console.log('Shutting Down');
    if (err) console.log(err.stack);
	pool.end();
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));