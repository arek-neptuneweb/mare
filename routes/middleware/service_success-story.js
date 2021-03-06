const keystone	= require( 'keystone' ),
	  async		= require( 'async' ),
	  Utils		= require( './utilities' );

exports.getRandomStory = () => {

	return new Promise( ( resolve, reject ) => {
		// use a function added to the Success Story model to find a single random story
		keystone.list( 'Success Story' )
			.model
			.findRandom( ( err, successStory ) => {
				// if there was an error
				if ( err ) {
					// log the error for debugging purposes
					console.error( `error fetching random success story - ${ err }` );
					// reject the promise
					return reject();
				}
				// if there was no error, resolve the promise with the returned success story
				resolve( successStory );
			});
	});
};

exports.getAllSuccessStories = () => {

	return new Promise( ( resolve, reject ) => {
		// use a function added to the Success Story model to find a single random story
		keystone.list( 'Success Story' ).model
			.find()
			.exec()
			.then( successStories => {
				// if no success stories could not be found
				if( successStories.length === 0 ) {
					// log an error for debugging purposes
					console.error( `no success stories could be found` );
					// reject the promise
					return reject();
				}
				// if success stories were returned, resolve with the array
				resolve( successStories );
			// if an error was encountered fetching from the database
			}, err => {
				// log the error for debugging purposes
				console.error( `error fetching all success stories - ${ err }` );
				// reject the promise
				reject();
			});
	});
};

exports.getSuccessStoryByKey = key => {

	return new Promise( ( resolve, reject ) => {
		// attempt to find a single success story matching the passed in key
		keystone.list( 'Success Story' ).model
			.findOne()
			.where( 'key', key )
			.exec()
			.then( successStory => {
				// if the target success story could not be found
				if( !successStory ) {
					// log an error for debugging purposes
					console.error( `no success story matching key '${ key } could be found` );
				}
				// if the target success story was found, resolve the promise with the success story
				resolve( successStory );
			// if there was an error fetching from the database
			}, err => {
				// log an error for debugging purposes
				console.error( `error fetching success story matching key ${ key } - ${ err }` );
				// and reject the promise
				reject();
			});
		});
};