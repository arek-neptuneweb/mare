var keystone = require('keystone'),
	Types = keystone.Field.Types;

// Create model
var Child = new keystone.List('Child', {
	track: true,
	autokey: { path: 'key', from: 'registrationNumber', unique: true },
	map: { name: 'name.full' },
	defaultSort: 'name.full'
});

// Create fields
Child.add({ heading: 'Child Information' }, {
	registrationNumber: { type: Number, label: 'registration number', format: false, required: true, index: true, initial: true },
	registrationDate: { type: Types.Text, label: 'registration date', note: 'mm/dd/yyyy', required: true, initial: true },

	video: { type: Types.Url, label: 'Video' },

	name: {
		first: { type: Types.Text, label: 'first name', required: true, index: true, initial: true },
		middle: { type: Types.Text, label: 'middle name' },
		last: { type: Types.Text, label: 'last name', required: true, index: true, initial: true },
		alias: { type: Types.Text, label: 'alias' },
		nickName: { type: Types.Text, label: 'nickname' },
		full: { type: Types.Text, label: 'name', hidden: true, noedit: true, initial: false },
		identifying: { type: Types.Text, hidden: true }
	},

	birthDate: { type: Types.Text, label: 'date of birth', note: 'mm/dd/yyyy', required: true, initial: true },
	language: { type: Types.Relationship, label: 'language', ref: 'Language', many: true, required: true, initial: true },
	statusChangeDate: { type: Types.Text, label: 'status change date', note: 'mm/dd/yyyy' }, // TODO: Logic needed, see line 14 of https://docs.google.com/spreadsheets/d/1Opb9qziX2enTehJx5K1J9KAT7v-j2yAdqwyQUMSsFwc/edit#gid=1235141373
	status: { type: Types.Relationship, label: 'status', ref: 'Child Status', required: true, index: true, initial: true },
	gender: { type: Types.Relationship, label: 'gender', ref: 'Gender', required: true, index: true, initial: true },
	race: { type: Types.Relationship, label: 'race', ref: 'Race', many: true, required: true, index: true, initial: true },
	legalStatus: { type: Types.Relationship, label: 'legal status', ref: 'Legal Status', required: true, index: true, initial: true },

	hasContactWithSiblings: { type: Types.Boolean, label: 'has contact with siblings?', index: true },
	siblingTypeOfContact: { type: Types.Text, label: 'type of contact' },
	siblingContacts: { type: Types.Relationship, label: 'siblings to be placed together (comma separated)', ref: 'Child', many: true },
	hasContactWithBirthFamily: { type: Types.Boolean, label: 'has contact with birth family?' },
	birthFamilyTypeOfContact: { type: Types.Text, label: 'type of contact' },

	residence: { type: Types.Relationship, label: 'where does the child presently live?', ref: 'Residence' },
	city: { type: Types.Relationship, label: 'city/town of child\'s current location', ref: 'City or Town' },
	careFacilityName: { type: Types.Text, label: 'name of residential/group care facility' },
	dateMovedToResidence: { type: Types.Text, label: 'date moved to current residence', note: 'mm/dd/yyyy', required: true, initial: true }

}, { heading: 'Special Needs' }, {

	physicalNeeds: { type: Types.Select, label: 'physical needs', options: 'None, Mild, Moderate, Severe', required: true, initial: true },
	physicalNeedsDescription: { type: Types.Textarea, label: 'description of physical needs', dependsOn: { physicalNeeds: ['Mild', 'Moderate', 'Severe'] }, initial: true },
	emotionalNeeds: { type: Types.Select, label: 'emotional needs', options: 'None, Mild, Moderate, Severe', required: true, initial: true },
	emotionalNeedsDescription: { type: Types.Textarea, label: 'description of emotional needs', dependsOn: { emotionalNeeds: ['Mild', 'Moderate', 'Severe'] }, initial: true },
	intellectualNeeds: { type: Types.Select, label: 'intellectual needs', options: 'None, Mild, Moderate, Severe', required: true, initial: true },
	intellectualNeedsDescription: { type: Types.Textarea, label: 'description of intellectual needs', dependsOn: { intellectualNeeds: ['Mild', 'Moderate', 'Severe'] }, initial: true },

	disabilities: { type: Types.Relationship, label: 'disabilities', ref: 'Disability', many: true },

	specialNeedsNotes: { type: Types.Textarea, label: 'notes', dependsOn: { physicalNeeds: ['Mild', 'Moderate', 'Severe'], emotionalNeeds: ['Mild', 'Moderate', 'Severe'], intellectualNeeds: ['Mild', 'Moderate', 'Severe'] } }
	// specialNeedsNotes: { type: Types.Textarea, label: 'Notes', initial: true }

}, { heading: 'Placement Considerations' }, {

	recommendedFamilyConstellation: { type: Types.Relationship, label: 'recommended family constellations', ref: 'Family Constellation', many: true, required: true, index: true, initial: true },
	otherFamilyConstellationConsideration: { type: Types.Relationship, label: 'other family constellation consideration', ref: 'Other Family Constellation Consideration', many: true, index: true, initial: true },
	childPlacementConsiderations: { type: Types.Relationship, label: 'child placement considerations', ref: 'Child Placement Consideration', many: true, index: true }

}, { heading: 'Agency Information' }, {

	registeredBy: { type: Types.Select, label: 'registered by', options: 'Unknown, Adoption Worker, Recruitment Worker', required: true, index: true, initial: true },
	adoptionWorker: { type: Types.Relationship, label: 'adoption worker', ref: 'Social Worker', filters: { position: 'adoption worker' } },
	recruitmentWorker: { type: Types.Relationship, label: 'recruitment worker', ref: 'Social Worker', filters: { position: 'recruitment worker' } }

}, { heading: 'Photolisting Information' }, {

	profile: {
		part1: { type: Types.Textarea, label: 'let me tell you more about myself...', required: true, initial: true },
		part2: { type: Types.Textarea, label: 'and here\'s what others say...', required: true, initial: true },
		part3: { type: Types.Textarea, label: 'if I could have my own special wish...', required: true, initial: true }
	},

	hasPhotolistingWriteup: { type: Types.Boolean, label: 'photolisting writeup', index: true },
	photolistingWriteupDate: { type: Types.Text, label: 'date of photolisting writeup', note: 'mm/dd/yyyy', dependsOn: { hasPhotolistingWriteup: true } },
	hasPhotolistingPhoto: { type: Types.Boolean, label: 'photolisting photo', index: true },
	photolistingPhotoDate: { type: Types.Text, label: 'date of photolisting photo', note: 'mm/dd/yyyy', dependsOn: { hasPhotolistingPhoto: true } },
	photolistingPageNumber: { type: Number, label: 'photolisting page', format: false, index: true },
	previousPhotolistingPageNumber: { type: Number, label: 'previous photolisting page', format: false, index: true },

	// image: { type: Types.CloudinaryImage, folder: 'children/', select: true, selectPrefix: 'children/', publicID: 'slug', autoCleanup: true },
	image: { type: Types.CloudinaryImage, label: 'image', folder: 'children/', publicID: 'name.identifying', autoCleanup: true },
	galleryImage: {type: Types.Url, hidden: true },
	detailImage: {type: Types.Url, hidden: true },
	extranetUrl: { type: Types.Url, label: 'extranet and related profile url' } // Since this is redudant as this just points the the url where the photo exists (the child's page), we may hide this field.  This must be kept in as it will help us track down the child information in the old system in the event of an issue.

}, { heading: 'Recruitment Options' }, {

	hasVideoSnapshot: { type: Types.Boolean, label: 'video snapshot', index: true },
	videoSnapshotDate: { type: Types.Text, label: 'date of video snapshot', note: 'mm/dd/yyyy', dependsOn: { hasVideoSnapshot: true } },

	onMAREWebsite: { type: Types.Boolean, label: 'MARE website', index: true },
	onMAREWebsiteDate: { type: Types.Text, label: 'date on MARE website', note: 'mm/dd/yyyy', dependsOn: { onMAREWebsite: true } },

	onAdoptuskids: { type: Types.Boolean, label: 'Adoptuskids website', index: true },
	onAdoptuskidsDate: { type: Types.Text, label: 'date on Adoptuskids', note: 'mm/dd/yyyy', dependsOn: { onAdoptuskids: true } },

	onOnlineMatching: { type: Types.Boolean, label: 'online matching website', index: true },
	onOnlineMatchingDate: { type: Types.Text, label: 'date on online matching', note: 'mm/dd/yyyy', dependsOn: { onOnlineMatching: true } },

	wednesdaysChild: { type: Types.Boolean, label: 'Wednesday\'s Child?' },
	wednesdaysChildDate: { type: Types.Text, label: 'date of Wednesday\'s Child', note: 'mm/dd/yyyy', dependsOn: { wednesdaysChild: true } },

	coalitionMeeting: { type: Types.Boolean, label: 'coalition meeting', index: true },
	coalitionMeetingDate: { type: Types.Text, label: 'date of coalition meeting', note: 'mm/dd/yyyy', dependsOn: { coalitionMeeting: true } },

	matchingEvent: { type: Types.Boolean, label: 'matching event', index: true },
	matchingEventDate: { type: Types.Text, label: 'date of matching event', note: 'mm/dd/yyyy', dependsOn: { matchingEvent: true } },

	adoptionParties: { type: Types.Relationship, label: 'adoption parties', ref: 'Event', filters: { type: 'adoption party' }, many: true },

	mediaEligibility: { type: Types.Relationship, label: 'media eligibility', ref: 'Media Eligibility', many: true },
	otherMediaDescription: { type: Types.Textarea, label: 'description', dependsOn: { mediaEligibility: 'Other' } } // THIS DOESN'T WORK, MAKE IT WORK!

}, { heading: 'Attachments' }, {

	photolistingPage: {
		type: Types.S3File,
		s3path: '/child/photolisting-pages',
		filename: function(item, filename){
			// prefix file name with registration number and add the user's name for easier identification
			return item.name.identifying;
		}
	},

	otherAttachement: {
		type: Types.S3File,
		s3path: '/child/other',
		filename: function(item, filename){
			// prefix file name with registration number and add the user's name for easier identification
			return item.name.identifying;
		}
	}

});

