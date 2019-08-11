
const mongoose = require('mongoose'),
      URLSlugs = require('mongoose-url-slugs');

// define the data in our collection
const User = new mongoose.Schema({
  username: {type: String, unique: true},
  fname: String,
  lname: String,
  password: String,
  joinDate: Date,
  hobbies: [String],
  Friends: [String],
  project: [Projects]
});

const Comment = new mongoose.Schema({
	username: String,
	comment: String,
    timePosted: Date
});

const Projects = new mongoose.Schema({
    username: String,
    title: String,
	image: String,
    blog: String,
    comments: [Comment],
    timePosted: Date,
    hobbyCategory: String,
    id: Number
});

const Hobbies = new mongoose.Schema({
    name: String,
    description: String,
    icon: String
});

Projects.plugin(URLSlugs('username title id'));

mongoose.model('User', User);
mongoose.model('Comment', Comment);
mongoose.model('Projects', Projects);
mongoose.model('Hobbies', Hobbies);


// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 	var fs = require('fs');
 	var path = require('path');
 	var fn = path.join(__dirname, 'config.json');
 	var data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // connection string appropriately!
 	var conf = JSON.parse(data);
 	var dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 	dbconf = 'mongodb://localhost/creativeworks';
}

mongoose.connect(dbconf, () =>{
	 //mongoose.connection.db.dropDatabase();
});