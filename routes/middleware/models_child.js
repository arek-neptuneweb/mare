var keystone 	        = require( 'keystone' ),
	_			        = require( 'underscore' ),
	moment		        = require( 'moment' ),
	async		        = require( 'async' ),
    UtilitiesMiddleware	= require('./utilities');

/* takes in an array of child ids and returns an array of their registration numbers */
exports.getRegistrationNumbersById = ( idsArray, registrationNumbersArray, done ) => {

    keystone.list( 'Child' ).model.find()
            .where( '_id' ).in( idsArray )
            .exec()
            .then( children => {

                for( child of children ) {
                    registrationNumbersArray.push( child.get( 'registrationNumber' ) );
                };

                done();
            }, err => {

                console.log( err );

				done();
            });
};

/* takes in an array of child ids and returns an array of their first names */
exports.getFirstNamesById = ( idsArray, namesArray, done ) => {

    keystone.list( 'Child' ).model.find()
            .where( '_id' ).in( idsArray )
            .exec()
            .then( children => {

                for( child of children ) {
                    namesArray.push( child.name.first );
                };

                done();
            }, err => {

                console.log( err );

				done();
            });
};

/* updates sibling fields for chidren listed as siblings by adding missing entries */
exports.updateMySiblings = ( mySiblings, childId, done ) => {

	// Fetch all siblings who were added
	keystone.list( 'Child' ).model.find()
			.where( '_id' ).in( Array.from( mySiblings ) )
			.exec()
			.then( ( siblings ) => {

                // loop through each added sibling
				_.each( siblings, ( child ) => {
                    // store the childs current sibling as an array of strings
                    const currentSiblingsArray = child.siblings ? child.siblings.map( sibling => sibling.toString() ) : [];
                    // convert the array to a set
                    const currentSiblings = new Set( currentSiblingsArray );
                    // get the id of the current child in the loop we need to update
                    const targetChildId = child.get('_id').toString();
                    // copy the original siblings into a set to prevent changes from affecting mySiblings, and to prevent duplicates
                    let newSiblings = new Set( [ ...mySiblings ] );
                    // add the current child in the loop to the set
                    newSiblings.add( childId );
                    // remove the current child in the loop because we don't want to add him/her as a sibling of himself/herself
                    newSiblings.delete( targetChildId );       
                    // create a set of the siblings to add, derived from looking at which siblings are already included
                    const siblingsToAdd = currentSiblings.rightOuterJoin( newSiblings );
                    // if there are siblings to add to the child
					if( siblingsToAdd.size > 0 ) {
                        // add any new siblings to the child
						child.siblings.push( ...siblingsToAdd );
                        // save the child
						child.save();
					}
				});

				done();
			// TODO: Update all error messages to make it clear what action failed (THIS IS A UNIVERSAL CHANGE)
			}, ( err ) => {

				console.log( err );
				done();
			});
};

exports.updateMyRemainingSiblings = ( remainingSiblings, removedSiblings, childId, done ) => {

    // Fetch all siblings who remain after siblings have been removed from the target child ( childId )
    keystone.list( 'Child' ).model.find()
            .where( '_id' ).in( Array.from( remainingSiblings ) )
            .exec()
            .then( ( siblings ) => {
                // loop through each added sibling
				_.each( siblings, ( child ) => {
                    const targetChildId = child.get('_id').toString();
                    // store the childs current sibling as an array of strings
                    const currentSiblingsArray = child.siblings ? child.siblings.map( sibling => sibling.toString() ) : [];
                    // convert the array to a set
                    const currentSiblings = new Set( currentSiblingsArray );    
                    // create a set of the siblings to add, derived from looking at which siblings are already included
                    const siblingsToRemove = currentSiblings.intersection( removedSiblings );
                    // if the child has any siblings
                    if( siblingsToRemove.size > 0 ) {
                        // create a set of the remaining siblings after removing the children who don't belong
                        const remainingChildren = currentSiblings.leftOuterJoin( siblingsToRemove );
                        // remove all siblings from the child
                        child.siblings = [ ...remainingChildren ];
                        // save the child
                        child.save();
                    }
                });

                done();
            // TODO: Update all error messages to make it clear what action failed (THIS IS A UNIVERSAL CHANGE)
            }, ( err ) => {

                console.log( err );
                done();
            });
};

