/*

**/
var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
 

/*
Media Elements
**/
var VideoMetadata = new Schema({
			 author				: String,
       institution	: String,
       title				: String,
       category			: String,
       abstract			: String,
       length				: String,
       date					: String,
       weight				: Number,
       source				: String
		});
//mongoose.model( 'VideoMetadata', VideoMetadata );


//
var Videos = new Schema({
		video		: String,
		id				: String,
		metadata 		: [{
			 author				: String,
       institution	: String,
       title				: String,
       category			: String,
       tags					: Array,
       abstract			: String,
       length				: String,
       date					: String,
       weight				: Number,
       thumbnail 		: String,
       source				: String
		}],
		 
	/*	toc					: [{
        label				: String,
        number			: Number,
        start				: Number,
        _comment		: String,
        date				: String,
        note				: String
    }],*/
    toc			: [Schema.Types.Mixed],
		tags				: [Schema.Types.Mixed],
		hyperlinks			: [Schema.Types.Mixed],
		highlight		: [Schema.Types.Mixed],
		slides			: [Schema.Types.Mixed],
		comments		: [Schema.Types.Mixed],
		assessment				: [Schema.Types.Mixed],
		assessmentfillin		: [Schema.Types.Mixed],
		assessmentwriting		: [Schema.Types.Mixed],
		progress		: String,
    updated_at 	: Date
});
mongoose.model( 'Videos', Videos );


// 
var Images = new Schema({
		title				: String,
		url 				: String,
		tags				: [Schema.Types.Mixed],
		scene					: String,
    updated_at 	: Date
});
mongoose.model( 'Images', Images );


/*
User management
**/
var Users = new Schema({
	id: Number,
  username: String,
  password: String,
  email: String,
  name: String,
  firstname: String,
  hs: String,
  role: String,
  status: {
  	online: Boolean,
  	location: String,
  	updated_at: Date
  },
  icon: String,
  trace: Boolean,
  experimental: Boolean,
  groups: [Schema.Types.Mixed],
  updated_at 	: Date
});
mongoose.model( 'Users', Users );



// 
var Groups = new Schema({
	id: String,
	description: String,
	persons: Number,
	hs: String, 
	videos : Array,
	ep_group_pad_id: String, 
	ep_group_id: String,
  updated_at 	: Date
});
mongoose.model( 'Groups', Groups );




/*
SCRIPTS
**/

// old schema
var Scripts = new Schema({
	current_phase : Number,
  slides : Boolean,
  phases : [Schema.Types.Mixed],
  updated_at 	: Date
});
mongoose.model( 'Scripts', Scripts );




// minlength: 5
var ScriptTemplate = new Schema({
	title : { type: String, minlength: 3 },
	description : String,
	tags : [String], 
	created_at 	: { type: Date },
	updated_at 	: { type: Date, default: Date.now },
	
  slides : Boolean,

  phases: [
    		{ 
    			title: String,
    			instruction: String,
    			seq : Number,
    			groupindex: Number, 
    			widgets: [ 
    				{ name: [String], widget_options: [Schema.Types.Mixed], accordion: [Boolean], annotate:[Boolean] }
    			]	
    		}
    	]
  
});
mongoose.model( 'ScriptTemplate', Scripts );


var ScriptSession = new Schema( {
		// some meta data
		title : { type: String, minlength: 3 },
		description : String,
		tags : [String], 
		created_at 	: { type: Date },
		updated_at 	: { type: Date, default: Date.now },
		
		// session
		status : { type: String, enum: [ 'drafted', 'ready', 'running', 'finished' ] },
		current_phase : Number,
		start : Date,
		end : Date,
		
		// data
		template : Number, // ScriptTemplate
		
		results : [Schema.Types.Mixed]  // Feedback, Task results, ...
	});
mongoose.model( 'ScriptSession', ScriptSession );
	
	
	
	

/* CHAT Messages */	
var messageSchema = mongoose.Schema({
    nickname: String,
    message: String,
    date: String
})

var Message = mongoose.model('messages', messageSchema);

exports.message = Message;	
	


/*
Assessment
**/
var Tests = new Schema({
	user : String,
	type: String,
  results : Array,
  user_results : [Schema.Types.Mixed],
  process_time: Number,
  updated_at 	: Date
});
mongoose.model( 'Tests', Tests );


var Fillin = new Schema({
	field 		: String,
	contents 	: [{
  	username 	: String,
  	user_id		: Number,	
  	text 			: String,
  	updated_at: Date
  }],
  correct : String
});
mongoose.model( 'Fillin', Fillin );


var Written = new Schema({
	field 		: String,
	contents 	: [{
  	username 	: String,
  	user_id		: Number,	
  	text 			: String,
  	updated_at: Date
  }],
  correct : String
});
mongoose.model( 'Written', Written );




/*
Terzin Schemas
*/
var Scenes = new Schema({
		title				: String,
		number 			: Number,
		source			: String, // Source at German Fedaral Archive
		status			: String,
		description	: String,
		protagonists	: Array,
		locations		: String,
    user_id    	: String,
    length			: String,
    start				: Number,
    music				: String,
    images			: Array,
    updated_at 	: Date
});
mongoose.model( 'Scenes', Scenes );


//
var Persons = new Schema({
		shortname		: String,
		name				: String,
		surename 		: String,
		birth				: String, 
		death				: String,
		birth_place	: String,
		death_place	: String,
		profession	: String,
    bio    			: String,
    images 			: Array,
    updated_at 	: Date
});
mongoose.model( 'Persons', Persons );




