
const mongoose = require('mongoose'),
      URLSlugs = require('mongoose-url-slugs');

// define the data in our collection
const Comment = new mongoose.Schema({
	username: String,
	comment: String,
    timePosted: Date
});

const Project = new mongoose.Schema({
    username: String,
    title: String,
	image: String,
    blog: String,
    comments: [Comment],
    timePosted: Date,
    hobbyCategory: String,
    id: {type: Number, unique: true}
});

const Hobby = new mongoose.Schema({
    name: {type: String, unique: true},
    description: String,
    icon: String
});

const User = new mongoose.Schema({
  username: {type: String, unique: true},
  fname: String,
  lname: String,
  password: String,
  joinDate: Date,
  bio: String,
  hobbies: [Hobby],
  friends: [String],
  projects: [Project]
});

Project.plugin(URLSlugs('id'));
User.plugin(URLSlugs('username'));
Hobby.plugin(URLSlugs('name'));

mongoose.model('User', User);
mongoose.model('Comment', Comment);
mongoose.model('Project', Project);
mongoose.model('Hobby', Hobby);


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