exports.updateMyRemovedSiblings = ( allSiblings, removedSiblings, childId, done ) => {

    // Fetch all siblings who were removed from the target child ( childId )
    keystone.list( 'Child' ).model.find()
            .where( '_id' ).in( Array.from( removedSiblings ) )
            .exec()
            .then( ( siblings ) => {
                // loop through each added sibling
				_.each( siblings, ( child ) => {
                    // store the childs current sibling as an array of strings
                    const currentSiblingsArray = child.siblings ? child.siblings.map( sibling => sibling.toString() ) : [];
                    // convert the array to a set
                    const currentSiblings = new Set( currentSiblingsArray );
                    // get the id of the current child in the loop we need to update
                    const targetChildId = child.get('_id').toString();
                    // copy the original siblings into a set to prevent changes from affecting removedSiblings, and to prevent duplicates
                    let deletedSiblings = new Set( [ ...allSiblings ] );
                    // add the current child in the loop to the set
                    deletedSiblings.add( childId );
                    // remove the current child in the loop because we don't want to add him/her as a sibling of himself/herself
                    deletedSiblings.delete( targetChildId );       
                    // create a set of the siblings to add, derived from looking at which siblings are already included
                    const siblingsToRemove = currentSiblings.intersection( deletedSiblings );
                    // if the child has any siblings
                    if( siblingsToRemove.size > 0 ) {
                        // create a set of the remaining siblings after removing the children who don't belong
                        const remainingChildren = currentSiblings.leftOuterJoin( siblingsToRemove );
                        // remove all siblings from the child
                        child.siblings = [ ...remainingChildren ];
                        // save the child
                        child.save();
                    }
                });

                done();
            // TODO: Update all error messages to make it clear what action failed (THIS IS A UNIVERSAL CHANGE)
            }, ( err ) => {

                console.log( err );
                done();
            });
};

/* updates sibling fields for chidren listed as siblings by adding missing entries */
exports.updateMySiblingsToBePlacedWith = ( mySiblings, childId, groupProfile, siblingGroupImage, siblingGroupVideo, done ) => {

    // create the group profile object based on what was passed in
    const newGroupProfile = groupProfile || {};
    const newGroupProfilePart1 = groupProfile.part1 || '';
    const newGroupProfilePart2 = groupProfile.part2 || '';
    const newGroupProfilePart3 = groupProfile.part3 || '';

	// Fetch all siblings who were added
	keystone.list( 'Child' ).model.find()
			.where( '_id' ).in( Array.from( mySiblings ) )
			.exec()
			.then( ( siblings ) => {

                // loop through each added sibling
				_.each( siblings, ( child ) => {
                    // store the childs current sibling as an array of strings
                    const currentSiblingsArray = child.siblingsToBePlacedWith ? child.siblingsToBePlacedWith.map( sibling => sibling.toString() ) : [];
                    // convert the array to a set
                    const currentSiblings = new Set( currentSiblingsArray );
                    // get the id of the current child in the loop we need to update
                    const targetChildId = child.get('_id').toString();
                    // copy the original siblings into a set to prevent changes from affecting mySiblings, and to prevent duplicates
                    let newSiblings = new Set( [ ...mySiblings ] );
                    // add the current child in the loop to the set
                    newSiblings.add( childId );
                    // remove the current child in the loop because we don't want to add him/her as a sibling of himself/herself
                    newSiblings.delete( targetChildId );       
                    // create a set of the siblings to add, derived from looking at which siblings are already included
                    const siblingsToAdd = currentSiblings.rightOuterJoin( newSiblings );
					// ensures that the group profile object exists
					child.groupProfile = child.groupProfile || {};
                    // if there are siblings to add to the child
					if( siblingsToAdd.size > 0 ||
						child.groupProfile.part1 !== groupProfile.part1 ||
						child.groupProfile.part2 !== groupProfile.part2 ||
						child.groupProfile.part3 !== groupProfile.part3 ||
                        child.siblingGroupImage.secure_url !== siblingGroupImage.secure_url ||
                        child.siblingGroupVideo !== siblingGroupVideo ) {
                        // TODO: possibly simplify this with an Object.assign
                        // update the child to be placed with with the shared bio information
                        child.groupProfile.part1   	= newGroupProfilePart1;
                        child.groupProfile.part2	= newGroupProfilePart2;
                        child.groupProfile.part3	= newGroupProfilePart3;
                        // update the child to be placed with with the group image and video
                        child.siblingGroupImage  = Object.assign( {}, siblingGroupImage );
                        child.siblingGroupVideo     = siblingGroupVideo;
                        // add any new siblings to the child
                        child.siblingsToBePlacedWith.push( ...siblingsToAdd );
                        // save the child
                        child.save();
					}
				});

				done();
			// TODO: Update all error messages to make it clear what action failed (THIS IS A UNIVERSAL CHANGE)
			}, ( err ) => {

				console.log( err );
				done();
			});
};

