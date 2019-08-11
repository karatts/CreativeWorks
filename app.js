const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
//const Twitter = require('twitter');

//twitter
//var fs = require('fs');
//var fn = path.join(__dirname, 'twitter.json');
//var data = fs.readFileSync(fn);
//var conf = JSON.parse(data);
//var client = new Twitter({
//  consumer_key: conf.key,
//  consumer_secret: conf.secret,
//  access_token_key: conf.tokenkey,
//  access_token_secret: conf.tokensecret 
//});

//express
const app = express();
const router = express.Router();
//express-session
const sessionOptions = {
	secret: 'this is a random secret',
	resave: true,
	saveUninitialized: true
};
app.use(session(sessionOptions));
//body-parser
app.use(bodyParser.urlencoded({ extended: false}));
// express static setup
app.use(express.static(path.join(__dirname, 'public')));
// hbs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

require('./db');

mongoose.Promise = global.Promise;
const User = mongoose.model("User");
const Wine = mongoose.model("Wine");
const Comment = mongoose.model("Comment");

//User.remove({}, function(err) { 
//   console.log('collection removed') 
//});

//Wine.remove({}, function(err) { 
//   console.log('collection removed') 
//});

app.use('/', router);
//-----------------------------------------------------------
//Functions
function capFirst(str) {
    return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '); 
}
function getNum(first, last){
	return Math.floor(Math.random() * ((last) - first + 1) + first);
}
function checkWines(num, addWine, numArray, wineArray){
	if(numArray.includes(num) === false){
		wineArray.push(addWine);
		numArray.push(num);
	}
}
function findAndAddWine(object2find, winePref1, length, res, sessID){
	Wine.find(object2find, (err, result, count) => {
		if(err){
			console.log(err);
		}
		else{
			let addedNums = [];
			if(result.length < length){
				result.forEach((ele) => {
					winePref1.push(ele);
				});
				const spliceNum = (length - result.length)+1;
				let winePref2 = winePref1.splice(0,spliceNum);

				if(winePref1.length < winePref2.length){
					const temp = winePref1;
					winePref1 = winePref2;
					winePref2 = temp;
				}

				res.render('homepage', {id: true, session: sessID, wine1: winePref1, wine2: winePref2});
			}
			else{
				while(addedNums.length < length){
					let num = getNum(0, (result.length - 1));
					checkWines(num, result[num], addedNums, winePref1);
				}
				var count = 0;
				let newWine1 = winePref1.filter(function(ele){
					if(count < 3){
						count = count + 1;
						return ele;
					}
				});
				count = 0;
				let newWine2 = winePref1.filter(function(ele){
					if(count >= 3 && count < 6){
						count = count + 1;
						return ele;
					}
					else{
						count = count + 1;
					}
				});
				if(newWine1.length < newWine2.length){
					const temp = newWine1;
					newWine1 = newWine2;
					newWine2 = temp;
				}
				res.render('homepage', {id: true, session: sessID, wine1: newWine1, wine2: newWine2});
			}
		}
	});
}

function findAndAddWine2(object2find, winePref1, callback){
	var p3 = Promise.resolve(Wine.find(object2find, (err, result, count) => {
			if(err){
				console.log(err);
			}
			else{
				result.forEach((ele) => {
					//console.log(winePref1);
					//console.log(winePref1.includes(ele));
					if(winePref1.includes(ele) === false){
						winePref1.push(ele);
					}
				});
			}
		}));
	Promise.all([p3]).then(values => {
		//console.log(values[0]);
		callback(values[0]);
	});
}

/*function findAndAddWine3(object2find, winePref1, sweetness, res, callback){
	var p3 = Promise.resolve(Wine.find(object2find, (err, result, count) => {
			if(err){
				console.log(err);
			}
			else{
				result.forEach((ele) => {
					if(winePref1.includes(ele) !== true){
						winePref1.push(ele);
					}
				});
				//console.log(winePref1);
			}
		}));
	Promise.all([p3]).then(values => {
		console.log(values[0]);
		//console.log(sweetness);
		callback(object2find.type, sweetness, values[0], res);
	});
}*/

