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
    'findOneEditedProductByOriginalId'({originalId}){
        // Type check to prevent malicious calls
        check(originalId, String);

        return EditedProducts.findOne({originalId: originalId});
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
            if(!Array.isArray(otherImages)){
                // Other images isn't an array
                throw new Meteor.Error('otherImagesNotArray', "Une erreur est survenue lors de l'ajout des images supplémentaires, veuillez réessayer.");
            } else{
                if(!Array.isArray(categories)){
                    // Categories isn't an array
                    throw new Meteor.Error('categoriesNotArray', "Une erreur est survenue lors de l'ajout des catégories, veuillez réessayer.");
                } else{
                    // All parameters are of the correct type

                    var callbacksPending = 0;  // No callback is pending for the moment

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
                                callbacksPending++;  // Starting a call with a callback function
                                Meteor.call('checkUrlInput', {url: website}, function(error, result){
                                    if(error){
                                        // TODO: error display
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
                                    callbacksPending++;  // Starting a call with a callback function
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
                                            callbacksPending++;  // Starting a call with a callback function
                                            Moderation.insert({
                                                userId: Meteor.userId(),
                                                elementId: addedProductId,
                                                reason: "newProduct"
                                            }, function(error, addedModerationId){
                                                if(error){
                                                    // There was an error while adding the moderation
                                                    throw new Meteor.Error('moderationInsertionError', "Erreur lors de l'ajout de produit, veuillez réessayer.");
                                                    Products.remove(addedProductId);  // Removing the product from the db
                                                } else{
                                                    // The new product was successfully inserted in moderation, adding the corresponding contribution to the user
                                                    // Catching the points earned :
                                                    const points = Rules.points.productAddition;
                                                    callbacksPending++;  // Starting a call with a callback function
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
                                                        }
                                                        callbacksPending--;  // End of callback function
                                                    });
                                                }
                                                callbacksPending--;  // End of callback function
                                            });
                                        }
                                        callbacksPending--;  // End of callback function
                                    });
                                    callbacksPending--;  // End of callback function
                                });
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
            if(!Array.isArray(otherImages)){
                // Other images isn't an array
                throw new Meteor.Error('otherImagesNotArray', "Une erreur est survenue lors de l'ajout des images supplémentaires, veuillez réessayer.");
            } else{
                if(!Array.isArray(categories)){
                    // Categories isn't an array
                    throw new Meteor.Error('categoriesNotArray', "Une erreur est survenue lors de l'ajout des catégories, veuillez réessayer.");
                } else{
                    // All parameters are of the correct type

                    var callbacksPending = 0;  // No callback is pending for the moment

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
                                callbacksPending++;  // Starting a call with a callback function
                                Meteor.call('checkUrlInput', {url: website}, function(error, result){
                                    if(error){
                                        // TODO: error display
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
                                        // Inserting informations in the database :
                                        callbacksPending++;  // Starting a call with a callback function
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
                                                    callbacksPending++;  // Starting a call with a callback function
                                                    Moderation.insert({
                                                        userId: Meteor.userId(),
                                                        elementId: productId,
                                                        reason: "editProduct"
                                                    }, function(error, addedModerationId){
                                                        if(error){
                                                            // There was an error while adding the moderation
                                                            EditedProducts.remove(addedProductId);  // Removing the product from the db
                                                            throw new Meteor.Error('moderationInsertionError', "Erreur lors de l'ajout de produit, veuillez réessayer.");
                                                        } else{
                                                            // The new product was successfully inserted in moderation, adding the corresponding contribution to the user
                                                            // Catching the points earned :
                                                            const points = Rules.points.productModification;
                                                            callbacksPending++;  // Starting a call with a callback function
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
                                                                }
                                                                callbacksPending--;  // End of callback function
                                                            });
                                                        }
                                                        callbacksPending--;  // End of callback function
                                                    });
                                                }
                                                callbacksPending--;  // End of callback function
                                        });
                                    }
                                });
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
            // TODO: error
        } else{
            Moderation.insert({
                userId: Meteor.userId(),
                elementId: productId,
                reason: reason
            }, function(error, addedModerationId){
                if(error){
                    // TODO: error display
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
                    });
                }
            });
        }
    }
});
