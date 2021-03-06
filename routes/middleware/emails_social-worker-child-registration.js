const keystone				= require( 'keystone' ),
	  utilitiesMiddleware   = require( './utilities' );

exports.sendNewSocialWorkerChildRegistrationNotificationEmailToMARE = ( rawChildData, child, registrationStaffContact ) => {

	return new Promise( ( resolve, reject ) => {
		// if sending of the email is not currently allowed
		if( process.env.SEND_SOCIAL_WORKER_CHILD_REGISTRATION_EMAILS_TO_MARE !== 'true' ) {
			// reject the promise with information about why
			return reject( `sending of the email is disabled` );
		}

		if( !registrationStaffContact ) {
			return reject( `no staff contact was provided` );
		}

		// arrays was used instead of a Maps because Mustache templates apparently can't handle Maps
		let childData = [],
			additionalChildData = [],
			languagesArray = [],
			raceArray = [],
			recommendedFamilyConstellationArray = [],
			otherFamilyConstellationConsiderationArray = [],
			disabilitiesArray = [];

		// loop through each language model which was populated when the user model was fetched
		for( let entry of child.languages ) {
			// extract the text values associated with the model into the array
			languagesArray.push( entry.language );
		}
		// loop through each race model which was populated when the user model was fetched
		for( let entry of child.race ) {
			// extract the text values associated with the model into the array
			raceArray.push( entry.race );
		}
		// loop through each recommended family constellation model which was populated when the user model was fetched
		for( let entry of child.recommendedFamilyConstellation ) {
			// extract the text values associated with the model into the array
			recommendedFamilyConstellationArray.push( entry.familyConstellation );
		}
		// loop through each other gamily constellation consideration model which was populated when the user model was fetched
		for( let entry of child.otherFamilyConstellationConsideration ) {
			// extract the text values associated with the model into the array
			otherFamilyConstellationConsiderationArray.push( entry.otherFamilyConstellationConsideration );
		}
		// loop through each disability model which was populated when the user model was fetched
		for( let entry of child.disabilities ) {
			// extract the text values associated with the model into the array
			disabilitiesArray.push( entry.disability );
		}
		// store only the fields that have been populated by the user
		if( child.registrationDate ) {
			// extract the text values associated with the model into the array
			childData.push( {
				key: 'registration date',
				value: `${ child.registrationDate.getMonth() + 1 }/${ child.registrationDate.getDate() }/${ child.registrationDate.getFullYear() }`
			});
		}

		if( child.name.first ) {
			childData.push( {
				key: 'first name',
				value: child.name.first
			});
		}

		if( child.name.last ) {
			childData.push( {
				key: 'last name',
				value: child.name.last
			});
		}

		if( child.name.alias ) {
			childData.push( {
				key: 'alias',
				value: child.name.alias
			});
		}

		if( child.name.nickName ) {
			childData.push( {
				key: 'nick name',
				value: child.name.nickName
			});
		}

		if( child.birthDate ) {
			childData.push( {
				key: 'date of birth',
				value: `${ child.birthDate.getMonth() + 1 }/${ child.birthDate.getDate() }/${ child.birthDate.getFullYear() }`
			});
		}

		if( languagesArray.length !== 0 ) {
			childData.push( {
				key: 'languages spoken',
				value: languagesArray.join( ', ' )
			});
		}

		if( child.status ) {
			childData.push( {
				key: 'status',
				value: child.status.childStatus
			});
		}

		if( child.gender ) {
			childData.push( {
				key: 'gender',
				value: child.gender.gender
			});
		}

		if( raceArray.length !== 0 ) {
			childData.push( {
				key: 'race',
				value: raceArray.join( ', ' )
			});
		}

		if( child.legalStatus ) {
			childData.push( {
				key: 'legal status',
				value: child.legalStatus.legalStatus
			});
		}

		if( child.yearEnteredCare ) {
			childData.push( {
				key: 'year entered care',
				value: child.yearEnteredCare
			});
		}

		if( child.hasContactWithSiblings ) {
			childData.push( {
				key: 'has contact with siblings',
				value: child.hasContactWithSiblings
			});
		}

		if( child.siblingTypeOfContact ) {
			childData.push( {
				key: 'type of contact with siblings',
				value: child.siblingTypeOfContact
			});
		}

		if( child.hasContactWithBirthFamily ) {
			childData.push( {
				key: 'has contact with birth family',
				value: child.hasContactWithBirthFamily
			});
		}

		if( child.birthFamilyTypeOfContact ) {
			childData.push( {
				key: 'type of contact with birth family',
				value: child.birthFamilyTypeOfContact
			});
		}

		if( child.residence ) {
			childData.push( {
				key: 'residence',
				value: child.residence.residence
			});
		}

		childData.push( {
			key: 'lives in MA',
			value: !child.isOutsideMassachusetts ? 'yes' : 'no'
		});

		if( !child.isOutsideMassachusetts && child.city ) {
			childData.push( {
				key: 'city',
				value: child.city.cityOrTown
			});
		}

		if( child.isOutsideMassachusetts && child.cityText ) {
			childData.push( {
				key: 'city',
				value: child.cityText
			});
		}

		if( child.careFacilityName ) {
			childData.push( {
				key: 'care facility name',
				value: child.careFacilityName
			});
		}

		if( child.physicalNeedsDescription ) {
			childData.push( {
				key: 'description of physical needs',
				value: child.physicalNeedsDescription
			});
		}

		if( child.emotionalNeedsDescription ) {
			childData.push( {
				key: 'description of emotional needs',
				value: child.emotionalNeedsDescription
			});
		}

		if( child.intellectualNeedsDescription ) {
			childData.push( {
				key: 'description of intellectual needs',
				value: child.intellectualNeedsDescription
			});
		}

		if( child.socialNeedsDescription ) {
			childData.push( {
				key: 'description of social needs',
				value: child.socialNeedsDescription
			});
		}

		if( child.aspirations ) {
			childData.push( {
				key: 'aspirations',
				value: child.aspirations
			});
		}

		if( child.schoolLife ) {
			childData.push( {
				key: 'school life',
				value: child.schoolLife
			});
		}

		if( child.familyLife ) {
			childData.push( {
				key: 'family life',
				value: child.familyLife
			});
		}

		if( child.personality ) {
			childData.push( {
				key: 'personality',
				value: child.personality
			});
		}

		if( child.otherRecruitmentConsiderations ) {
			childData.push( {
				key: 'other recruitment considerations',
				value: child.otherRecruitmentConsiderations
			});
		}

		if( recommendedFamilyConstellationArray.length !== 0 ) {
			childData.push( {
				key: 'recommended family constellations',
				value: recommendedFamilyConstellationArray.join( ', ' )
			});
		}

		if( otherFamilyConstellationConsiderationArray.length !== 0 ) {
			childData.push( {
				key: 'other family constellation considerations',
				value: otherFamilyConstellationConsiderationArray.join( ', ' )
			});
		}

		if( disabilitiesArray.length !== 0 ) {
			childData.push( {
				key: 'disabilities',
				value: disabilitiesArray.join( ', ' )
			});
		}

		if( rawChildData.otherEthnicBackground ) {
			additionalChildData.push( {
				key: `other information about child's ethnic background`,
				value: rawChildData.otherEthnicBackground
			})
		}
		
		if( rawChildData.childInvalidFamilyConstellationReason ) {
			additionalChildData.push( {
				key: 'reason same-sex couples should not be considered',
				value: rawChildData.childInvalidFamilyConstellationReason
			})
		}
		
		if( rawChildData.recruitmentWorker ) {
			additionalChildData.push( {
				key: 'recruitment worker',
				value: rawChildData.recruitmentWorker
			})
		}
		
		if( rawChildData.recruitmentWorkerAgency ) {
			additionalChildData.push( {
				key: 'recruitment worker agency',
				value: rawChildData.recruitmentWorkerAgency
			})
		}
		
		if( rawChildData.recruitmentWorkerEmail ) {
			additionalChildData.push( {
				key: 'recruitment worker email',
				value: rawChildData.recruitmentWorkerEmail
			})
		}
		
		if( rawChildData.recruitmentWorkerPhone ) {
			additionalChildData.push( {
				key: 'recruitment worker phone',
				value: rawChildData.recruitmentWorkerPhone
			})
		}
		
		if( rawChildData.adoptionWorker ) {
			additionalChildData.push( {
				key: 'adoption worker',
				value: rawChildData.adoptionWorker
			})
		}
		
		if( rawChildData.adoptionWorkerAgency ) {
			additionalChildData.push( {
				key: 'adoption worker agency',
				value: rawChildData.adoptionWorkerAgency
			})
		}
		
		if( rawChildData.adoptionWorkerEmail ) {
			additionalChildData.push( {
				key: 'adoption worker email',
				value: rawChildData.adoptionWorkerEmail
			})
		}
		
		if( rawChildData.adoptionWorkerPhone ) {
			additionalChildData.push( {
				key: 'adoption worker phone',
				value: rawChildData.adoptionWorkerPhone
			})
		}

		// create a list of all the fields that need to be manually updated in the new system
		const fieldsToUpdate = [
			'site visibility',
			'is visible in gallery',
			'registered by',
			'physical needs',
			'emotional needs',
			'intellectual needs',
			'social needs',
			'siblings',
			'siblings to be placed with',
			'adoption worker',
			'recruitment worker'
		];

		// the email template can be found in templates/emails/
		new keystone.Email({
			templateExt		: 'hbs',
			templateEngine 	: require( 'handlebars' ),
			templateName 	: 'social-worker-new-child-notification-to-mare'
		}).send({
			to				: registrationStaffContact.email,
			from: {
				name 	: 'MARE',
				email 	: 'admin@adoptions.io'
			},
			subject		: `new social worker child registration`,
			childData,
			additionalChildData,
			fieldsToUpdate

		}, ( err, message ) => {
			// if there was an error sending the email
			if( err ) {
				// reject the promise with details
				return reject( `error sending new social worker child registration notification email to MARE - ${ err }` );
			}
			// the response object is stored as the 0th element of the returned message
			const response = message ? message[ 0 ] : undefined;
			// if the email failed to send, or an error occurred ( which it does, rarely ) causing the response message to be empty
			if( response && [ 'rejected', 'invalid', undefined ].includes( response.status ) ) {
				// reject the promise with details
				return reject( `error sending new social worker child registration notification email to MARE - ${ response.status } - ${ response.email } - ${ response.reject_reason } - ${ err }` );
			}

			resolve();
		});
	});
};

