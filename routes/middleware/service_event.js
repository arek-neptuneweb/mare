const keystone						= require( 'keystone' ),
	  async							= require( 'async' ),
	  moment						= require( 'moment' ),
	  eventEmailMiddleware			= require( './emails_event' ),
	  emailTargetMiddleware			= require( './service_email-target' ),
	  staffEmailContactMiddleware	= require( './service_staff-email-contact' ),
	  eventService					= require( './service_event' );

exports.getEventById = ( eventId, fieldsToPopulate = [] ) => {

	return new Promise( ( resolve, reject ) => {
		keystone.list( 'Event' ).model
			.findById( eventId )
			.populate( fieldsToPopulate )
			.exec()
			.then( event => {
				// if the target event could not be found
				if( !event ) {
					// log an error for debugging purposes
					console.error( `no event matching id '${ eventId } could be found` );
					// reject the promise
					return reject();
				}

				// if the target event was found, resolve the promise with the event
				resolve( event );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching event matching id ${ eventId } - ${ err }` );
				// and reject the promise
				reject();
			});
	});
};
/* TODO: this is not reusable, but is needed to show a single event page.  Consider adding populate and possibly
		 building other elements of the Mongoose query dynamically using passed in options */
exports.getEventByKey = key => {

	return new Promise( ( resolve, reject ) => {
		// attempt to find a single event matching the passed in key, and populate some of the Relationship fields
		keystone.list( 'Event' ).model
			.findOne()
			.where( 'key', key )
			.populate( 'contact' )
			.populate( 'childAttendees' )
			.populate( 'familyAttendees' )
			.populate( 'socialWorkerAttendees' )
			.populate( 'siteVisitorAttendees' )
			.populate( 'staffAttendees' )
			.populate( 'address.state' )
			.exec()
			.then( event => {
				// if the target event could not be found
				if( !event ) {
					// log an error for debugging purposes
					console.error( `no event matching '${ name } could be found` );
				}
				// if the target event was found, resolve the promise with the event
				resolve( event );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching event matching key ${ key } - ${ err }` );
				// and reject the promise
				reject();
			});
		});
};

/* TODO: this is not reusable, but is needed to show a events category page.  Consider adding populate and possibly
		 building other elements of the Mongoose query dynamically using passed in options */
exports.getActiveEventsByEventType = ( eventType, eventGroup ) => {

	return new Promise( ( resolve, reject ) => {

		keystone.list( 'Event' ).model
			.find()
			.where( 'type', eventType ) // grab only the events matching the target category
			.where( 'isActive', true ) // we don't want to show inactive events
			.populate( eventGroup )
			.populate( 'address.state' )
			.lean()
			.exec()
			.then( events => {
				// if no active events matching the passed in eventType could not be found
				if( events.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no active events matching ${ eventType } could be found` );
				}
				// resolve the promise with the events
				resolve( events );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching active events matching ${ eventType } - ${ err }` );
				// and reject the promise
				reject();
			});
		});
};

exports.getActiveEventsByUserId = ( userId, eventGroup ) => {

	return new Promise( ( resolve, reject ) => {

		keystone.list( 'Event' ).model
			.find()
			.where( 'isActive', true ) // we don't want to show inactive events
			.where( eventGroup ).in( [userId] ) // only show events for this user
			.populate( eventGroup )
			.populate( 'address.state' )
			.lean()
			.exec()
			.then( events => {
				// if no active events could be found
				if( events.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no active events could be found for user with id: ${ userId }` );
				}
				// resolve the promise with the events
				resolve( events );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching active events for user with id ${ userId } - ${ err }` );
				// and reject the promise
				reject();
			});
		});
};

exports.getAllActiveEvents = eventGroup => {

	return new Promise( ( resolve, reject ) => {

		keystone.list( 'Event' ).model
			.find()
			.where( 'isActive', true ) // we don't want to show inactive events
			.populate( eventGroup )
			.populate( 'address.state' )
			.exec()
			.then( events => {
				// if no active events could be found
				if( events.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no active events could be found` );
				}
				// resolve the promise with the events
				resolve( events );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching active events - ${ err }` );
				// and reject the promise
				reject();
			});
		})
	;
};

exports.getEventGroup = userType => {

	switch( userType ) {
		case 'admin'			: return 'staffAttendees';
		case 'social worker'	: return 'socialWorkerAttendees';
		case 'site visitor'		: return 'siteVisitorAttendees';
		case 'family'			: return 'familyAttendees';
		default					: return ''; // needed to show events to anonymous users
	}
}

/* fetches a random event for the sidebar, which has restrictions as to what can be shown */
exports.getRandomEvent = () => {

	return new Promise( ( resolve, reject ) => {
		// query the database for a single random active event of the appprpriate type
		keystone.list( 'Event' )
			.model
			.findRandom({
				type: { $in: [ 'MARE adoption parties & information events', 'fundraising events' ] },
				isActive: true
			}, ( err, event ) => {
				// if there was an error
				if ( err ) {
					// log the error for debugging purposes
					console.error( `error fetching random event - ${ err }` );
					// reject the promise
					return reject();
				}
				// the single random event will be the 0th element in the returned array
				const randomEvent = event ? event[ 0 ] : {}; // TODO: make sure an empty response comes back as undefined instead of an empty array
				// resolve the promise with the random event
				resolve( randomEvent );
			});
	});
};

/* event creation submitted through the agency event submission form */
exports.submitEvent = function submitEvent( req, res, next ) {
	// store the event and social worker information in a local variable
	const event			= req.body,
		  socialWorker	= req.user;

	// attempt to create the event
	const createEvent = exports.createEvent( event );

	// once the event has been successfully created
	createEvent
		.then( event => {
			// create a success flash message
			req.flash( 'success', {
				title: 'Your event has been submitted to be posted on the MARE website.',
				detail: 'Your submission will be reviewed within two business days and you will receive a notification email when your event has been posted. For additional questions contact <a href="mailto:web@mareinc.org">web@mareinc.org</a>' } );

			// set the fields to populate on the fetched event model
			const fieldsToPopulate = [ 'contact', 'address.state' ];
			// populate the Relationship fields on the event
			event.populate( fieldsToPopulate, err => {
				// if there was an error populating Relationship fields on the event
				if ( err ) {
					// log the error for debugging purposes
					console.error( `error populating the new event fields` );
				// if there were no errors populating Relationship fields on the event
				} else {
					// set default information for a staff email contact in case the real contact info can't be fetched
					let staffEmailContactInfo = {
						name: { full: 'MARE' },
						email: 'web@mareinc.org'
					};

					// fetch the email target model matching 'event created by social worker'
					const fetchEmailTarget = emailTargetMiddleware.getEmailTargetByName( 'event created by social worker' );

					fetchEmailTarget
						// fetch contact info for the staff contact for 'event created by social worker'
						.then( emailTarget => staffEmailContactMiddleware.getStaffEmailContactByEmailTarget( emailTarget.get( '_id' ), [ 'staffEmailContact' ] ) )
						// overwrite the default contact details with the returned object
						.then( staffEmailContact => staffEmailContactInfo = staffEmailContact.staffEmailContact )
						// log any errors fetching the staff email contact
						.catch( err => console.error( `error fetching email contact for event submission, default contact info will be used instead - ${ err }` ) )
						// send a notification email to MARE staff to allow them to enter the information in the old system
						.then( () => eventEmailMiddleware.sendNewEventEmailToMARE( event, socialWorker, staffEmailContactInfo ) )
						// if there was an error sending the email to MARE staff
						.catch( err => {
							// convert the event date from a date object into a readable string
							const eventDate = `${ event.startDate.getMonth() + 1 }/${ event.startDate.getDate() }/${ event.startDate.getFullYear() }`;
							// throw an error with details about what went wrong
							console.error( `error sending new event created email to MARE contact about ${ event.get( 'name' ) } on ${ eventDate } from ${ event.get( 'startTime' ) } to ${ event.get( 'endTime' ) } - ${ err }` );
						});
				}
			});
		})
		// if we're not successful in creating the event
		.catch( err => {
			// log the error for debugging purposes
			console.error( err );
			// create an error flash message
			req.flash( 'error', {
						title: 'Something went wrong while submitting your event.',
						detail: 'If this issue persists, please notify MARE at <a href="mailto:communications@mareinc.org">communications@mareinc.org</a>' } );
		})
		// execute the following regardless of whether the promises were resolved or rejected
		// TODO: this should be replaced with ES6 Promise.prototype.finally() once it's finalized, assuming we can update to the latest version of Node if we upgrade Keystone
		.then( () => {
			// reload the form to display the flash message
			res.redirect( 303, '/forms/agency-event-submission' );
		});
};

// create and save a new event model
exports.createEvent = event => {

	return new Promise( ( resolve, reject ) => {

		const Event = keystone.list( 'Event' );

		// create a new event using the form data we received
		const newEvent = new Event.model({

			name: event.name,
			type: event.eventType,
			address: {
				street1: event.street1,
				street2: event.street2,
				city: event.city,
				state: event.state,
				zipCode: event.zipCode
			},
			contactEmail: event.contactEmail,
			startDate: event.startDate,
			startTime: event.startTime,
			endDate: event.endDate,
			endTime: event.endTime,
			description: event.description,
			isActive: false,
			createdViaWebsite: true

		});

		newEvent.save( ( err, model ) => {
			// if there was an error saving the new event to the database
			if( err ) {
				// log an error for debugging purposes
				console.error( `there was an error creating the new event - ${ err }` );
				// reject the promise
				return reject();
			}

			// resolve the promise with the newly saved event model
			resolve( model );
		});
	});
};

exports.register = ( eventDetails, user ) => {

	return new Promise( ( resolve, reject ) => {
		// get the user type that is registering for an event
		let attendeeType =  exports.getEventGroup( user.userType );

		// get the event that the user is registering for
		exports.getEventById( eventDetails.eventId )
			.then( event => {

				// add the user as an attendee
				event[ attendeeType ].push( user._id );

				// if there are registered children defined
				if ( eventDetails.registeredChildren ) {
					// add them to the list of attendees
					event.childAttendees = event.childAttendees.concat( eventDetails.registeredChildren );
				}

				// if there are unregistered children defined
				if ( eventDetails.unregisteredChildren ) {
					// add them to the list of attendees
					event.unregisteredChildAttendees = event.unregisteredChildAttendees.concat( eventDetails.unregisteredChildren );
				}

				// if there are unregistered adults defined
				if ( eventDetails.unregisteredAdults ) {
					// add them to the list of attendees
					event.unregisteredAdultAttendees = event.unregisteredAdultAttendees.concat( eventDetails.unregisteredAdults );
				}

				// save the updated event
				event.save( error => {

					if ( error ) {

						console.error( `error saving an update to event ${ event._id } - ${ error }` );
						reject( error );
					} else {

						resolve();
					}
				});
			})
			.catch( error => {

				console.error( `error registering user ${ user._id } for event ${ eventDetails.eventId } - ${ error }` );
				reject( error );
			});
	});
};

exports.unregister = ( eventDetails, user ) => {

	let unregistrationData;

	return new Promise( ( resolve, reject ) => {
		// get the user type that is unregistering for an event
		let attendeeType =  exports.getEventGroup( user.userType );

		// get the event that the user is registering for
		exports.getEventById( eventDetails.eventId )
			// remove the attendee from the event
			.then( event => {

				// get the index of the attendee to be removed
				let indexOfAttendee = event[ attendeeType ].indexOf( user._id );
				// splice the attendee from the list
				event[ attendeeType ].splice( indexOfAttendee, 1 );

				return event;
			})
			// remove any registered children attendees ( if applicable )
			.then( event => {

				if ( user.userType === 'social worker' ) {
					return exports.removeRegisteredChildren( event, user._id );
				} else {
					return { eventModel: event };
				}
			})
			.then( data => unregistrationData = data )
			.catch( err => console.error( `error removing registered children from event with id ${ eventDetails.eventId } - ${ err }` ) )
			// remove any unregistered child attendees
			.then( () => exports.removeUnregisteredChildren( unregistrationData.eventModel, user._id ) )
			.then( data => unregistrationData.unregisteredChildrenRemoved = data )
			.catch( err => console.error( `error removing unregistered children from event with id ${ eventDetails.eventId } - ${ err }` ) )
			// remove any unregistered adult attendees
			.then( () => exports.removeUnregisteredAdults( unregistrationData.eventModel, user._id ) )
			.then( data => unregistrationData.unregisteredAdultsRemoved = data )
			.catch( err => console.error( `error removing unregistered adults from event with id ${ eventDetails.eventId } - ${ err }` ) )
			// save the updated event
			.then( () => {

				// save the updated event
				unregistrationData.eventModel.save( error => {

					if ( error ) {
						// reject the promise with details of what went wrong
						reject( `error unregistering user ${ user._id } from event ${ eventDetails.eventId } - ${ error }` );
					} else {

						resolve({
							registeredChildrenRemoved: unregistrationData.registeredChildrenRemoved,
							unregisteredChildrenRemoved: unregistrationData.unregisteredChildrenRemoved,
							unregisteredAdultsRemoved: unregistrationData.unregisteredAdultsRemoved
						});
					}
				});
			})
			.catch( error => {
				// reject the promise with details about the error
				reject( `error unregistering user ${ user._id } for event ${ eventDetails.eventId } - ${ error }` );
			});
	});
};

exports.removeRegisteredChildren = ( event, registrantID ) => {

	return new Promise( ( resolve, reject ) => {
		// populate the registered children attendees of the event and remove any children that were signed up by the social worker that is unregistering for the event
		event.populate( 'childAttendees', error => {

			if ( error ) {
				// reject the promise with information about the error
				reject( `error populating the child attendees of event ${ event._id } - ${ error }` );
			} else {

				let registeredChildrenToRemoveIndexes = [];
				let registeredChildrenRemoved = [];

				// capture all registered children ( and their indexes ) that were signed up by the social worker that is unregistering
				event.childAttendees.forEach( ( child, index ) => {

					if ( child.adoptionWorker && ( registrantID.id === child.adoptionWorker.id || registrantID.id === child.recruitmentWorker.id ) ) {

						registeredChildrenToRemoveIndexes.push( index );
						registeredChildrenRemoved.push( child );
					}
				});

				// reverse the registeredChildrenToRemoveIndexes array to prevent the splicing process from messing with the array indexes
				registeredChildrenToRemoveIndexes.reverse();
				// remove each registered child from the list of child attendees
				registeredChildrenToRemoveIndexes.forEach( indexOfChild => {

					event.childAttendees.splice( indexOfChild, 1 );
				});

				resolve({
					eventModel: event,
					registeredChildrenRemoved
				});
			}
		});
	});
};

exports.removeUnregisteredChildren = ( event, registrantID ) => {

	// remove the unregistered children attendees of the event that were signed up by the user that is unregistering for the event
	let unregisteredChildrenToRemoveIndexes = [];
	let unregisteredChildrenRemoved = [];

	// capture all unregistered children ( and their indexes ) that were signed up by the user that is unregistering
	event.unregisteredChildAttendees.forEach( ( child, index ) => {

		if ( registrantID.toString() === child.registrantID ) {

			unregisteredChildrenToRemoveIndexes.push( index );
			unregisteredChildrenRemoved.push( child );
		}
	});

	// reverse the unregisteredChildrenToRemoveIndexes array to prevent the splicing process from messing with the array indexes
	unregisteredChildrenToRemoveIndexes.reverse();
	// remove each unregistered child from the list of child attendees
	unregisteredChildrenToRemoveIndexes.forEach( indexOfChild => {

		event.unregisteredChildAttendees.splice( indexOfChild, 1 );
	});

	return unregisteredChildrenRemoved;
};

exports.removeUnregisteredAdults = ( event, registrantID ) => {

	// remove the unregistered adult attendees of the event that were signed up by the user that is unregistering for the event
	let unregisteredAdultsToRemoveIndexes = [];
	let unregisteredAdultsRemoved = [];

	// capture all unregistered adult ( and their indexes ) that were signed up by the user that is unregistering
	event.unregisteredAdultAttendees.forEach( ( adult, index ) => {

		if ( registrantID.toString() === adult.registrantID ) {

			unregisteredAdultsToRemoveIndexes.push( index );
			unregisteredAdultsRemoved.push( adult );
		}
	});

	// reverse the unregisteredAdultsToRemoveIndexes array to prevent the splicing process from messing with the array indexes
	unregisteredAdultsToRemoveIndexes.reverse();
	// remove each unregistered adult from the list of adult attendees
	unregisteredAdultsToRemoveIndexes.forEach( indexOfChild => {

		event.unregisteredAdultAttendees.splice( indexOfChild, 1 );
	});

	return unregisteredAdultsRemoved;
};

/* returns an array of staff email contacts */
exports.getEventStaffContactInfo = emailTarget => {

	return new Promise( ( resolve, reject ) => {
		// if the email target was unrecognized, the email target can't be set
		if( !emailTarget ) {
			// reject the promise with details of the issue
			return reject( `no event email target provided` );
		}
		// TODO: it was nearly impossible to create a readable comma separated list of links in the template with more than one address,
		// 	     so we're only fetching one contact when we should fetch them all
		// get the database id of the admin contact set to handle registration questions for the email target
		emailTargetMiddleware
			.getTargetId( emailTarget )
			.then( targetId => {
				// get the contact details of the admin contact set to handle registration questions for the email target
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
};

/*
 *	frontend services
 */
// exports.addUser = ( req, res, next ) => {

// 	const userId	= req.user.get( '_id' ),
// 		  userName	= req.user.get( 'name.full' ),
// 		  userType	= req.user.get( 'userType' ),
// 		  eventId	= req.body.eventId;

// 	// fetch the field the user should be added to based on their user type
// 	const eventGroup = exports.getEventGroup( userType );
// 	// fetch the event the user should be added to
// 	let fetchEvent = exports.getEventById( eventId );

// 	fetchEvent
// 		.then( event => {
// 			// get the array of user IDs already in the field the user should be added to, and get the index of the user
// 			const attendees	= event.get( eventGroup ),
// 				  userIndex	= attendees.indexOf( userId );
// 			// if the user is not already added
// 			if( userIndex === -1 ) {
// 				// add them to the attendees list
// 				attendees.push( userId );
// 				// save the updated event model to the database
// 				event.save();
// 				// construct useful data for needed UI updates
// 				var responseData = {
// 					success: true,
// 					action: 'register',
// 					name: userName,
// 					group: userType
// 				};
// 				// send the response data base to the user as JSON
// 				res.json( responseData );

// 			} else {
// 				// construct useful data for needed UI updates
// 				var responseData = {
// 					success: false,
// 					action: 'register',
// 					message: 'You are already attending that event'
// 				};
// 				// send the response data base to the user as JSON
// 				res.json( responseData );
// 			}
// 		})
// 		.catch( () => {
// 			// log an error for debugging purposes
// 			console.error( `there was an error adding the user to the event with id ${ req.body.eventId }` );

// 			// construct useful data for needed UI updates
// 			var responseData = {
// 				success: false,
// 				action: 'register',
// 				message: 'An error occurred when adding you to the event'
// 			};
// 			// send the response data base to the user as JSON
// 			res.json( responseData );
// 		});
// };

// exports.removeUser = ( req, res, next ) => {

// 	const locals	= res.locals,
// 		  userId	= req.user.get( '_id' ),
// 		  userName	= req.user.get( 'name.full' ),
// 		  userType	= req.user.get( 'userType' ),
// 		  eventId	= req.body.eventId;

// 	// fetch the field the user should be added to based on their user type
// 	const eventGroup = exports.getEventGroup( userType );
// 	// fetch the event the user should be added to
// 	let fetchEvent = exports.getEventById( eventId );

// 	fetchEvent
// 		.then( event => {
// 			// get the array of user IDs already in the field the user should be added to, and get the index of the user
// 			const attendees	= event.get( eventGroup ),
// 				userIndex	= attendees.indexOf( userId );

// 			// if the user exists in the group
// 			if(userIndex !== -1) {
// 				// remove them from the attendees list
// 				attendees.splice( userIndex, 1 );
// 				// save the updated event model
// 				event.save();
// 				// construct useful data for needed UI updates
// 				var responseData = {
// 					success: true,
// 					action: 'unregister',
// 					name: userName,
// 					group: userType
// 				};
// 				// send the response data base to the user as JSON
// 				res.json( responseData );

// 			} else {
// 				// construct useful data for needed UI updates
// 				var responseData = {
// 					success: false,
// 					action: 'unregister',
// 					message: 'You have already been removed from that event'
// 				};
// 				// send the response data base to the user as JSON
// 				res.json( responseData );
// 			}
// 		})
// 		.catch( () => {
// 			// log an error for debugging purposes
// 			console.error( `there was an error removing the user from the event with id ${ req.body.eventId }` );

// 			// construct useful data for needed UI updates
// 			var responseData = {
// 				success: false,
// 				action: 'register',
// 				message: 'An error occurred when removing you from the event'
// 			};
// 			// send the response data base to the user as JSON
// 			res.json( responseData );
// 		});
// };