// Displaly associations via the Relationship field type
Child.relationship({ path: 'children', ref: 'Child', refPath: 'siblingContacts' });
// Child.relationship({ path: 'siblings', ref: 'Sibling', refPath: 'child1' });
Child.relationship({ path: 'placements', ref: 'Placement', refPath: 'child' });

// Pre Save
Child.schema.pre('save', function(next) {
	'use strict';

	// TODO: Play with lowering quality to 0 and doubling the image size as an optimization technique
	this.galleryImage = this._.image.thumbnail(430,430,{ quality: 60 });
	this.detailImage = this._.image.thumbnail(200,200,{ quality: 60 });

	// Build the name string for better identification when linking through Relationship field types
	var firstName	= this.name.first,
		middleName	= (this.name.middle && this.name.middle.length > 0) ? ' ' + this.name.middle : '',
		lastName	= (this.name.last && this.name.last.length > 0) ? ' ' + this.name.last : ''


	this.name.full = firstName + middleName + lastName;
	this.name.identifying = this.registrationNumber + '_' + firstName.toLowerCase();

	// TODO: Assign a registration number if one isn't assigned
	next();
});

// // Define default columns in the admin interface and register the model
Child.defaultColumns = 'registrationNumber, name.full, ethnicity, legalStatus, gender';
Child.register();
