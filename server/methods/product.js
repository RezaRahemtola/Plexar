// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { EditedProducts } from '../../imports/databases/editedProducts.js';
import { Images } from '../../imports/databases/images.js';
import { Favorites } from '../../imports/databases/favorites.js';
import { Moderation } from '../../imports/databases/moderation.js';
import { Contributions } from '../../imports/databases/contributions.js';
import { UsersInformations } from '../../imports/databases/usersInformations.js';
import { Rules } from '../rules.js';


// Allow all client-side updates on the Images collection
Images.allow({
  insert() { return true; },
  update() { return true; },
  download() { return true; }
});

Meteor.publish('images', function(){
  return Images.find();
});


// Deny client-side remove on the Images collection
Images.deny({
    remove() { return true; }
});

Meteor.methods({
    'removeImage'({imageId}){
        // Type check to prevent malicious calls
        check(imageId, String);

        Images.remove(imageId);
    },
    'findOneProductById'({productId}){
        // Type check to prevent malicious calls
        check(productId, String);

        return Products.findOne({_id : productId});
    },
    'findOneEditedProductById'({editedProductId}){
        // Type check to prevent malicious calls
        check(editedProductId, String);

        return EditedProducts.findOne({_id: editedProductId});
    },
    'getVoteValue'({productId}){
        // Type check to prevent malicious calls
        check(productId, String);

        if(Meteor.userId()){
            const userVotes = UsersInformations.findOne({userId: Meteor.userId()}).votes;
            // Returns the vote for asked productId : it can be a positive or negative number, or undefined if no vote
            return userVotes[productId];
        } else{
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        }
    },
    'updateProductScore'({productId, vote}){
        // Type check to prevent malicious calls
        check(productId, String);
        check(vote, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, checking if his email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // Email isn't verified
                throw new Meteor.Error('emailNotVerified', 'Vous devez vérifier votre adresse email pour effectuer cette action.');
            } else{
                // Email is verified

                const product = Products.findOne({_id: productId});
                const userInformationsId = UsersInformations.findOne({userId: Meteor.userId()})._id;
                var userVotes = UsersInformations.findOne({userId: Meteor.userId()}).votes;
                var currentScore = product.score;

                if(userVotes[product._id] !== undefined){
                    // Product has already been voted by the user
                    var currentVote = userVotes[product._id];  // Catching the vote
                    currentScore -= currentVote;  // Remove the current vote of the product

                }
                const voteToApply = 1;
                if(vote === 'upvote'){
                    if(userVotes[product._id] !== undefined && userVotes[product._id] > 0){
                        // There was already an upvote, vote was already removed so we don't add it again
                        var newScore = currentScore;
                        delete userVotes[product._id];
                        var returnValue = 'upvoteRemoved';
                    } else{
                        // No upvote before, we can add it
                        var newScore = currentScore + voteToApply;
                        // Updating the value in the votes object with an upvote
                        userVotes[product._id] = voteToApply;
                        var returnValue = 'upvote';
                    }

                } else if(vote === 'downvote'){
                    if(userVotes[product._id] !== undefined && userVotes[product._id] < 0){
                        // There was already a downvote, vote was already removed so we don't add it again
                        var newScore = currentScore;
                        delete userVotes[product._id];
                        var returnValue = 'downvoteRemoved';
                    } else{
                        // No upvote before, we can add it
                        var newScore = currentScore - voteToApply;
                        // Updating the value in the votes object with a downvote
                        userVotes[product._id] = -voteToApply;
                        var returnValue = 'downvote';
                    }
                } else{
                    // Unknown vote type
                    throw new Meteor.Error('unknownVoteType', "Une erreur est survenue lors de l'ajout du vote, veuillez réessayer.");
                }

                Products.update(productId, { $set: {
                    // Updating the database with the new score
                    score: newScore
                }});
                UsersInformations.update(userInformationsId, { $set: {
                    // Updating the database with the new votes object
                    votes: userVotes
                }});

                return returnValue;
            }
        }
    },
    'addNewProduct'({productName, productDescription, coverImage, otherImages, categories, website}){
        // Type check to prevent malicious calls
        check(productName, String);
        check(productDescription, String);
        check(coverImage, String);
        check(website, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, checking if his email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // Email isn't verified
                throw new Meteor.Error('emailNotVerified', 'Vous devez vérifier votre adresse email pour effectuer cette action.');
            } else{
                // Email is verified

                if(!Array.isArray(otherImages)){
                    // Other images isn't an array
                    throw new Meteor.Error('otherImagesNotArray', "Une erreur est survenue lors de l'ajout des images supplémentaires, veuillez réessayer.");
                } else{
                    if(!Array.isArray(categories)){
                        // Categories isn't an array
                        throw new Meteor.Error('categoriesNotArray', "Une erreur est survenue lors de l'ajout des catégories, veuillez réessayer.");
                    } else{
                        // All parameters are of the correct type, checking if user hasn't reach his daily contributions limit

                        // Checking if user is admin
                        const userEmail = Meteor.user().emails[0].address;
                        if(!Meteor.settings.admin.list.includes(userEmail)){
                            // User isn't in the admin list, so he will have a limit of daily contributions that corresponds to his level
                            const userLevelName = UsersInformations.findOne({userId: Meteor.userId()}).level;
                            const levels = Rules.levels;  // Catching array of available levels with their properties
                            // Retrieving the level that corresponds to the user one
                            const userLevel = levels.find(function(level){
                                return level.name === userLevelName;
                            });
                            // Catching the contributions limit
                            var dailyContributionsLimit = userLevel.dailyContributionsLimit;

                            // Catching daily contributions of the user to see if he has already voted today
                            var dailyContributions = UsersInformations.findOne({userId: Meteor.userId()}).dailyContributions;

                            // Catching the current date
                            var year = new Date().getFullYear();  // Catching the year
                            var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                            var date = new Date().getDate();  // Catching the date
                            if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                            if(month < 10){ month = '0' + month; }
                            const currentDate = date+ '/' +month+ '/' +year;

                            if(dailyContributions[currentDate] !== undefined){
                                // User has already contribute today, checking if he hasn't reach his limit
                                if(dailyContributions[currentDate] >= dailyContributionsLimit){
                                    // User has reach the limit, throwing an error
                                    throw new Meteor.Error('dailyContributionsLimitReached', "Vous avez atteint votre limite de "+ dailyContributionsLimit +" contributions quotidiennes.");
                                }
                            }
                        }

                        if(productName.length < Rules.product.name.minLength){
                            throw new Meteor.Error('nameTooShort', 'Le nom doit avoir une longueur minimale de '+Rules.product.name.minLength+' charactères.');
                        } else if(productDescription.length < Rules.product.description.minLength){
                            throw new Meteor.Error('descriptionTooShort', 'La dexcription doit avoir une longueur minimale de '+Rules.product.description.minLength+' charactères.');
                        } else{
                            // Name and description minLength is ok, removing extra characters (if there are any)
                            productName.slice(0, Rules.product.name.maxLength);
                            productName.slice(0, Rules.product.description.maxLength);

                            if(!Images.findOne({_id: coverImage})){
                                // Cover image isn't in the db
                                throw new Meteor.Error('coverImageUnavailable', "Erreur lors de l'ajout de l'image de couverture, veuillez réessayer.");
                            } else{
                                // Cover image is in the db, checking other images
                                var correctImages = 0;
                                for(var imageId of otherImages){
                                    // For each image id, checking if it's in the db
                                    if(Images.findOne({_id: imageId})){
                                        correctImages++;
                                    }
                                }
                                if(correctImages !== otherImages.length){
                                    // All images aren't in the db
                                    throw new Meteor.Error('otherImagesUnavailable', "Erreur lors de l'ajout des images, veuillez réessayer.");
                                } else{
                                    // All images are correct, adding the cover image to the first index of images array
                                    otherImages.unshift(coverImage);
                                    // Catch the rules for the maximum number of images per product
                                    const maxImagesNumber = Rules.product.coverImage.maxLength + Rules.product.otherImages.maxLength;
                                    otherImages.slice(0, maxImagesNumber);  // Remove extra images (if there are any)
                                    const productImages = otherImages;

                                    // Checking website input
                                    Meteor.call('checkUrlInput', {url: website}, function(error, result){
                                        if(error){
                                            // There was an error
                                            throw new Meteor.Error('urlCheckingError', 'Une erreur est survenur lors de la vérification du site web, veuillez réessayer.');
                                        } else if(!result){
                                            // URL isn't correct, throwing an error if it has been filled
                                            if(website !== ""){
                                                throw new Meteor.Error('invalidWebsite', 'Veuillez entrer un lien valide.');
                                            } else{
                                                // Website field wasn't filled, we will insert an empty link in the db
                                            }
                                        } else if(result){
                                            // URL is correct, adding protocol ahead if needed
                                            if(!( website.includes('http://') || website.includes('https://') )){
                                                // Adding http to be sure it will work (some website don't support https)
                                                website = 'http://' + website;
                                            }
                                        }

                                        // Inserting informations in the database :
                                        Products.insert({
                                            name: productName,
                                            description: productDescription,
                                            images: productImages,
                                            score: 0,
                                            categories: categories,
                                            website: website
                                        }, function(error, addedProductId){
                                            if(error){
                                                // There was an error while adding the product
                                                throw new Meteor.Error('productInsertionError', "Erreur lors de l'ajout du produit, veuillez réessayer.");
                                            } else{
                                                // The product was successfully added, inserting it to the moderation database
                                                Moderation.insert({
                                                    userId: Meteor.userId(),
                                                    elementId: addedProductId,
                                                    reason: "newProduct",
                                                    createdAt: new Date().toISOString(),
                                                    score: 0
                                                }, function(error, addedModerationId){
                                                    if(error){
                                                        // There was an error while adding the moderation
                                                        throw new Meteor.Error('moderationInsertionError', "Erreur lors de l'ajout de produit, veuillez réessayer.");
                                                        Products.remove(addedProductId);  // Removing the product from the db
                                                    } else{
                                                        // The new product was successfully inserted in moderation, adding the corresponding contribution to the user
                                                        // Catching the points earned :
                                                        const points = Rules.points.productAddition;
                                                        Contributions.insert({
                                                            userId: Meteor.userId(),
                                                            type: 'Ajout',
                                                            status: 'pending',
                                                            elementId: addedProductId,
                                                            createdAt: new Date().toISOString(),
                                                            moderationId: addedModerationId,
                                                            points: points
                                                        }, function(error, addedContributionId){
                                                            if(error){
                                                                // There was an error while adding the contribution
                                                                throw new Meteor.Error('contributionInsertionError', "Erreur lors de l'ajout de produit, veuillez réessayer.");
                                                                Products.remove(addedProductId);  // Removing the product from the db
                                                                Moderation.remove(addedModerationId);  // Removing the moderation from the db
                                                            } else{
                                                                // Adding this contribution to the count of daily contributions
                                                                const userInformationsId = UsersInformations.findOne({userId: Meteor.userId()})._id;
                                                                var dailyContributions = UsersInformations.findOne({userId: Meteor.userId()}).dailyContributions;

                                                                // Catching the current date
                                                                var year = new Date().getFullYear();  // Catching the year
                                                                var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                                                                var date = new Date().getDate();  // Catching the date
                                                                if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                                                                if(month < 10){ month = '0' + month; }
                                                                const currentDate = date+ '/' +month+ '/' +year;

                                                                if(dailyContributions[currentDate] !== undefined){
                                                                    // User has already contributed today, we will only update the number
                                                                    var todayContributions = dailyContributions[currentDate];
                                                                    todayContributions++;
                                                                    dailyContributions[currentDate] = todayContributions;
                                                                } else{
                                                                    // User hasn't contribute today, we create a new daily contribution of 1
                                                                    dailyContributions[currentDate] = 1;
                                                                }
                                                                // Updating daily contributions value in the database
                                                                UsersInformations.update(userInformationsId, { $set: { dailyContributions: dailyContributions } },
                                                                    function(error, result){
                                                                        if(error){
                                                                            // TODO: error et delete les contributions moderztion etc..
                                                                        } else{
                                                                            // Everything was successfully executed, now we check if the user is admin to instant validate his proposition
                                                                            const userEmail = Meteor.user().emails[0].address;
                                                                            if(Meteor.settings.admin.list.includes(userEmail)){
                                                                                // User is an admin, calling the method to accept the moderation
                                                                                Meteor.call('moderationAccepted', {moderationId: addedModerationId}, function(error, result){
                                                                                    if(error){
                                                                                        // There was an error while accepting the moderation
                                                                                        throw new Meteor.Error('adminModerationAcceptedError', "Une erreur a eu lieu lors de la validation automatique de l'ajout.");
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'addEditedProduct'({productName, productDescription, coverImage, otherImages, categories, website, productId}){
        // Type check to prevent malicious calls
        check(productName, String);
        check(productDescription, String);
        check(coverImage, String);
        check(website, String);
        check(productId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, checking if his email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // Email isn't verified
                throw new Meteor.Error('emailNotVerified', 'Vous devez vérifier votre adresse email pour effectuer cette action.');
            } else{
                // Email is verified

                if(!Array.isArray(otherImages)){
                    // Other images isn't an array
                    throw new Meteor.Error('otherImagesNotArray', "Une erreur est survenue lors de l'ajout des images supplémentaires, veuillez réessayer.");
                } else{
                    if(!Array.isArray(categories)){
                        // Categories isn't an array
                        throw new Meteor.Error('categoriesNotArray', "Une erreur est survenue lors de l'ajout des catégories, veuillez réessayer.");
                    } else{
                        // All parameters are of the correct type, checking if user hasn't reach his daily contributions limit

                        // Checking if user is admin
                        const userEmail = Meteor.user().emails[0].address;
                        if(!Meteor.settings.admin.list.includes(userEmail)){
                            // User isn't in the admin list, so he will have a limit of daily contributions that corresponds to his level
                            const userLevelName = UsersInformations.findOne({userId: Meteor.userId()}).level;
                            const levels = Rules.levels;  // Catching array of available levels with their properties
                            // Retrieving the level that corresponds to the user one
                            const userLevel = levels.find(function(level){
                                return level.name === userLevelName;
                            });
                            // Catching the contributions limit
                            var dailyContributionsLimit = userLevel.dailyContributionsLimit;

                            // Catching daily contributions of the user to see if he has already voted today
                            var dailyContributions = UsersInformations.findOne({userId: Meteor.userId()}).dailyContributions;

                            // Catching the current date
                            var year = new Date().getFullYear();  // Catching the year
                            var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                            var date = new Date().getDate();  // Catching the date
                            if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                            if(month < 10){ month = '0' + month; }
                            const currentDate = date+ '/' +month+ '/' +year;

                            if(dailyContributions[currentDate] !== undefined){
                                // User has already contribute today, checking if he hasn't reach his limit
                                if(dailyContributions[currentDate] >= dailyContributionsLimit){
                                    // User has reach the limit, throwing an error
                                    throw new Meteor.Error('dailyContributionsLimitReached', "Vous avez atteint votre limite de "+ dailyContributionsLimit +" contributions quotidiennes.");
                                }
                            }
                        }

                        if(productName.length < Rules.product.name.minLength){
                            throw new Meteor.Error('nameTooShort', 'Le nom doit avoir une longueur minimale de '+Rules.product.name.minLength+' charactères.');
                        } else if(productDescription.length < Rules.product.description.minLength){
                            throw new Meteor.Error('descriptionTooShort', 'La dexcription doit avoir une longueur minimale de '+Rules.product.description.minLength+' charactères.');
                        } else{
                            // Name and description minLength is ok, removing extra characters (if there are any)
                            productName.slice(0, Rules.product.name.maxLength);
                            productName.slice(0, Rules.product.description.maxLength);

                            // Description is correct, checking the images
                            if(!Images.findOne({_id: coverImage})){
                                // Cover image isn't in the db
                                throw new Meteor.Error('coverImageUnavailable', "Erreur lors de l'ajout de l'image de couverture, veuillez réessayer.");
                            } else{
                                // Cover image is in the db, checking the images
                                var correctImages = 0;
                                for(var imageId of otherImages){
                                    // For each image id, checking if it's in the db
                                    if(Images.findOne({_id: imageId})){
                                        correctImages++;
                                    }
                                }
                                if(correctImages === otherImages.length){
                                    // All images are correct, adding the cover image to the first index of images array
                                    otherImages.unshift(coverImage);
                                    // Catch the rules for the maximum number of images per product
                                    const maxImagesNumber = Rules.product.coverImage.maxLength + Rules.product.otherImages.maxLength;
                                    otherImages.slice(0, maxImagesNumber);  // Remove extra images (if there are any)
                                    const productImages = otherImages;

                                    // Checking website input
                                    Meteor.call('checkUrlInput', {url: website}, function(error, result){
                                        if(error){
                                            // There was an error
                                            throw new Meteor.Error('urlCheckingError', 'Une erreur est survenur lors de la vérification du site web, veuillez réessayer.');
                                        } else if(!result){
                                            // URL isn't correct, throwing an error if it has been filled
                                            if(website !== ""){
                                                throw new Meteor.Error('invalidWebsite', 'Veuillez entrer un lien valide.');
                                            } else{
                                                // Website field wasn't filled, we will insert an empty link in the db
                                            }
                                        } else if(result){
                                            // URL is correct, adding protocol ahead if needed
                                            if(!( website.includes('http://') || website.includes('https://') )){
                                                // Adding http to be sure it will work (some website don't support https)
                                                website = 'http://' + website;
                                            }
                                        }

                                        //  Catching the real product to check for modifications
                                        const originalProduct = Products.findOne({_id: productId});
                                        const nameDifference = (originalProduct.name !== productName);
                                        const descriptionDifference = (originalProduct.description !== productDescription);
                                        const imagesDifference = (originalProduct.toString() !== productImages.toString());
                                        const categoriesDifference = (originalProduct.toString() !== categories.toString());
                                        const websiteDifference = (originalProduct.website !== website);

                                        const isDifferent = nameDifference || descriptionDifference || imagesDifference || categoriesDifference || websiteDifference;

                                        if(!isDifferent){
                                            // User didin't make any modifications, throwing an error
                                            throw new Meteor.Error('noModifications', "Vous n'avez fait aucune modification.");
                                        } else{
                                            // Checking if the product isn't already under moderation
                                            Meteor.call('checkIfProductInModeration', {productId: productId}, function(error, result){
                                                if(error){
                                                    // There was an error
                                                    throw new Meteor.Error(error.error, error.reason);
                                                } else if(result){
                                                    // Product is already in moderation, display an helping message
                                                    throw new Meteor.Error('productAlreadyUnderModeration', "Ce produit est déjà en modération, veuillez réessayer ultérieurement.");
                                                } else{
                                                    // Product isn't already under moderation, we can add the edit proposition

                                                    // Inserting informations in the database :
                                                    EditedProducts.insert({
                                                        originalId: originalProduct._id,
                                                        name: productName,
                                                        description: productDescription,
                                                        images: productImages,
                                                        score: originalProduct.score,
                                                        categories: categories,
                                                        website: website
                                                    }, function(error, addedProductId){
                                                            if(error){
                                                                // There was an error while adding the product
                                                                throw new Meteor.Error('productInsertionError', "Erreur lors de l'ajout du produit, veuillez réessayer.");
                                                            } else{
                                                                // Adding the product to the moderation database
                                                                Moderation.insert({
                                                                    userId: Meteor.userId(),
                                                                    elementId: addedProductId,
                                                                    reason: "editProduct",
                                                                    createdAt: new Date().toISOString(),
                                                                    score: 0
                                                                }, function(error, addedModerationId){
                                                                    if(error){
                                                                        // There was an error while adding the moderation
                                                                        EditedProducts.remove(addedProductId);  // Removing the product from the db
                                                                        throw new Meteor.Error('moderationInsertionError', "Erreur lors de l'ajout de produit, veuillez réessayer.");
                                                                    } else{
                                                                        // The new product was successfully inserted in moderation, adding the corresponding contribution to the user

                                                                        // Catching the points earned :
                                                                        const points = Rules.points.productModification;

                                                                        Contributions.insert({
                                                                            userId: Meteor.userId(),
                                                                            type: 'Modification',
                                                                            status: 'pending',
                                                                            elementId: originalProduct._id,
                                                                            createdAt: new Date().toISOString(),
                                                                            moderationId: addedModerationId,
                                                                            points: points
                                                                        }, function(error, addedContributionId){
                                                                            if(error){
                                                                                // There was an error while adding the contribution
                                                                                EditedProducts.remove(addedProductId);  // Removing the product from the db
                                                                                Moderation.remove(addedModerationId);  // Removing the moderation from the db
                                                                                throw new Meteor.Error('contributionInsertionError', "Erreur lors de l'ajout de produit, veuillez réessayer.");
                                                                            } else{
                                                                                // Adding this contribution to the count of daily contributions
                                                                                const userInformationsId = UsersInformations.findOne({userId: Meteor.userId()})._id;
                                                                                var dailyContributions = UsersInformations.findOne({userId: Meteor.userId()}).dailyContributions;

                                                                                // Catching the current date
                                                                                var year = new Date().getFullYear();  // Catching the year
                                                                                var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                                                                                var date = new Date().getDate();  // Catching the date
                                                                                if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                                                                                if(month < 10){ month = '0' + month; }
                                                                                const currentDate = date+ '/' +month+ '/' +year;

                                                                                if(dailyContributions[currentDate] !== undefined){
                                                                                    // User has already contributed today, we will only update the number
                                                                                    var todayContributions = dailyContributions[currentDate];
                                                                                    todayContributions++;
                                                                                    dailyContributions[currentDate] = todayContributions;
                                                                                } else{
                                                                                    // User hasn't contribute today, we create a new daily contribution of 1
                                                                                    dailyContributions[currentDate] = 1;
                                                                                }
                                                                                // Updating daily contributions value in the database
                                                                                UsersInformations.update(userInformationsId, { $set: { dailyContributions: dailyContributions } },
                                                                                    function(error, result){
                                                                                        if(error){
                                                                                            // TODO: error + delete contributions moderation etc
                                                                                        } else{
                                                                                            // Everything was executed successfully, checking if user is admin to instant validate the proposition
                                                                                            const userEmail = Meteor.user().emails[0].address;
                                                                                            if(Meteor.settings.admin.list.includes(userEmail)){
                                                                                                // User is admin, calling the method to accept the moderation
                                                                                                Meteor.call('moderationAccepted', {moderationId: addedModerationId}, function(error, result){
                                                                                                    if(error){
                                                                                                        // There was an error while accepting the moderation
                                                                                                        throw new Meteor.Error('adminModerationAcceptedError', "Une erreur a eu lieu lors de la validation automatique de la modification.");
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    'addProductToFavorite'({productId}){
        // Type check to prevent malicious calls
        check(productId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // Getting favorite products of the current user in the db
            var userFavorite = Favorites.findOne({userId: Meteor.userId()}).products;
            const favoriteId = Favorites.findOne({userId: Meteor.userId()})._id;  // Catching lineId (needed to modify data)
            userFavorite.push(productId);  // Adding the product to the array
            Favorites.update(favoriteId, { $set: {
                // Updating the database with the modified array
                products: userFavorite
            }});
        }
    },
    'removeProductFromFavorite'({productId}){
        // Type check to prevent malicious calls
        check(productId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            var userFavorite = Favorites.findOne({userId: Meteor.userId()}).products;  // Getting favorite products of the current user in the db
            const favoriteId = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
            userFavorite.pop(productId);  // Removing the product from the array
            Favorites.update(favoriteId, { $set: {
                // Updating the database with the modified array
                products: userFavorite
            }});
        }
    },
    'productInFavorites'({productId}){
        // Type check to prevent malicious calls
        check(productId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // Check if the given product ID is in the favorite products of the user
            var userFavorite = Favorites.findOne({userId: Meteor.userId()}).products;  // Return the favorites of the current user
            return userFavorite.includes(productId);
        }
    },
    'reportProduct'({productId, reason}){
        // Type check to prevent malicious calls
        check(productId, String);
        check(reason, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, checking if his email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // Email isn't verified
                throw new Meteor.Error('emailNotVerified', 'Vous devez vérifier votre adresse email pour effectuer cette action.');
            } else{
                // Email is verified, checking if user hasn't reach his daily contributions limit

                // Checking if user is admin
                const userEmail = Meteor.user().emails[0].address;
                if(!Meteor.settings.admin.list.includes(userEmail)){
                    // User isn't in the admin list, so he will have a limit of daily contributions that corresponds to his level
                    const userLevelName = UsersInformations.findOne({userId: Meteor.userId()}).level;
                    const levels = Rules.levels;  // Catching array of available levels with their properties
                    // Retrieving the level that corresponds to the user one
                    const userLevel = levels.find(function(level){
                        return level.name === userLevelName;
                    });
                    // Catching the contributions limit
                    var dailyContributionsLimit = userLevel.dailyContributionsLimit;

                    // Catching daily contributions of the user to see if he has already voted today
                    var dailyContributions = UsersInformations.findOne({userId: Meteor.userId()}).dailyContributions;

                    // Catching the current date
                    var year = new Date().getFullYear();  // Catching the year
                    var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                    var date = new Date().getDate();  // Catching the date
                    if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                    if(month < 10){ month = '0' + month; }
                    const currentDate = date+ '/' +month+ '/' +year;

                    if(dailyContributions[currentDate] !== undefined){
                        // User has already contribute today, checking if he hasn't reach his limit
                        if(dailyContributions[currentDate] >= dailyContributionsLimit){
                            // User has reach the limit, throwing an error
                            throw new Meteor.Error('dailyContributionsLimitReached', "Vous avez atteint votre limite de "+ dailyContributionsLimit +" contributions quotidiennes.");
                        }
                    }
                }

                // Checking if the product isn't already under moderation
                Meteor.call('checkIfProductInModeration', {productId: productId}, function(error, result){
                    if(error){
                        // There was an error
                        throw new Meteor.Error(error.error, error.reason);  // Display an error message
                    } else if(result){
                        // Product is already in moderation, display an helping message
                        throw new Meteor.Error('productAlreadyUnderModeration', "Ce produit est déjà en modération, veuillez réessayer ultérieurement.");
                    } else{
                        // Product isn't already under moderation, we can add the report

                        Moderation.insert({
                            userId: Meteor.userId(),
                            elementId: productId,
                            reason: reason,
                            createdAt: new Date().toISOString(),
                            score: 0
                        }, function(error, addedModerationId){
                            if(error){
                                // There was an error
                                throw new Meteor.Error('moderationInsertionError', "Une erreur est survenue lors de la création de la modération, veuillez réessayer.");
                            } else{
                                // Moderation was successfully inserted, now let's create the contribution
                                // Catching the points earned :
                                const points = Rules.points.productReport;
                                Contributions.insert({
                                    userId: Meteor.userId(),
                                    type: 'Signalement',
                                    status: 'pending',
                                    elementId: productId,
                                    createdAt: new Date().toISOString(),
                                    moderationId: addedModerationId,
                                    points: points
                                }, function(error, addedContributionId){
                                    if(error){
                                        // There was an error while adding the contribution
                                        Moderation.remove(addedModerationId);  // Removing the moderation from the db
                                        throw new Meteor.Error('contributionInsertionError', "Erreur lors de l'ajout de produit, veuillez réessayer.");
                                    } else{
                                        // Adding this contribution to the count of daily contributions
                                        const userInformationsId = UsersInformations.findOne({userId: Meteor.userId()})._id;
                                        var dailyContributions = UsersInformations.findOne({userId: Meteor.userId()}).dailyContributions;

                                        // Catching the current date
                                        var year = new Date().getFullYear();  // Catching the year
                                        var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                                        var date = new Date().getDate();  // Catching the date
                                        if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                                        if(month < 10){ month = '0' + month; }
                                        const currentDate = date+ '/' +month+ '/' +year;

                                        if(dailyContributions[currentDate] !== undefined){
                                            // User has already contributed today, we will only update the number
                                            var todayContributions = dailyContributions[currentDate];
                                            todayContributions++;
                                            dailyContributions[currentDate] = todayContributions;
                                        } else{
                                            // User hasn't contribute today, we create a new daily contribution of 1
                                            dailyContributions[currentDate] = 1;
                                        }
                                        // Updating daily contributions value in the database
                                        UsersInformations.update(userInformationsId, { $set: { dailyContributions: dailyContributions } },
                                            function(error, result){
                                                if(error){
                                                    // TODO: error + delete contributions moderation etc
                                                } else{
                                                    // Everything executed successfully, checking if the user is an admin to instant validate the report
                                                    const userEmail = Meteor.user().emails[0].address;
                                                    if(Meteor.settings.admin.list.includes(userEmail)){
                                                        // User is admin, calling the method to accept the report
                                                        Meteor.call('moderationAccepted', {moderationId: addedModerationId}, function(error, result){
                                                            if(error){
                                                                // There was an error while accepting the moderation
                                                                throw new Meteor.Error('adminModerationAcceptedError', "Une erreur a eu lieu lors de la validation automatique du signalement.");
                                                            }
                                                        });
                                                    }
                                                }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    }
});