exports.updateMyRemainingSiblingsToBePlacedWith = ( remainingSiblings, removedSiblings, childId, done ) => {

    // Fetch all siblings who remain after siblings have been removed from the target child ( childId )
    keystone.list( 'Child' ).model.find()
            .where( '_id' ).in( Array.from( remainingSiblings ) )
            .exec()
            .then( ( siblings ) => {
                // loop through each added sibling
				_.each( siblings, ( child ) => {
                    const targetChildId = child.get('_id').toString();
                    // store the childs current sibling as an array of strings
                    const currentSiblingsArray = child.siblingsToBePlacedWith ? child.siblingsToBePlacedWith.map( sibling => sibling.toString() ) : [];
                    // convert the array to a set
                    const currentSiblings = new Set( currentSiblingsArray );    
                    // create a set of the siblings to add, derived from looking at which siblings are already included
                    const siblingsToRemove = currentSiblings.intersection( removedSiblings );
                    // if the child has any siblings
                    if( siblingsToRemove.size > 0 ) {
                        // create a set of the remaining siblings after removing the children who don't belong
                        const remainingChildren = currentSiblings.leftOuterJoin( siblingsToRemove );
                        // remove all siblings from the child
                        child.siblingsToBePlacedWith = [ ...remainingChildren ];
                        // save the child
                        child.save();
                    }
                });

                done();
            // TODO: Update all error messages to make it clear what action failed (THIS IS A UNIVERSAL CHANGE)
            }, ( err ) => {

                console.log( err );
                done();
            });
};

exports.updateMyRemovedSiblingsToBePlacedWith = ( allSiblings, removedSiblings, childId, done ) => {

    // Fetch all siblings who were removed from the target child ( childId )
    keystone.list( 'Child' ).model.find()
            .where( '_id' ).in( Array.from( removedSiblings ) )
            .exec()
            .then( ( siblings ) => {
                // loop through each added sibling
				_.each( siblings, ( child ) => {
                    // store the childs current sibling as an array of strings
                    const currentSiblingsArray = child.siblingsToBePlacedWith ? child.siblingsToBePlacedWith.map( sibling => sibling.toString() ) : [];
                    // convert the array to a set
                    const currentSiblings = new Set( currentSiblingsArray );
                    // get the id of the current child in the loop we need to update
                    const targetChildId = child.get('_id').toString();
                    // copy the original siblings into a set to prevent changes from affecting removedSiblings, and to prevent duplicates
                    let deletedSiblings = new Set( [ ...allSiblings ] );
                    // add the current child in the loop to the set
                    deletedSiblings.add( childId );
                    // remove the current child in the loop because we don't want to add him/her as a sibling of himself/herself
                    deletedSiblings.delete( targetChildId );       
                    // create a set of the siblings to add, derived from looking at which siblings are already included
                    const siblingsToRemove = currentSiblings.intersection( deletedSiblings );
                    // if the child has any siblings
                    if( siblingsToRemove.size > 0 ) {
                        // create a set of the remaining siblings after removing the children who don't belong
                        const remainingChildren = currentSiblings.leftOuterJoin( siblingsToRemove );
                        // remove all siblings from the child
                        child.siblingsToBePlacedWith = [ ...remainingChildren ];
                        // save the child
                        child.save();
                    }
                });

                done();
            // TODO: Update all error messages to make it clear what action failed (THIS IS A UNIVERSAL CHANGE)
            }, ( err ) => {

                console.log( err );
                done();
            });
};