exports.sendNewSocialWorkerChildRegistrationNotificationEmailToSocialWorker = ( rawChildData, child, socialWorkerEmail, host ) => {

	return new Promise( ( resolve, reject ) => {
		// if sending of the email is not currently allowed
		if( process.env.SEND_SOCIAL_WORKER_CHILD_REGISTRATION_EMAILS_TO_SOCIAL_WORKER !== 'true' ) {
			// reject the promise with information about why
			return reject( `sending of the email is disabled` );
		}

		if( !socialWorkerEmail ) {
			return reject( `no social worker email was provided` );
		}

		// arrays was used instead of a Maps because Mustache templates apparently can't handle Maps
		let childData = [],
			additionalChildData = [],
			languagesArray = [],
			raceArray = [],
			recommendedFamilyConstellationArray = [],
			otherFamilyConstellationConsiderationArray = [],
			disabilitiesArray = [];

		// loop through each language model which was populated when the user model was fetched
		for( let entry of child.languages ) {
			// extract the text values associated with the model into the array
			languagesArray.push( entry.language );
		}
		// loop through each race model which was populated when the user model was fetched
		for( let entry of child.race ) {
			// extract the text values associated with the model into the array
			raceArray.push( entry.race );
		}
		// loop through each recommended family constellation model which was populated when the user model was fetched
		for( let entry of child.recommendedFamilyConstellation ) {
			// extract the text values associated with the model into the array
			recommendedFamilyConstellationArray.push( entry.familyConstellation );
		}
		// loop through each other gamily constellation consideration model which was populated when the user model was fetched
		for( let entry of child.otherFamilyConstellationConsideration ) {
			// extract the text values associated with the model into the array
			otherFamilyConstellationConsiderationArray.push( entry.otherFamilyConstellationConsideration );
		}
		// loop through each disability model which was populated when the user model was fetched
		for( let entry of child.disabilities ) {
			// extract the text values associated with the model into the array
			disabilitiesArray.push( entry.disability );
		}
		// store only the fields that have been populated by the user
		if( child.registrationDate ) {
			// extract the text values associated with the model into the array
			childData.push( {
				key: 'registration date',
				value: `${ child.registrationDate.getMonth() + 1 }/${ child.registrationDate.getDate() }/${ child.registrationDate.getFullYear() }`
			});
		}

		if( child.name.first ) {
			childData.push( {
				key: 'first name',
				value: child.name.first
			});
		}

		if( child.name.last ) {
			childData.push( {
				key: 'last name',
				value: child.name.last
			});
		}

		if( child.name.alias ) {
			childData.push( {
				key: 'alias',
				value: child.name.alias
			});
		}

		if( child.name.nickName ) {
			childData.push( {
				key: 'nick name',
				value: child.name.nickName
			});
		}

		if( child.birthDate ) {
			childData.push( {
				key: 'date of birth',
				value: `${ child.birthDate.getMonth() + 1 }/${ child.birthDate.getDate() }/${ child.birthDate.getFullYear() }`
			});
		}

		if( languagesArray.length !== 0 ) {
			childData.push( {
				key: 'languages spoken',
				value: languagesArray.join( ', ' )
			});
		}

		if( child.status ) {
			childData.push( {
				key: 'status',
				value: child.status.childStatus
			});
		}

		if( child.gender ) {
			childData.push( {
				key: 'gender',
				value: child.gender.gender
			});
		}

		if( raceArray.length !== 0 ) {
			childData.push( {
				key: 'race',
				value: raceArray.join( ', ' )
			});
		}

		if( child.legalStatus ) {
			childData.push( {
				key: 'legal status',
				value: child.legalStatus.legalStatus
			});
		}

		if( child.yearEnteredCare ) {
			childData.push( {
				key: 'year entered care',
				value: child.yearEnteredCare
			});
		}

		if( child.hasContactWithSiblings ) {
			childData.push( {
				key: 'has contact with siblings',
				value: child.hasContactWithSiblings
			});
		}

		if( child.siblingTypeOfContact ) {
			childData.push( {
				key: 'type of contact with siblings',
				value: child.siblingTypeOfContact
			});
		}

		if( child.hasContactWithBirthFamily ) {
			childData.push( {
				key: 'has contact with birth family',
				value: child.hasContactWithBirthFamily
			});
		}

		if( child.birthFamilyTypeOfContact ) {
			childData.push( {
				key: 'type of contact with birth family',
				value: child.birthFamilyTypeOfContact
			});
		}

		if( child.residence ) {
			childData.push( {
				key: 'residence',
				value: child.residence.residence
			});
		}

		childData.push( {
			key: 'lives in MA',
			value: !child.isOutsideMassachusetts ? 'yes' : 'no'
		});

		if( !child.isOutsideMassachusetts && child.city ) {
			childData.push( {
				key: 'city',
				value: child.city.cityOrTown
			});
		}

		if( child.isOutsideMassachusetts && child.cityText ) {
			childData.push( {
				key: 'city',
				value: child.cityText
			});
		}

		if( child.careFacilityName ) {
			childData.push( {
				key: 'care facility name',
				value: child.careFacilityName
			});
		}

		if( child.physicalNeedsDescription ) {
			childData.push( {
				key: 'description of physical needs',
				value: child.physicalNeedsDescription
			});
		}

		if( child.emotionalNeedsDescription ) {
			childData.push( {
				key: 'description of emotional needs',
				value: child.emotionalNeedsDescription
			});
		}

		if( child.intellectualNeedsDescription ) {
			childData.push( {
				key: 'description of intellectual needs',
				value: child.intellectualNeedsDescription
			});
		}

		if( child.socialNeedsDescription ) {
			childData.push( {
				key: 'description of social needs',
				value: child.socialNeedsDescription
			});
		}

		if( child.aspirations ) {
			childData.push( {
				key: 'aspirations',
				value: child.aspirations
			});
		}

		if( child.schoolLife ) {
			childData.push( {
				key: 'school life',
				value: child.schoolLife
			});
		}

		if( child.familyLife ) {
			childData.push( {
				key: 'family life',
				value: child.familyLife
			});
		}

		if( child.personality ) {
			childData.push( {
				key: 'personality',
				value: child.personality
			});
		}

		if( child.otherRecruitmentConsiderations ) {
			childData.push( {
				key: 'other recruitment considerations',
				value: child.otherRecruitmentConsiderations
			});
		}

		if( recommendedFamilyConstellationArray.length !== 0 ) {
			childData.push( {
				key: 'recommended family constellations',
				value: recommendedFamilyConstellationArray.join( ', ' )
			});
		}

		if( otherFamilyConstellationConsiderationArray.length !== 0 ) {
			childData.push( {
				key: 'other family constellation considerations',
				value: otherFamilyConstellationConsiderationArray.join( ', ' )
			});
		}

		if( disabilitiesArray.length !== 0 ) {
			childData.push( {
				key: 'disabilities',
				value: disabilitiesArray.join( ', ' )
			});
		}

		if( rawChildData.otherEthnicBackground ) {
			additionalChildData.push( {
				key: `other information about child's ethnic background`,
				value: rawChildData.otherEthnicBackground
			})
		}
		
		if( rawChildData.childInvalidFamilyConstellationReason ) {
			additionalChildData.push( {
				key: 'reason same-sex couples should not be considered',
				value: rawChildData.childInvalidFamilyConstellationReason
			})
		}
		
		if( rawChildData.recruitmentWorker ) {
			additionalChildData.push( {
				key: 'recruitment worker',
				value: rawChildData.recruitmentWorker
			})
		}
		
		if( rawChildData.recruitmentWorkerAgency ) {
			additionalChildData.push( {
				key: 'recruitment worker agency',
				value: rawChildData.recruitmentWorkerAgency
			})
		}
		
		if( rawChildData.recruitmentWorkerEmail ) {
			additionalChildData.push( {
				key: 'recruitment worker email',
				value: rawChildData.recruitmentWorkerEmail
			})
		}
		
		if( rawChildData.recruitmentWorkerPhone ) {
			additionalChildData.push( {
				key: 'recruitment worker phone',
				value: rawChildData.recruitmentWorkerPhone
			})
		}
		
		if( rawChildData.adoptionWorker ) {
			additionalChildData.push( {
				key: 'adoption worker',
				value: rawChildData.adoptionWorker
			})
		}
		
		if( rawChildData.adoptionWorkerAgency ) {
			additionalChildData.push( {
				key: 'adoption worker agency',
				value: rawChildData.adoptionWorkerAgency
			})
		}
		
		if( rawChildData.adoptionWorkerEmail ) {
			additionalChildData.push( {
				key: 'adoption worker email',
				value: rawChildData.adoptionWorkerEmail
			})
		}
		
		if( rawChildData.adoptionWorkerPhone ) {
			additionalChildData.push( {
				key: 'adoption worker phone',
				value: rawChildData.adoptionWorkerPhone
			})
		}

		// the email template can be found in templates/emails/
		new keystone.Email({
			templateExt		: 'hbs',
			templateEngine 	: require( 'handlebars' ),
			templateName 	: 'social-worker-new-child-notification-to-social-worker'
		}).send({
			to				: socialWorkerEmail,
			from: {
				name 	: 'MARE',
				email 	: 'admin@adoptions.io'
			},
			subject		: `child registration details`,
			childName	: child.name.full,
			host,
			childData,
			additionalChildData,
		
		}, ( err, message ) => {
			// if there was an error sending the email
			if( err ) {
				// reject the promise with details
				return reject( `error sending new social worker child registration notification email to social worker - ${ err }` );
			}
			// the response object is stored as the 0th element of the returned message
			const response = message ? message[ 0 ] : undefined;
			// if the email failed to send, or an error occurred ( which it does, rarely ) causing the response message to be empty
			if( response && [ 'rejected', 'invalid', undefined ].includes( response.status ) ) {
				// reject the promise with details
				return reject( `error sending new social worker child registration notification email to social worker - ${ response.status } - ${ response.email } - ${ response.reject_reason } - ${ err }` );
			}

			resolve();
		});
	});
};