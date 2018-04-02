require('./port');
var express = require('express');
var app = express();

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
const sqlite3 = require('sqlite3').verbose();

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
// will create the db if it does not exist
var db = new sqlite3.Database('db/database.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the database.');
});

// https://expressjs.com/en/starter/static-files.html
app.use(express.static('static-content'));


//login authentication here *FIX INVALID LOGIN
app.get('/login/', function (req, res) {
	var user = req.query.user;
	var password = req.query.password;
	let query = 'SELECT * from appuser WHERE id=? AND password=?;';
	db.get(query,[user,password],(err,row) => {
		var result ={};
		if (err) {
				res.status(404);
				result["error"] = err.message;
		} else if (!row){
			result["error"] = "invalid login";
		} else {
			result["user"] = row["id"];
			result["password"] = row["password"];
			result["status"] = "login";
		}
		res.status(200).json(result);
		console.log(result);
	});
	console.log('at Login.');
});

app.put('/register/', function (req, res) {
	var user = req.body.user;
	var password = req.body.password;
	var email = req.body.email;
	var gender = req.body.gender;
	var name = req.body.name;
	// Check if Username is in the SQL table already
	console.log(email);
	console.log(name);
	let query = 'SELECT * from appuser WHERE id=?;';
	db.get(query,[user],(err,row) => {
		var result ={};
		if (err) {
				res.status(404);
				result["error"] = err.message;
		} else if (!row){
			console.log("No error");
			// If there isn't a row with the same username then check email
			let query = 'SELECT * from appuser WHERE email=?;';
			db.get(query,[email],(err,row) => {
				if (err) {
						res.status(404);
						result["error"] = err.message;
				} else if (!row){
					// Now that both email and username have been chacked we can INSERT
					let query = 'INSERT INTO appuser(id, password, name, gender, email) VALUES (?,?,?,?,?);';
					db.run(query,[user, password, name, gender, email],function(err) {
						var result={};
						if (err) {
							res.status(409);
							result["error"] = err.message;
						} else {
							result["status"] = "Registered";
							console.log('Registered');
						}
					res.status(200).json(result);
					});
				} else {
					// After checking the email we send in the ting
					result["error"] = "Email";
					res.status(200).json(result);
					console.log(result);
				}
			});
		// If there is then send in as an error
		} else {
			result["error"] = "Username";
			res.status(200).json(result);
			console.log(result);
		}
	});
	console.log('at Login.');
});

app.post('/confirmprofile/', function (req,res){
	console.log("Reached confirmProfile");
	var oldid = req.body.oldid;
	var oldemail = req.body.oldemail;
	var user = req.body.user;
	var email = req.body.email;
	var password = req.body.password;
	var gender = req.body.gender;
	var name = req.body.name;
	console.log("email: "+email,"OldEmail: " + oldemail);
	var result = {};
	if(oldid != user || oldemail != email){
		let query = 'SELECT * from appuser WHERE id=?;';
		db.get(query,[user],(err,row) => {
			if (err) {
					//res.status(404);
					result["error"] = err.message;
			} else if (row && row.id!=oldid){
				console.log("user detected");
				result["error"] = "Username";
				res.status(200).json(result);
				return;
			} else {
				if (oldemail != email){
					console.log("email difference detected");
					let query = 'SELECT * from appuser WHERE email=?;';
					db.get(query,[email],(err,row) => {
						if (err) {
								//res.status(404);
								result['error'] = err.message;
						} else if (row){
							console.log("email detected");
							result['error'] = "Email";
							console.log("result: "+result);
							res.status(200).json(result);

							return;
						} else {
							//console.log("OldID: "+oldid,"OldEmail: " + oldemail, name, password);
							let data = [user, password, name, gender, email, oldid];
							console.log(data);
							let query = 'UPDATE appuser SET id = ?, password = ?, name = ?, gender = ?, email = ? WHERE id=?';
							db.run(query, data, function(err) {
								if(err){
									res.status(409);
									console.log(err);
								}
								else{
									console.log(`Row(s) updated: ${this.changes}`);
									result["status"] = "success";
									console.log("result: "+result);
									res.status(200).json(result);
									return;
								}
							});
						}

					});
				}
			}
		});
	} else {
		console.log("Else statement reached");
		let data = [user, password, name, gender, email, oldid];
		console.log(data);
		let query = 'UPDATE appuser SET id = ?, password = ?, name = ?, gender = ?, email = ? WHERE id=?';
		db.run(query, data, function(err) {
			if(err){
				res.status(409);
				console.log(err);
			}
			else{
				console.log(`Row(s) updated: ${this.changes}`);
				result["status"] = "success";
				res.status(200).json(result);
				return;
			}
		});
	}



});

app.put('/scores/:user/:score', function (req,res) {
	var score = req.params.score;
	var user = req.params.user;
	let query = 'INSERT INTO scores(id, score) VALUES (?, ?)';
	db.run(query,[user,score],function(err) {
		var result={};
		if (err) {
			res.status(409);
			result["error"] = err.message;
		} else {
			result["status"] = "scores";
			result["user"] = "user";
			result["score"] = "score";
			console.log(score, user);
			console.log('scores are inserted');
		}
	res.status(200).json(result);
	});

});


app.get('/highscores/', function(req, res) {
	let query = 'SELECT * from scores ORDER BY score DESC LIMIT 10';
	db.all(query,[],(err,rows) => {
		var result = [];
		if (err){
			res.status(401);
		}
		rows.forEach((row) => {
			result.push(row);
		});
		res.status(200).json(result);
	});

});

app.get('/viewprofile/', function(req, res) {
	var user = req.query.user;
	let query = 'SELECT * from appuser WHERE id=?;';
	db.get(query,[user],(err,row) => {
		var result ={};
		if (err) {
				res.status(404);
				result["error"] = err.message;
		} else if (!row){
			result["error"] = "WTF??";
		} else {
			result["user"] = row["id"];
			result["name"] = row["name"];
			result["gender"] = row["gender"];
			result["email"] = row["email"];
		}
		res.status(200).json(result);
		console.log(result);
	});
	console.log('at Login.');

});

app.listen(port, function () {
  	console.log('Example app listening on port '+ port);
});

// db.close();
