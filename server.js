import express from 'express';
import * as path from 'node:path';
import cookieParser from 'cookie-parser';

// console.log(cookieParser)

const app = express();
const PORT = 5000;


app.set('views', path.join(path.resolve(), 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser())
app.use(express.static(path.join(path.resolve(), 'public')));

const database = [];

function isLoggedIn(username){
	if (username && database.find(el => el.username === username)){ 
		console.log(`GET User already logged in `);
		return true;
	}
	return false;
}

/*
	login or register and not logged in -> proceed
	login or register and logged in -> redirect to home
	!(login or regiter) and logged in -> proceed
	!(login or register) and !loggedin ->redirect to login
*/

function checkLogin(req, res, next){
	const {username} = req.cookies;
	const isAuthPath = (req.url === '/login' || req.url === '/register');

	if (!isAuthPath && !isLoggedIn(username)){
		console.log(`GET ${req.url} | User not logged in, redireting to login`);
		res.redirect('/login');
		return;
	}
	req.username = username;
	next();
}

app.use(checkLogin);

app.get('/', function(req, res){
	res.render('index', {username : req.username});
});

app.get('/register', function(req, res){
	res.status(200)
		.render('register');

});

app.post('/register', function(req,res){

	const {username} = req.body;
	if (username){
		database.push({username});
		res.status(200);
		res.set('Set-Cookie', `username=${username}`);
		res.redirect('/');
		return;
	}
	res.status(403).end();
	console.log(database);
});


app.route('/login')
	.get(function(req, res){
		res.render('login');
	})
	.post(function(req, res){
		const {username} = req.body;

		if (database.find(user => user.username === username)){
			//user is present in database
			res.set('Set-Cookie', `username=${username}`);
			res.redirect('/');
			return;
		}
		//else user is not registered
		res.redirect('/register');
	});


app.route('/logout')
	.get(function(req, res){
		const username = req.username;
		res.set('Set-Cookie', 'username=; Expires='+new Date().toUTCString());
		res.redirect('/login');
	});


app.listen(PORT, ()=>{
	console.log(`Server Listening on port ${PORT}`);
});

