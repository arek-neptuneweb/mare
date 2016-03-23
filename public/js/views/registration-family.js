(function () {
	'use strict';

	mare.views.FamilyRegistration = Backbone.View.extend({
		el: '.registration-form--family',

		events: {
			'change .other-way-to-hear-about-mare'	: 'toggleOtherWayToHearTextField',
			'change #family-state'					: 'toggleHomestudySubmission',
			'change .homestudy-completed-checkbox'	: 'toggleHomestudySection',
			'change #upload-button'					: 'uploadForm'
		},

		initialize: function() {
			// DOM cache any commonly used elements to improve performance
			this.$state							= this.$('#family-state');
			this.$homestudyCompletionDate		= this.$('#homestudy-date-complete');
			this.$socialWorkerName				= this.$('#social-worker-name');
			this.$socialWorkerAgency			= this.$('#social-worker-agency');
			this.$socialWorkerPhone				= this.$('#social-worker-phone');
			this.$socialWorkerEmail				= this.$('#social-worker-email');
			this.$homestudySection				= this.$('.family-submit-your-homestudy-section');
			this.$homestudySubmissionSection	= this.$('.family-homestudy-details-section');
			this.$howDidYouHearOther			= this.$('#family-how-did-you-hear-other');
			// Initialize parsley validation on the form
			this.form = this.$el.parsley();
			// Bind the hidden 'other' text box for use in binding/unbinding validation
			this.howDidYouHearOtherValidator = this.$howDidYouHearOther.parsley();
			// Bind the hidden homestudy text boxes for use in binding/unbinding validation
			this.homestudyCompletionDateValidator 	= this.$homestudyCompletionDate.parsley();
			this.socialWorkerNameValidator 			= this.$socialWorkerName.parsley();
			this.socialWorkerAgencyValidator 		= this.$socialWorkerAgency.parsley();
			this.socialWorkerPhoneValidator 		= this.$socialWorkerPhone.parsley();
			this.socialWorkerEmailValidator 		= this.$socialWorkerEmail.parsley();
			// DOM cache the Parsley validation message for the hidden 'other' field for use in binding/unbinding validation
			this.$howDidYouHearOtherErrorMessage = this.$howDidYouHearOther.next();

			this.form.on('field:validated', this.validateForm);
		},

		toggleOtherWayToHearTextField: function toggleOtherWayToHearTextField() {
			// Hide/show the hidden 'other' field via the hidden class
			this.$howDidYouHearOther.toggleClass('hidden');

			if(this.$howDidYouHearOther.hasClass('hidden')) {
				// Clear out the input box since it's hidden and not part of the form submission
				this.$howDidYouHearOther.val('');
				// Remove the validation binding
				this.$howDidYouHearOther.attr('data-parsley-required', 'false');
				// Reset validation on the field.  If it was already validated, we need to clear out the check so the form can be submitted
				this.howDidYouHearOtherValidator.reset();
			} else {
				// Add validation binding
				this.$howDidYouHearOther.attr('data-parsley-required', 'true');
			}
		},

		toggleHomestudySection: function toggleHomestudySection() {
			// Hide/show the hidden homestudy section via the hidden class
			this.$homestudySubmissionSection.toggleClass('hidden');

			if(this.$homestudySubmissionSection.hasClass('hidden')) {
				// Clear out the homestudy input fields since the section is hidden and not part of the form submission
				this.$homestudyCompletionDate.val('');
				this.$socialWorkerName.val('');
				this.$socialWorkerAgency.val('');
				this.$socialWorkerPhone.val('');
				this.$socialWorkerEmail.val('');
				// Remove validation bindings
				this.$homestudyCompletionDate.attr('data-parsley-required', 'false');
				this.$socialWorkerName.attr('data-parsley-required', 'false');
				this.$socialWorkerAgency.attr('data-parsley-required', 'false');
				this.$socialWorkerPhone.attr('data-parsley-required', 'false');
				this.$socialWorkerEmail.attr('data-parsley-required', 'false');
				// Reset validation on the fields.  If they were already validated, we need to clear out the checks so the form can be submitted
				this.homestudyCompletionDateValidator.reset();
				this.socialWorkerNameValidator.reset();
				this.socialWorkerAgencyValidator.reset();
				this.socialWorkerPhoneValidator.reset();
				this.socialWorkerEmailValidator.reset();
			} else {
				// Add validation binding
				this.$homestudyCompletionDate.attr('data-parsley-required', 'true');
				this.$socialWorkerName.attr('data-parsley-required', 'true');
				this.$socialWorkerAgency.attr('data-parsley-required', 'true');
				this.$socialWorkerPhone.attr('data-parsley-required', 'true');
				this.$socialWorkerEmail.attr('data-parsley-required', 'true');
			}
		},

		toggleHomestudySubmission: function toggleHomestudySubmission() {
			var selectedOption = this.$state.children('option:selected');

			if(selectedOption.html() === 'Massachusetts') {
				// Show the homestudy section of the form
				this.$homestudySection.show();
			} else {
				// hide the homestudy section of the form
				this.$homestudySection.hide();
				// clear out any uploaded homestudy files
				this.$('[name=HomeStudySubmission]').attr('checked', false);
				this.$('#homestudy-file-upload').val('');
			}
		},

		uploadForm: function uploadForm(event) {
			// Get the full path to the file and trim everything up to and including the last slash to give us just the file name
			var filepath = event.target.value;
			var filename = filepath.substr( filepath.lastIndexOf("\\") + 1 );
			// Show the file name to the user as a point of reference after they've selected the file they wish to upload
			this.$(".homestudy-file-upload-text").html(filename);
		},

		validateForm: function validateForm() {
			var ok = $('.parsley-error').length === 0;
			$('.bs-callout-info').toggleClass('hidden', !ok);
			$('.bs-callout-warning').toggleClass('hidden', ok);
		}

	});
})();