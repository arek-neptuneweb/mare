var keystone = require( 'keystone' ),
	Types = keystone.Field.Types;

// Create model. Additional options allow menu name to be used what auto-generating URLs
var AccountVerificationCode = new keystone.List( 'Account Verification Code', {
	hidden: false
});

// Create fields
AccountVerificationCode.add({
	code: { type: Types.Text, label: 'code', required: true, noedit: true, initial: true },
    user: { type: Types.Relationship, label: 'user', ref: 'User', required: true, noedit: true, initial: true },
	dateSent: { type: Types.Date, label: 'date sent', format: 'MM/DD/YYYY', required: true, noedit: true, initial: true }
});

// Define default columns in the admin interface and register the model
AccountVerificationCode.defaultColumns = 'code, user, dateSent';
AccountVerificationCode.register();