function createAWine(brand, name, year, type, sweetness, image, rating, numrating, comments){
	if(image === ""){
		image = "../images/No-image-available.jpg";
	}
	const wine = new Wine({
		brand: brand,
		name: name,
		year: year,
		type: type,
		sweetness: sweetness,
		image: image,
		avgrating: rating,
		numratings: numrating,
		comments: comments,
	});
	Wine.find({brand: wine.brand, name: wine.name, year: wine.year}, (err, results, count) =>{
		if(results.length === 0){
			wine.save((err) => {
				//console.log("in here");
				if(err){
					console.log(err);
				}
			});
		}
	});
}

//-----------------------------------------------------------
// Starter wines
function addStarterWines(){
	createAWine("Mascota Vineyards", "Unanime", "2013", "Red Wine", ["Dry", "Semi-Sweet"], "http://www.totalwine.com/media/sys_master/twmmedia/hbd/h41/9701912936478.png", 93, 2, [{username: "WineCrazy21", comment: "I loved this wine! It was so great that I didn't even want to share it with my friends!", rating: 97}, {username: "Fran", comment: "Good recommendation and affordable. Would buy again.", rating: 89}]);
	createAWine("Chateau Dalem", "Fronsac", "2014", "Red Wine", ["Dry", "Semi-Sweet"], "http://www.totalwine.com/media/sys_master/twmmedia/h22/hf4/9814718349342.png", 91, 3, [{username: "Drinks4Gran", comment: "GRANNIES 4 DRINKS CLUB LOVE THIS", rating: 85}, {username: "CatLady", comment: "Yum Yum!", rating: 98}, {username: "Gerod89", comment: "great pairing with fish", rating: 90}]);
	createAWine("Dr Heidemanns", "Riesling Qba", "2015", "White Wine", ["Semi-Sweet", "Sweet"], "http://www.totalwine.com/media/sys_master/twmmedia/h38/hdd/8811158011934.png", 88, 1, [{username: "banana4scale", comment: "Smoky flavor and the bottle could probably fit 5 bananas", rating: 88}]);
	createAWine("Renieri", "Invetro", "2013", "Red Wine", ["Dry"], "http://www.totalwine.com/media/sys_master/twmmedia/h94/h13/8803381018654.png", 91, 2, [{username: "Clementine", comment: "i thought it was good. tbh, probs would rec to my friends.", rating: 89}, {username: "Cecile219", comment: "Fantastic!", rating: 93}]);
	createAWine("Olema", "Chardonnay Sonoma", "2014", "White Wine", ["Dry", "Semi-Sweet"], "http://www.totalwine.com/media/sys_master/twmmedia/h94/h13/8803381018654.png", 91, 1, [{username: "Wineacc", comment: "Great wine for a good time! All my guests loved it.", rating: 91}]);
}
//-----------------------------------------------------------

let start = true;

//home page
router.get('/', (req, res) => {
	console.log('in router.get /');
	const sessID = req.session.username;

	if(start){
		addStarterWines();
		start = false;
		console.log('Adding startup wines');
	}

	if(sessID === undefined){
		let winehp = [];
		Wine.find({}, (err, result, count) => {
			//console.log(result);
			if(err){
				console.log(err);
			}
			else{
				let numAdded = [];
				if(result.length < 5){
					return res.redirect('/');
					next();
				}
				else{
					while(numAdded.length < 5){	
						let num = getNum(0, (result.length-1));
						checkWines(num, result[num], numAdded, winehp);
					};
				}
			}
			var count = 0;
			const newWine4 = winehp.filter(function(ele){
				if(count < 3){
					count = count + 1;
					return ele;
				}
			});
			count = 0;
			const newWine3 = winehp.filter(function(ele){
				if(count >= 3 && count < 5){
					count = count + 1;
					return ele;
				}
				else{
					count = count + 1;
				}
			});
			res.render('homepage', {noid: true, wine1: newWine4, wine2: newWine3});
			//if(result.length === 5){
			//	res.redirect('/');
			//}
		});
	}
	else{
		const sessID2 = sessID.toLowerCase();
		const winePref = [];
		User.find({username: sessID2}, (err, result1, count) => {
			//find user preferences
			const typeLike = result1[0].type;
			const sweetnessLen = (result1[0].sweetness).length;
			if(typeLike.length === 1){ //if there is one type of wine preference
				//if there is no sweetness preference
				if(sweetnessLen === 0){
					findAndAddWine({type: typeLike}, winePref, 6, res, sessID);
				}
				//if there is a sweetness preference
				else{
					//pick one random sweetness preference
					let num2 = getNum(0, (sweetnessLen - 1));
					const sweetPref = (result1[0].sweetness)[num2];
					findAndAddWine({type: typeLike, sweetness: sweetPref}, winePref, 6, res, sessID);
				}
			}
			else{ //if they like none or both of the types
				//if they have no preferences, display random from all wines
				if(sweetnessLen === 0){
					findAndAddWine({}, winePref, 6, res, sessID);
				}
				else{
				//if they have a sweetness preference, pick one and display those
					let num2 = getNum(0, (sweetnessLen - 1));
					const sweetPref = (result1[0].sweetness)[num2];
					findAndAddWine({sweetness: sweetPref}, winePref, 6, res, sessID);
				}
			}
		});
	}
});

