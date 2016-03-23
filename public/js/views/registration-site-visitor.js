(function () {
	'use strict';

	mare.views.SiteVisitorRegistration = Backbone.View.extend({
		el: '.registration-form--site-visitor',

		events: {
			'change .other-way-to-hear-about-mare': 'toggleOtherWayToHearTextField'
		},

		initialize: function() {
			// DOM cache any commonly used elements to improve performance
			this.$howDidYouHearOther = this.$('#site-visitor-how-did-you-hear-other');
			// Initialize parsley validation on the form
			this.form = this.$el.parsley();
			// Bind the hidden 'other' text box for use in binding/unbinding validation
			this.howDidYouHearOtherValidator = this.$howDidYouHearOther.parsley();
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
				// Create a custom error message to display if validation fails
				this.$howDidYouHearOther.attr('data-parsley-error-message', 'required');
			}
		},

		validateForm: function validateForm() {
			var ok = $('.parsley-error').length === 0;
			$('.bs-callout-info').toggleClass('hidden', !ok);
			$('.bs-callout-warning').toggleClass('hidden', ok);
		}

	});
})();