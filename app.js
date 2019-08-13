const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
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
			console.log(results);
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
		User.find({username: sessID2}, (err, result1, count) => {
			res.render('homepage',({id: sessID2}));
		});
	}
});

//register form
//get - to display the form
router.get('/signup', (req, res) => {
	console.log('in router.get /signup');
	const sessID = req.session.username;
	if(sessID === undefined){
		res.render('signup', {});
	}
	else{
		res.render('homepage', {id: sessID});
	}
});
//post - to process the form input
router.post('/signup', (req, res) => {
	console.log('in router.post /signup');
	const testPW = req.body.password;
	let testUN = req.body.username;
	User.findOne({username: testUN}, (err, result, count) => {
		const pwerr = (testPW.length < 8);
		let unerr = false;
		if(result !== null){
			unerr = true;
		}
		if(pwerr || unerr){
			res.render('signup', {error: true, pwerror: pwerr, unerror: unerr});
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

//go to hobbies page!
router.get('/hobbies', (req, res) => {
	console.log("at router.get /hobbies");
	const sessID = req.session.username;

	Hobby.find({}, (err, results, count) => {
		if(err){
			console.log(err);
		}
		if(sessID === undefined){
			res.render('hobbies', {noid: true, Hobby: results});
		}
		else{
			res.render('hobbies', {id: sessID, Hobby: results});
		}
	});
});

//Hobbies slug --- WIP
router.get("/hobbies/:slug", (req, res) => {
	let sessID = req.session.username;
	console.log("at router.get /hobbies/slug");
	const slug = req.params.slug;
	Hobby.find({slug: slug}, (err, result, count) => {
		if(err){
			console.log("Error at the hobby slug page");
		}
		else{
			console.log(result);
			if(result[0] === undefined){
				//no such hobby page redirect to hobbies page
				Hobby.find({}, (err, results, count) => {
					if(err){
						console.log(err);
					}
					if(sessID === undefined){
						res.render('404', {noid: true});
					}
					else{
						res.render('404', {id: sessID});
					}
				});
			}
			else{
				const hobbs = [];
				const proj = [];


				if(sessID === undefined){
					res.render('hobbiesInd', {noid: true, Hobby: result[0], Projects: proj});
				}
				else{
					sessID = sessID.toLowerCase();
					res.render('hobbiesInd', {id: sessID, Hobby: result[0], Projects: proj});
				}
			}
		}
	});
});

//--------------------------------

//listen on port 3000
app.listen(process.env.PORT || 8080);