//register form
//get - to display the form
router.get('/register', (req, res) => {
	console.log('in router.get /register');
	const sessID = req.session.username;
	if(sessID === undefined){
		res.render('register', {});
	}
	else{
		res.render('loggedin', {id: sessID});
	}
});
//post - to process the form input
router.post('/register', (req, res) => {
	console.log('in router.post /register');
	const testPW = req.body.password;
	let testUN = req.body.username;
	User.findOne({username: testUN}, (err, result, count) => {
		const pwerr = (testPW.length < 8);
		let unerr = false;
		if(result !== null){
			unerr = true;
		}
		if(pwerr || unerr){
			res.render('register', {error: true, pwerror: pwerr, unerror: unerr});
		}
		else{
			bcrypt.hash(testPW, 10, function(err, hash) {
				testUN = testUN.toLowerCase();
				const usr = new User({
					username: testUN,
					fname: req.body.fname,
					lname: req.body.lname,
					password: hash,
					type: req.body.type,
					sweetness: req.body.sweetness,
				});
				usr.save((err) => {
					if(err){
						console.log(err);
					}else{
						//Start an authenticated Session
						req.session.regenerate((err) => {
							if(!err){
								req.session.username = usr.username;
								res.redirect('/');
							}
							else{
								console.log(err);
							}
						});
					}
				});
			});
		}
	});
});

//login form
router.get('/login', (req, res) => {
	console.log('in app.get /login');
	const sessID = req.session.username;
	if(sessID === undefined){
		res.render('login', {});
	}
	else{
		res.render('loggedin', {id: sessID});
	}
});
router.post('/login', (req, res) => {
	let name = req.body.username;
	name = name.toLowerCase();
	User.findOne({username: name}, (err, result, count) => {
		const userlog = {unerror: false, pwerror: false};
		if(result && !err){
			//test password now
			bcrypt.compare(req.body.password, result.password, (err, result) =>{
				if(!result){
					console.log('Invalid password');
					userlog.pwerror = true;
					res.render('login', userlog);
				}
				else{
					//start an authenticated session
					req.session.regenerate((err) => {
						if(!err){
							req.session.username = req.body.username;
							res.redirect('/');
						}
						else{
							console.log(err);
						}
					});
				}
			});
		}
		else{
			userlog.unerror = true;
			res.render('login', userlog);
		}
	});
});

//add a wine to the database!
router.get('/addawine', (req, res) => {
	console.log("at router.get /addawine");
	const sessID = req.session.username;
	if(sessID === undefined){
		//not logged in
		res.redirect('/login');
	}
	else{
		//logged in
		res.render('addawine', {start: true});
	}
});

