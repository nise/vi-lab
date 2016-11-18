/*

**/
var 
	mongoose = require( 'mongoose' ),
	Schema   = mongoose.Schema
	;
mongoose.Promise = require('bluebird');	
 

/****** VIDEOS ******************************************/ 

var Videos = new Schema({
		video		: String,
		id				: String,
		//file 			: VideoFile,
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
       thumbnail 		: Array,
       source				: String
		}],
    toc							: [Schema.Types.Mixed],
		tags						: [Schema.Types.Mixed],
		hyperlinks			: [Schema.Types.Mixed],
		highlight				: [Schema.Types.Mixed],
		assessmentanalysis				: [Schema.Types.Mixed],
		slides					: [Schema.Types.Mixed],
		comments				: [Schema.Types.Mixed],
		assessment			: [Schema.Types.Mixed],
		assessmentfillin		: [Schema.Types.Mixed],
		assessmentwriting		: [Schema.Types.Mixed],
		progress				: String,
    updated_at 			: { type: Date, default: Date.now }
});
mongoose.model( 'Videos', Videos );


// see dublin core: http://dublincore.org/documents/2012/06/14/dcmi-terms/?v=terms#
var VideoFiles = new Schema({
// dubline core meta data set v1.1
// identifier : Number, // = _id
	title				: String,
	creator			: String,
	subject	    : String,
	description	: String, // former abstract	
	publisher   : String,	
	contributor : String,
	date				: Date, // date of creation
	type				: String,
	mimetype 		: String,
	format			: Array, // available format / mime types?
	source			: String,
	language		: String,
	relation    : String,
	coverage    : String,
	rights      : String,
	license     : String,
// additional technical things
	video				: String, // url
	length			: String,
	size				: String, // file size
	thumbnail 	: Array, // [url]
// additional semantic data	
	institution	: String,
	category		: String,
	tags				: Array,
// annotations
	presentation_type :  { type: String, enum: [ 'video-only', 'audio-only', 'audio-slides', 'video-slides' ] }, // 'multi-angle', '360'
	annotations : {
		toc							: [Schema.Types.Mixed],
		tags						: [Schema.Types.Mixed],
		hyperlinks			: [Schema.Types.Mixed],
		highlight				: [Schema.Types.Mixed],
		assessmentanalysis : [Schema.Types.Mixed],
		slides					: [Schema.Types.Mixed],
		comments				: [Schema.Types.Mixed],
		assessment			: [Schema.Types.Mixed],
	},	
// misc
	updated_at 	: { type: Date, default: Date.now }
});
mongoose.model( 'VideoFiles', VideoFiles );




/****** USER MANAGEMENT ******************************************/

var Users = new Schema({
	id: Number,
  username: String,
  password: String,
  email: String,
  name: String,
  firstname: String,
  hs: String,
  gender: String,
  culture: String,
  attribute:Number,
  role: String,
  status: {
  	online: Boolean,
  	location: String,
  	updated_at: { type: Date, default: Date.now }
  },
  icon: String,
  trace: Boolean,
  experimental: Boolean,
  groups: [Schema.Types.Mixed],
  updated_at 	: { type: Date, default: Date.now }
});
mongoose.model( 'Users', Users );



// 
var Groups = new Schema({
	id: String,
	description: String,
	phase: Number,
	persons: Number,
	hs: String, 
	videos : Array, // video instances
	ep_group_pad_id: String, 
	ep_group_id: String,
  updated_at 	: { type: Date, default: Date.now }
});
mongoose.model( 'Groups', Groups );


//
var GroupFormations = new Schema({
	title : String,
	persons: Number,
	groups: Number,
	method: String,
	formation: Array,
	created_at 	: Date,
  updated_at 	: { type: Date, default: Date.now }
});
mongoose.model( 'GroupFormations', GroupFormations );



/****** SCRIPTS ******************************************/
//
var Widgets = new Schema({ 
	label : String,
	name: String, 
	canBeAnnotated: Boolean, 
	widget_options: {
		hasTimelineMarker: Boolean,
		timelineSelector : String, 
		hasMenu : Boolean,
		menuSelector: String,
		allowReplies : Boolean, // tipical for comments
		allowEditing : Boolean,
		allowCreation : Boolean,
		allowComments : Boolean,
		allowReplies : Boolean,
		allowEmoticons : Boolean,
		label: String,
		step : Number,
		speed_step : Number,
		minDuration : Number, 
		path: String
		}// end options 
	}
);
mongoose.model( 'Widgets', Widgets );

var Phases = new Schema({
	start : Date,
	end: Date,
	title: String,
	instruction: String,
	supplements: String, 
	fuck:[Schema.Types.Mixed],
	seq : Number,
	groupindex : Number,
	groupformation : { type: Schema.Types.ObjectId },//, ref: 'GroupFormations'
	video_files: [{ type: Schema.Types.ObjectId }], //, ref: 'VideoFiles'
	//widgets: [ { type: Schema.Types.ObjectId, ref: 'Widgets' } ] 
	widgets: [Widgets]
});
mongoose.model( 'Phases', Phases );


