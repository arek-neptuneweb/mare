// TODO: move all this middleware into the appropriate files inside the middleware/ directory,
//		 also, check for unused junk code 

const keystone 					= require('keystone'),
	  _ 						= require('underscore'),
	  async						= require( 'async' ),
	  UserMiddleware			= require( './service_user' ),
	  flashMessageMiddleware	= require( './service_flash-messages' );

// initialize the standard view locals
exports.initLocals = function(req, res, next) {
	'use strict';

	var locals = res.locals;

	// store the host information to ensure changes between http and https are handled correctly
	locals.host = req.secure ?
		`https://${ req.headers.host }` :
		`http://${ req.headers.host }`;

	locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' }
	];
	// store a reference to the logged in user object if one exists
	locals.user = req.user;
	// store whether the user is logged in
	locals.isLoggedIn = !!req.user;

	// create the main menu navigation.
	locals.mainNav = [
		// TODO: add custom header background image for each menu item
		{ title: 'Considering Adoption?', subMenu: [
			{ title: 'Types of Adoption', href: '/page/types-of-adoption' },
			{ title: 'Can I adopt a Child from Foster Care?', href: '/page/can-i-adopt-a-child-from-foster-care' },
			{ title: 'Steps in the Process', href: '/steps-in-the-process' },
			{ title: 'How Can MARE Help?', href: '/page/how-can-mare-help' }
		]},
		{ title: 'Meet the Children', subMenu: [
			{ title: 'Who are the Children?', href: '/page/who-are-the-children' },
			{ title: 'Waiting Child Profiles', href: '/waiting-child-profiles' },
			{ title: 'Other Ways to Meet Waiting Children', href: '/page/other-ways-to-meet-waiting-children' }
		]},
		{ title: 'Family Support Services', subMenu: [
			{ title: 'How Does MARE Support Families', href: '/page/how-does-mare-support-families' },
			{ title: 'Friend of the Family Mentor Program', href: '/page/friend-of-the-family-mentor-program' },
			{ title: 'Other Family Support Services', href: '/page/other-family-support-services' }
		]},
		{ title: 'For Social Workers', subMenu: [
			{ title: 'How MARE Can Help You', href: '/page/how-mare-can-help-you' },
			{ title: 'Register a Child', href: '/page/register-a-child' },
			{ title: 'Attend Events', href: '/page/attend-events' },
			{ title: `Register a Family's Homestudy`, href: '/page/register-a-familys-homestudy' }
		]},
		{ title: 'Events', subMenu: [
			{ title: 'MARE Adoption Parties & Information Events', href: '/events/adoption-parties/'},
			{ title: 'MAPP Training', href: '/events/mapp-trainings/' },
			{ title: 'Agency Information Meetings', href: '/events/agency-info-meetings/' },
			{ title: 'Other Opportunities & Trainings', href: '/events/other-trainings/' },
			{ title: 'Fundraising Events', href: '/events/fundraising-events/' }
		]},
		{ title: 'Ways to Help', subMenu: [
			{ title: 'Why give?', href: '/page/why-give' },
			{ title: 'How you can help', href: '/page/how-you-can-help' },
			{ title: 'How businesses and organizations can help', href: '/page/how-businesses-and-organizations-can-help' },
			{ title: 'Experienced families', href: '/page/experienced-families' }
		]},
		{ title: 'About Us', lastMenu: true, subMenu: [
			{ title: 'Mission & Vision', href: '/page/mission-and-vision' },
			{ title: 'History', href: '/page/history' },
			{ title: 'Meet the Staff', href: '/page/meet-the-staff' },
			{ title: 'Board of Directors', href: '/page/board-of-directors' },
			{ title: 'MARE in the News', href: '/mare-in-the-news' },
			{ title: 'Annual Report', href: '/page/annual-report' }
		]}];

	// based on the url from the requested page, fetch the navigation object for the site section
	locals.currentSection = locals.mainNav.find( section => {
		return section.subMenu.find( menuItem => {
			return menuItem.href === req.url;
		});
	});
	// mark the navigation section as selected to allow us to display an active marker during templating
	if( locals.currentSection ) {
		locals.currentSection.selected = true;
	}

	next();
};

/* fetches and clears the flashMessages before a view is rendered */
exports.flashMessages = function(req, res, next) {
	'use strict';

	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};

	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;

	next();

};


/* prevents people from accessing protected pages when they're not signed in */
exports.requireUser = function(req, res, next) {
	'use strict';
	// if there is no req.user object, the user isn't signed in
	if ( !req.user ) {
		// redirect them to the home page
		res.redirect('/');
	// otherwise, the user must be signed in
	} else {
		// allow the next middleware function to process by calling next()
		next();
	}
};