router.post('/addawine', (req, res) => {
	console.log("at router.post /addawine");
	let brand = req.body.brand;
	brand = capFirst(brand);
	let name = req.body.name;
	name = capFirst(name);

	Wine.find({brand: brand, name: name, year: req.body.year}, (err, result, count) =>{
		if(result.length !== 0){
			//don't add the wine
			res.render('addawine', {exists: true, wine: result[0]});
		}
		else{
			let image = "";
			if(req.body.image === ""){
				image = "../images/No-image-available.jpg";
			}
			else{
				image = req.body.image;
			}
			const newWine = new Wine({
				brand: brand,
				name: name,
				year: req.body.year,
				type: req.body.type,
				sweetness: req.body.sweetness,
				image: image,
				comments: [],
				avgrating: 0,
				numratings: 0,
			});
			//add the wine
			newWine.save((err) =>{
				if(err){
					console.log("Error saving new wine...");
				}
				else{
					let addString = req.session.username + " added a " + newWine.year + " " + newWine.name + " from " + newWine.brand + " to the DB! #WineNotDB";
					client.post('statuses/update', {status: addString},  function(error, tweet, response) {
  						if(error) throw error;
				  		//console.log(tweet);  // Tweet body. 
				  		//console.log(response);  // Raw response object. 
					});

					res.render('addawine', {success: true, wine: newWine});
				}
			});
		}
	});
});

//Wine slug --- WIP
router.get("/wine/:slug", (req, res) => {
	let sessID = req.session.username;
	console.log("at router.get /wine/slug");
	const slug = req.params.slug;
	Wine.find({slug: slug}, (err, result, count) => {
		if(err){
			console.log("Error at the wine slug page");
		}
		else{
			console.log(result);
			if(result[0] === undefined){
				res.render('notvalid', {});
			}
			else{
				if(sessID === undefined){
					res.render('winepage', {wine: result[0], notlogged: true});
				}
				else{
					sessID = sessID.toLowerCase();
					res.render('winepage', {wine: result[0], loggedin: true});
				}
			}
		}
	});
});
router.post("/wine/:slug", (req, res) => {
	console.log('at router.post /wine/slug');
	const sessID = req.session.username;
	var wine = "";
	Wine.findOne({slug: req.params.slug}, (err, result, count) => {
		if(err){
			console.log(err);
		}
		if(result !== undefined){
			wine = result;
			//check to make sure comment is not equal to default text
			let comment = req.body.comment;
			//console.log(comment);
			if(comment !== undefined){
				const comms = new Comment({
					username: sessID,
					comment: comment,
					rating: req.body.rating,
				});
				result.comments.push(comms);
				//console.log(result);
				comms.save((err) => {
					Comment.find({}, (err, results, count) => {
						const currRating = result.avgrating;
						//console.log(currRating);
						const newTot = parseInt(currRating) + parseInt(req.body.rating);
						//console.log(newTot);
						const newTotNums = result.numratings + 1;
						//console.log(newTotNums);
						const newRating = newTot / newTotNums;
						//console.log(newRating);
						result.avgrating = Math.trunc(newRating);
						result.numratings = newTotNums;
						result.save((err) => {
							if(err){
								console.log(err);
							}
							else{
								res.render('winepage', {wine: result, loggedin: true});
							}
						});
					});
				});
			}
			else{
				res.render('winepage', {wine: result, loggedin: true, invalidComment: true});
			}
		}
	});
});

//ALL THE WINE! (WORK ON FORMATTING THE ROWS IF THERE'S TIME)
router.get('/allthewine', (req, res) => {
	console.log('in router.get /allthewine');
	let sessID = req.session.username;
	if(sessID === undefined){
		res.redirect('/login');
	}
	else{
		Wine.find({}, (err, results, count) => {
			if(err){
				console.log(err);
			}

			const redWine = results.filter((ele) => {
				if(ele.type[0] === "Red Wine"){
					return ele;
				}
			});

			const whiteWine = results.filter((ele) => {
				if(ele.type[0] === "White Wine"){
					return ele;
				}
			});
			res.render('allthewine', {redWine: redWine, whiteWine: whiteWine});
		});
	}
});

/*function addThis(typePref, sweetness, array2, res){
	if(sweetness.length !== 0){
		let pref = sweetness.shift();
			//console.log(array2);
			findAndAddWine3({type: typePref, sweetness: pref}, array2, sweetness, addThis);
	}
	else{
		console.log(array2);
		res.render('suggested', {wine: array2});
	}
}*/