// minlength: 5
var ScriptTemplate = new Schema({
	title: String,
	description: String,
	tags : [String], 
	created_at 	: { type: Date, default: Date.now },
	updated_at 	: { type: Date, default: Date.now },
  slides : Boolean, // ???
  phases: [ Phases ]
	/*	{ 
			title: String,
			instruction: String,
			supplements: String, 
			seq : Number,
			groupindex: Number,
			video_files: [Schema.ObjectId],  
			widgets:   
				[{ 
					label : String,
					name: String,
					type: String, 
					_id: false,
					canBeAnnotated: Boolean, 
					widget_options: {
						hasTimelineMarker: Boolean,
						timelineSelector : String, 
						hasMenu : Boolean,
						menuSelector: String,
						allowReplies : Boolean, // tipical for comments
						allowEditing : Boolean,
						allowCreation : Boolean,
						allowComments : Boolean,
						allowReplies : Boolean,
						allowEmoticons : Boolean,
						label: String,
						step : Number,
						speed_step : Number,
						minDuration : Number, 
						path: String,
						_id: false
					}// end options 
				}]// end widget		
    }
	] // end pahse */
});
mongoose.model( 'ScriptTemplate', ScriptTemplate );

/*
// not working
ScriptTemplate.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});
*/

/*
var autoref = require('mongoose-autorefs');

ScriptInstance.plugin(autoref, [
    'phases.widgets'
]);*/


//
var ScriptInstance = new Schema( {
		title : String,
		template : Schema.Types.ObjectId,//{ type: Schema.Types.ObjectId, ref: 'ScriptTemplate' },
		status : { type: String, enum: [ 'drafted', 'ready', 'running', 'finished' ] },
		current_phase : Number,
		results : [Schema.Types.Mixed],  // ?? Feedback, Task results, ...
		phases : [ Phases ],
		/* 
			{ 
				start : Date,
				end: Date,
				title: String,
				instruction: String,
				supplements: String, 
				fuck:[Schema.Types.Mixed],
				seq : Number,
    		groupindex : Number,
    		groupformation : { type: Schema.Types.ObjectId },//, ref: 'GroupFormations'
    		video_files: [{ type: Schema.Types.ObjectId }], //, ref: 'VideoFiles'
    		//widgets: [ { type: Schema.Types.ObjectId, ref: 'Widgets' } ] 
    		widgets:   
				[{ 
					label : String,
					name: String, 
					type: String,
					_id: false,
					canBeAnnotated: Boolean, 
					widget_options: {
						hasTimelineMarker: Boolean,
						timelineSelector : String, 
						hasMenu : Boolean,
						menuSelector: String,
						allowReplies : Boolean, // tipical for comments
						allowEditing : Boolean,
						allowCreation : Boolean,
						allowComments : Boolean,
						allowReplies : Boolean,
						allowEmoticons : Boolean,
						label: String,
						step : Number,
						speed_step : Number,
						minDuration : Number, 
						path: String,
						_id: false
					}// end options
				}]// end widget		
			}
		],*/
		created_at 	: { type: Date },
		updated_at 	: { type: Date, default: Date.now }
	});

mongoose.model( 'ScriptInstance', ScriptInstance );



	
/* Log */
var Log = new Schema({
		utc: 							Number, 
		phase: 						Number,
		date:  						String, 
		time:  						String,
		session:  				String,
		
		group:  					String, 
		user:  						Number, 
		user_name:  			String,
		user_gender:			String,
		user_culture:			String,
		user_session:			Number,
				
		video_id:  				String,
		video_file:  			String,
		video_length:  		String,
		video_language:  	String,
		
		action:						{
			context: String,
			action: String,
			values: Array
		},
		playback_time:		Number,
		user_agent:  			String,
		ip: 							String,
		flag: 						Boolean
}); 
mongoose.model( 'Log', Log );		



/*************************** 
CHAT Messages 
****************************/	
var messageSchema = mongoose.Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    recipient: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    phase: Number,
    visibility: { type: String, enum: [ 'personal', 'editor', 'group', 'all' ], default: 'group' },
    subject: String,
    type: { type: String, default: 'message',  enum: [ 'chat', 'tutor-question', 'feedback', 'message', 'group-message' ] }, 
    message: String,
    updated_at: { type: Date, default: Date.now }
});
var Message = mongoose.model('Messages', messageSchema);
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
  updated_at 	: { type: Date, default: Date.now }
});
mongoose.model( 'Tests', Tests );


var Fillin = new Schema({
	field 		: String,
	contents 	: [{
  	username 	: String,
  	user_id		: Number,	
  	text 			: String,
  	updated_at: { type: Date, default: Date.now }
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
  	updated_at: { type: Date, default: Date.now }
  }],
  correct : String
});
mongoose.model( 'Written', Written );








// 
var Images = new Schema({
		title				: String,
		url 				: String,
		tags				: [Schema.Types.Mixed],
		scene					: String,
    updated_at 	: { type: Date, default: Date.now }
});
mongoose.model( 'Images', Images );

/*
Terezin Schemas
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
    updated_at 	: { type: Date, default: Date.now }
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
    updated_at 	: { type: Date, default: Date.now }
});
mongoose.model( 'Persons', Persons );




