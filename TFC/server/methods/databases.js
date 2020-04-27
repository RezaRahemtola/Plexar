// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { Images } from '../../imports/databases/images.js';
import { Moderation } from '../../imports/databases/moderation.js';
import { Contributions } from '../../imports/databases/contributions.js';
import { Rules } from '../rules.js';

Meteor.methods({
    'findOneProductById'({productId}){
        return Products.findOne({_id : productId});
    },
    'updateProductScore'({productId, vote}){
        const currentScore = Products.findOne({_id: productId}).score;
        const newScore = currentScore + vote;
        Products.update(productId, { $set: {
            // Updating the database with the new score
            score: newScore
        }});
    },
    'addNewProduct'({productName, productDescription, coverImage, otherImages, categories}){
        var callbacksPending = 0;  // No callback is pending for the moment

        if(productName >= Rules.product.name.minLength){
            throw new Meteor.Error('nameTooShort', 'Le nom doit avoir une longueur minimale de '+Rule.product.name.minLength+' charactères.');
        } else if(productDescription >= Rules.product.description.minLength){
            throw new Meteor.Error('nameTooShort', 'La dexcription doit avoir une longueur minimale de '+Rule.product.description.minLength+' charactères.');
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
                    // Inserting informations in the database :
                    callbacksPending++;  // Starting a call with a callback function
                    Products.insert({
                        name: productName,
                        description: productDescription,
                        images: productImages,
                        score: 0,
                        categories: categories
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
                                    callbacksPending++;  // Starting a call with a callback function
                                    Contributions.insert({
                                        userId: Meteor.userId(),
                                        type: 'Ajout',
                                        elementId: addedProductId,
                                        createdAt: new Date().toISOString(),
                                        moderationId: addedModerationId,
                                        points: 10
                                        // TODO: Set le nombre de points en fonction des Rules
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
                }
            }
        }
    }
});
