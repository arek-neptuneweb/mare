/* this file is used for processing all forms except registration in the system */
// TODO: break this out into a file for each form
const keystone						= require( 'keystone' ),
	  inquiryService				= require( './service_inquiry' ),
	  inquiryEmailService			= require( './emails_inquiry' ),
	  emailTargetMiddleware			= require( './service_email-target' ),
	  staffEmailContactMiddleware	= require( './service_staff-email-contact' ),
	  haveAQuestionEmailService		= require( './emails_have-a-question' );

exports.submitInquiry = function submitInquiry( req, res, next ) {
	// store the inquiry information in a local variable
	const inquiry = req.body;
	// reload the form to display the flash message
	const redirectPath = '/forms/information-request';
	// if the inquirer is and admin user, prevent processing and inform them that admin can't create inquiries
	if( req.user && req.user.userType === 'admin' ) {
		
		req.flash( 'error', {
			title: `Administrators can't create inquiries.`,
			detail: `To submit an inquiry on behalf of a family, social worker or site visitor, enter it through the database.`
		});

		return res.redirect( 303, redirectPath );
	}
	// use the inquiry service to generate a new inquiry record
	const inquiryCreated = inquiryService.createInquiry( { inquiry: req.body, user: req.user } )
	// if it was successful
	inquiryCreated
		.then( inquiry => {
			// create a flash message to notify the user of the success
			req.flash( 'success', {
				title: `Your inquiry has been received.`,
				detail: `A MARE staff person will be in touch with additional information within 2-3 business days.` } );
		})
		// if an error occurred
		.catch( err => {
			// log the error for debugging purposes
			console.error( `inquiry could not be created through the information request form - ${ err }` );
			// create a flash message to notify the user of the error
			req.flash( 'error', {
				title: `There was an error processing your request.`,
				detail: `If this error persists, please notify MARE at <a href="mailto:communications@mareinc.org">communications@mareinc.org</a>` } );
		})
		// execute the following regardless of whether the promises were resolved or rejected
		// TODO: this should be replaced with ES6 Promise.prototype.finally() once it's finalized, assuming we can update to the latest version of Node if we upgrade Keystone
		.then( () => {
			// redirect to the appropriate page 
			res.redirect( 303, redirectPath );
		});
};

exports.submitQuestion = function submitQuestion( req, res, next ) {
	// store the question information in a local variable
	const question = req.body;
	// reload the form to display the flash message
	const redirectPath = '/forms/have-a-question';
	// set default information for a staff email contact in case the real contact info can't be fetched
	let staffEmailContactInfo = {
		name: { full: 'MARE' },
		email: 'web@mareinc.org'
	};

	// fetch the email target model matching 'have a question'
	const fetchEmailTarget = emailTargetMiddleware.getEmailTargetByName( 'have a question' );

	fetchEmailTarget
		// fetch contact info for the staff contact for 'have a question'
		.then( emailTarget => staffEmailContactMiddleware.getStaffEmailContactByEmailTarget( emailTarget.get( '_id' ), [ 'staffEmailContact' ] ) )
		// overwrite the default contact details with the returned object
		.then( staffEmailContact => staffEmailContactInfo = staffEmailContact.staffEmailContact )
		// log any errors fetching the staff email contact
		.catch( err => console.error( `error fetching email contact for have a question submission, default contact info will be used instead - ${ err }` ) )
		// send a notification email to MARE staff
		.then( () => haveAQuestionEmailService.sendNewQuestionNotificationEmailToMARE( question, staffEmailContactInfo ) )		
		// if the email was successfully sent to MARE staff
		.then( () => {
			// create a flash message to notify the user of the success
			req.flash( 'success', {
				title: `Your question has been received.`,
				detail: `You should expect a response from MARE within 2 business days.` } );
		})
		// if there was an error sending the email to MARE staff
		.catch( err => {
			// log the error for debugging purposes
			console.error( `error sending new question email to MARE staff - ${ err }` );
			// create a flash message to notify the user of the error
			req.flash( 'error', {
				title: `There was an error submitting your question`,
				detail: `If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>` } );
		})
		// redirect the user once finished
		.then( () => {
			// reload the form to display the flash message
			res.redirect( 303, redirectPath );
		});
};

// TODO: this is a duplicate of functionality in the registration middleware, can we combine them to make the code more DRY
/* returns an array of staff email contacts */
exports.getRegistrationStaffContactInfo = emailTarget => {
	
		return new Promise( ( resolve, reject ) => {
			// if the user type was unrecognized, the email target can't be set
			if( !emailTarget ) {
				// reject the promise with details of the issue
				return reject( `error fetching staff contact - unknown email target ${ emailTarget }` );
			}
			// TODO: it was nearly impossible to create a readable comma separated list of links in the template with more than one address,
			// 	     so we're only fetching one contact when we should fetch them all
			// get the database id of the admin contact set to handle registration questions for the target user type
			emailTargetMiddleware.getTargetId( emailTarget )
				.then( targetId => {
					// get the contact details of the admin contact set to thandle registration questions for the target user type
					return staffEmailContactMiddleware.getContactById( targetId );
				})
				.then( contactInfo => {
					// resolve the promise with the full name and email address of the contact
					resolve( contactInfo );
				})
				.catch( err => {
					// reject the promise with the reason for the rejection
					reject( `error fetching staff contact - ${ err }` );
				});
		});
	}