router.get('/suggested', (req, res) => {
	console.log('in router.get /suggested');
	let sessID = req.session.username;
	if(sessID === undefined){
		res.redirect('/login');
	}
	else{
		sessID = sessID.toLowerCase();
		User.findOne({username: sessID}, (err, result, count) => {
			if(result.type.length === 1){
				//if there's only one type preference
				if(result.sweetness.length === 0){
					//if there's no sweetness preference
					findAndAddWine2({type: result.type[0]}, [], function renderThis(array2){
						res.render('suggested', {wine: array2});
					});
				}
				else{
					//there's one or more sweetness preferences
					/*var array = [];
					let sweetness = result.sweetness.slice();
					//console.log(sweetness);
					while(sweetness.length !== 0){
						let pref = sweetness.shift();
						findAndAddWine3({type: result.type[0], sweetness: pref}, array, sweetness, res, addThis(result.type[0], sweetness, array, res));
					}*/
					findAndAddWine2({type: result.type[0], sweetness: result.sweetness}, [], function renderThis(array2){
						res.render('suggested', {wine: array2});
					});
				}
			}
			else{
				//if there's more than one type preference, just ignore it.
				if(result.sweetness.length !== 0){
					findAndAddWine2({sweetness: result.sweetness}, [], function renderThis(array2){
						res.render('suggested', {wine: array2});
					});
				}
				else{
					//three's no preferences
					findAndAddWine2({}, [], function renderThis(array2){
						res.render('suggested', {wine: array2});
					});
				}

			}
		});
	}
});

//search page --- WIP
router.get('/search', (req, res) => {
	console.log('in router.get /search');
	let sessID = req.session.username;
	if(sessID === undefined){
		//res.render('search', {notlogged: true});
		res.render('notyet', {});
	}
	else{
		sessID = sessID.toLowerCase();
		User.findOne({username: sessID}, (err, result, count) =>{
			if(result && !err){
				//res.render('search', {loggedin: true});
				res.render('notyet', {});
			}
			else{
				console.log(err);
			}
		});
	}
});
router.post('/search', (req, res) => {
	res.render('notyet', {});
});

//User saved wine lists --- WIP
router.get('/favorites' , (req, res) => {
	const sessID = req.session.username;
	if(sessID === undefined){
		res.redirect('/login');
	}
	else{
		res.render('notyet', {});
	}
});
router.get('/try_these' , (req, res) => {
	const sessID = req.session.username;
	if(sessID === undefined){
		res.redirect('/login');
	}
	else{
		res.render('notyet', {});
	}
});
router.get('/never_again' , (req, res) => {
	const sessID = req.session.username;
	if(sessID === undefined){
		res.redirect('/login');
	}
	else{
		res.render('notyet', {});
	}
});

//preferences
router.get('/preferences', (req, res) => {
	let sessID = req.session.username;
	if(sessID === undefined){
		res.redirect('/login');
	}
	else{
		sessID = sessID.toLowerCase();
		User.find({username: sessID}, (err, results, count) =>{
			if(results && !err){
				//console.log(results[0]);
				res.render('preferences', results[0]);
			}
			else{
				console.log('error in app.get /preferences');
				console.log(err);
			}
		});
	}
});
router.post('/preferences', (req, res) => {
	let sessID = req.session.username;
	sessID = sessID.toLowerCase();
	//console.log(sessID);
	//console.log(req.body.type);
	//console.log(req.body.sweetness);
	User.find({username: sessID}, (err, results, count) => {
		results[0].type = req.body.type;
		results[0].sweetness = req.body.sweetness;
		results[0].save((err) => {
			if(err){
				console.log(err);
			}
			else{
				//console.log(results[0]);
				res.render('preferences', results[0]);
			}
		})
	});
});

//classification image
app.get('/classifications', (req, res) => {
	res.sendFile(path.join(__dirname, "public/images", "sweetness.png"));
});

//logout page
router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if(err){
			console.log('There was a problem logging out!');
		}
		else{
			res.redirect('/');
		}
	});
});

//--------------------------------

//listen on port 3000
app.listen(process.env.PORT || 3000);