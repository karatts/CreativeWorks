const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

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
app.use(bodyParser.urlencoded({extended: false}));
// express static setup
app.use(express.static(path.join(__dirname, 'public')));
// hbs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

require('./db');

mongoose.Promise = global.Promise;
const User = mongoose.model("User");
const Hobby = mongoose.model("Hobby");
const Comment = mongoose.model("Comment");
const Project = mongoose.model("Project");

//User.remove({}, function(err) { 
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
function createAHobby(name, description, icon){
	if(icon === ""){
		icon = "../images/No-image-available.jpg";
	}
	const hobby = new Hobby({
		name: name,
		description: description,
		icon: icon
	});
	Hobby.find({name: hobby.name}, (err, results, count) =>{
		if(results.length === 0){
			hobby.save((err) => {
				if(err){
					console.log("error with adding hobby:"+hobby.name);
					console.log(err);
				}
			});
		}
	});
}

//-----------------------------------------------------------
// General hobbies
function addGeneralHobbies(){
	createAHobby("Baking", "Baking is a type of cooking, a hobby devoured by many. Baking usually consists of using the oven, sometimes the stove. There's many different food items you can bake, such as cake, muffins, cookies, pies, and much more.", "../images/Hobbies/Baking.PNG");
	createAHobby("Trading Cards", "A trading card (or collectible card) is a small card, usually made out of paperboard or thick paper, which usually contains an image of a certain person, place or thing (fictional or real) and a short description of the picture, along with other text (attacks, statistics, or trivia).", "../images/Hobbies/CardCollecting.PNG");
	createAHobby("Cars", "Auto restoration is the process of rebuilding an automobile that is one of many stages of disrepair and bringing it back to the life and luster than it exhibited when it was new. From classic cars to modern automobiles, auto restoration covers the entire gambit of all vehicles that were ever manufactured.", "../images/Hobbies/Cars.PNG");
	createAHobby("Coin Collecting", "Coin collecting, also called numismatics, the systematic accumulation and study of coins, tokens, paper money, and objects of similar form and purpose. The collecting of coins is one of the oldest hobbies in the world.", "../images/Hobbies/CoinCollecting.PNG");
	createAHobby("Drawing", "You can create art anywhere as long as you have two things: pencils and paper. It's good to start at a young age because it gives you a chance to start using your brain and to be creative. Also, it is an opportunity to challenge thinking skills and develop learning skills.", "../images/Hobbies/Drawing.PNG");
	createAHobby("Drones", "A drone is, of course, a complicated piece of kit and so the users creativity is not only used, but their mechanical and software engineering skills also (if they choose to). In one relatively small package, the UAV brings together the creative and engineering world together in perfect harmony (cue the fan fares).", "../images/Hobbies/DroneBuilding.PNG");
	createAHobby("Embroidery", "It’s truly amazing what can be created with just a thread and needle. Embroidery has been around for centuries, and it continues to be a popular hobby among folks of all ages across the globe.", "../images/Hobbies/HandSewing.PNG");
	createAHobby("Jewelry Making", "As a hobby, jewelry design can be as expensive or as inexpensive as you want, depending on what kind of jewelry you intend to make – ranging from simple wire jewelry to intricate items with metals and precious stones. ... This could be gemstones, precious metals or other material you will work with.", "../images/Hobbies/JewelryMaking.PNG");
	createAHobby("Knitting", "If you’re thinking of taking up knitting, I invite you to go for it! Knitting is an amazingly addictive hobby. You’ll be stunned by what you are able to create with a skein of yarn and two needles.", "../images/Hobbies/Knitting.PNG");
	createAHobby("Painting", "Painting as a hobby can be relaxing in a stress filled life. It can be an escape into another world, a world of calm. Anyone can pick painting up as a hobby and enjoy it. One will not find themself dealing with boredom when taking up painting.", "../images/Hobbies/Painting.PNG");
	createAHobby("Pottery", "Ceramic art covers the art of pottery which is made by forming a clay body into objects of a special shape and then heating them to a certain temperature in a kiln to create a reaction that leads to their strength and hardening.", "../images/Hobbies/Pottery.PNG");
	createAHobby("Sewing", "Sewing is seen by many as a dying art but it can be a very relaxing and rewarding hobby, as you are able to create beautiful masterpieces and repair clothes. Sewing can be used to tailor clothes, create quilts, bags or just about anything. You can even learn to decorate and personalize a variety of different items.", "../images/Hobbies/Sewing.PNG");
}
//-----------------------------------------------------------

let start = true;

//home page
router.get('/', (req, res) => {
	console.log('in router.get /');
	const sessID = req.session.username;

	if(start){
		addGeneralHobbies();
		start = false;
		console.log('Adding initial hobbies');
	}

	if(sessID === undefined){
		Hobby.find({}, (err, results, count) => {
			if(err){
				console.log(err);
			}
			//send 5 random hobbies to the front page
			var fPH = 0;
			const frontPageHobbies = [];
			const intsChosen = [];
			const shortDes = [];
			while(fPH<5){
				const val = Math.floor(Math.random() * (results.length-1));
				if(!intsChosen.includes(val)){
					intsChosen[fPH] = val;
					frontPageHobbies[fPH] = results[val];
					fPH++;
				}
			}
			res.render('homepage', {noid: true, Hobby: frontPageHobbies});
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

//go to hobbies page!
router.get('/hobbies', (req, res) => {
	console.log("at router.get /hobbies");
	const sessID = req.session.username;

	Hobby.find({}, (err, results, count) => {
		if(err){
			console.log(err);
		}
		res.render('hobbies', {noid: (sessID === undefined), Hobby: results});
	});
});

//Wine slug --- WIP
router.get("/hobbies/:slug", (req, res) => {
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
app.listen(process.env.PORT || 8080);