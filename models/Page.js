var keystone = require('keystone'),
	Types = keystone.Field.Types;

// Create model. Additional options allow menu name to be used what auto-generating URLs
var Page = new keystone.List('Page', {
	autokey: { path: 'key', from: 'title', unique: true },
	map: { name: 'title' },
	defaultSort: 'title'
});

// Create fields
Page.add({
	title: { type: Types.Text, label: 'page title', required: true, initial: true },
	url: { type: Types.Url, noedit: true },
	content: { type: Types.Html, wysiwyg: true, initial: true }
});

// Pre Save
Page.schema.pre('save', function(next) {
'use strict';

	this.url = '/page/' + this.key;
	next();
});

// Define default columns in the admin interface and register the model
Page.defaultColumns = 'title, url';
Page.register();