exports.login = function( req, res, next ) {

	let locals = res.locals;

	if ( !req.body.email || !req.body.password ) {
		/* TODO: need a better message for the user, flash messages won't work because page reloads are stupid */
		req.flash( 'error', { title: 'Something went wrong',
							  detail: 'Please enter your username and password' } );
		return next();
	}

	async.series([
		done => { UserMiddleware.checkUserActiveStatus( req.body.email, locals, done ); }
	], () =>{

		if( locals.userStatus === 'nonexistent' ) {

			req.flash( 'error', { title: 'Something went wrong',
							  	  detail: 'Your username or password is incorrect, please try again' } );
			
			res.redirect( req.body.target || '/' );

		} else if( locals.userStatus === 'inactive' ) {
			// TODO: we need to figure out if they were once active, or change the message to handle that case as well
			req.flash( 'error', {
				detail: 'The email you are trying to use already exists in the system.  Please reset your password for this email address in order to gain access.    If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>'
			});

			res.redirect( req.body.target || '/' );

		} else if( locals.userStatus === 'active' ) {
			// TODO: you can add a target to the signin of the current page and it will always route correctly back to where the user was
			var onSuccess = function() {
				if ( req.body.target && !/join|signin/.test( req.body.target ) ) { // TODO: I don't think this is needed anymore
					res.redirect( req.body.target || '/' );
				} else {
					res.redirect( '/' );
				}
			}

			var onFail = function() {
				/* TODO: need a better message for the user, flash messages won't work because page reloads are stupid */
				req.flash( 'error', { title: 'Something went wrong',
									  detail: 'Please try again.  If this error persists, please notify <a href="mailto:communications@mareinc.org">communications@mareinc.org</a>' } );
				req.body.target ? res.redirect( req.body.target ) : res.redirect( '/' );
			}

			keystone.session.signin( { email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail );
		}
	})
};

exports.loginAjax = function loginAjax( req, res, next ) {

	let locals = res.locals;

	if ( !req.body.email || !req.body.password ) {

		flashMessageMiddleware.appendFlashMessage({
			messageType: flashMessageMiddleware.MESSAGE_TYPES.ERROR,
			title: 'Something went wrong',
			message: 'Please enter your username and password.'
		});

		generateAndSendFailureMessage();

	} else {

		async.series([
			done => { UserMiddleware.checkUserActiveStatus( req.body.email, locals, done ); }
		], () => {
	
			if ( locals.userStatus === 'nonexistent' ) {
	
				flashMessageMiddleware.appendFlashMessage({
					messageType: flashMessageMiddleware.MESSAGE_TYPES.ERROR,
					title: 'Something went wrong',
					message: 'Your username or password is incorrect, please try again.'
				});

				generateAndSendFailureMessage();
	
			} else if ( locals.userStatus === 'inactive' ) {
				
				// TODO: we need to figure out if they were once active, or change the message to handle that case as well
				flashMessageMiddleware.appendFlashMessage({
					messageType: flashMessageMiddleware.MESSAGE_TYPES.ERROR,
					message: 'The email you are trying to use already exists in the system.  Please reset your password for this email address in order to gain access.    If this error persists, please notify MARE at <a href="mailto:web@mareinc.org">web@mareinc.org</a>'
				});

				generateAndSendFailureMessage();
	
			} else if ( locals.userStatus === 'active' ) {
				
				// TODO: you can add a target to the signin of the current page and it will always route correctly back to where the user was
				var onSuccess = function() {
					
					// send a success message along with the post-login destination page
					res.send({ 
						status: 'success',
						targetPage: req.body.target || '/' 
					});
				}
	
				var onFail = function() {
					
					flashMessageMiddleware.appendFlashMessage({
						messageType: flashMessageMiddleware.MESSAGE_TYPES.ERROR,
						title: 'Your username or password is incorrect, please try again.',
						message: ''
					});

					generateAndSendFailureMessage();
				}
	
				keystone.session.signin( { email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail );
			}
		});
	}

	// helper to generate and send login failure flash messages
	function generateAndSendFailureMessage() {

		flashMessageMiddleware.generateFlashMessageMarkup()
			.then( flashMessageMarkup => {

				res.send({
					status: 'error',
					flashMessage: flashMessageMarkup 
				});
			})
			.catch( error => {

				next( error );
			});
	}
};

exports.logout = function(req, res) {

	keystone.session.signout( req, res, function() {
		req.query.target ? res.redirect( req.query.target ) : res.redirect( '/' );
	});
};

/* TODO: this should be placed in a date-time.js file, but I wasn't able to get it to register on my first try */
exports.getAge = function getAge( dateOfBirth ) {

	var today = new Date();
	var birthDate = new Date( dateOfBirth );
	var age = today.getFullYear() - birthDate.getFullYear();
	var month = today.getMonth() - birthDate.getMonth();

	if ( month < 0 || ( month === 0 && today.getDate() < birthDate.getDate() ) ) {
		age--;
	}

	return age;
};

/* date objects are easily compared for sorting purposes when converted to milliseconds */
exports.convertDate = function convertDate( date ) {
	return new Date( date ).getTime();
};

/* converts an array to a string like 'element1, element2, and element3' */
exports.getArrayAsList = function getArrayAsList( array ) {
	// convert the array to a string separated by commas
	let returnString = array.join( ', ' );
	// findn the index of the last comma
	const lastComma = returnString.lastIndexOf( ',' );
	// replace the last comma
	if( lastComma !== -1 ) {
		returnString = `${ returnString.substring( 0, lastComma ) } and ${ returnString.substring( lastComma + 2 ) }`;
	}

	return returnString;
}