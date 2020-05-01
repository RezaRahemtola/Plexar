// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { Images } from '../../imports/databases/images.js';
import { Moderation } from '../../imports/databases/moderation.js';
import { EditedProducts } from '../../imports/databases/editedProducts.js';
import { Contributions } from '../../imports/databases/contributions.js';

Meteor.methods({
    'displayModeration'(){
        // Catching the moderation that corresponds to the asked product
        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // TODO: Check if user is admin
            var moderationElements = Moderation.find();

            var elementsToReturn = []
            for(var moderation of moderationElements){
                // For each moderation, we add a text for the buttons depending on the reason
                switch(moderation.reason){
                    case 'newProduct':
                        moderation.reasonText = "Proposition d'ajout";
                        moderation.approveText = "Valider l'ajout";
                        moderation.rejectText = "Rejeter l'ajout";
                        break;
                    case 'editProduct':
                        moderation.reasonText = "Proposition de modification";
                        moderation.approveText = "Valider les modifications";
                        moderation.rejectText = "Rejeter les modifications";
                        break;
                    case 'duplicate':
                        moderation.reasonText = "Signalement : Produit référencé plusieurs fois.";
                        moderation.approveText = "Supprimer le produit";
                        moderation.rejectText = "Garder le produit";
                        break;
                    case 'offTopic':
                        moderation.reasonText = "Signalement : Produit hors-sujet";
                        moderation.approveText = "Supprimer le produit";
                        moderation.rejectText = "Garder le produit";
                        break;
                    case 'incorrectInformations':
                        moderation.reasonText = "Signalement : Informations incorrectes";
                        // TODO: Récupérer le champ plus d'infos pour personnaliser les boutons
                        moderation.approveText = "";
                        moderation.rejectText = "";
                        break;
                    default:
                        // Unknown reason
                        moderation.reasonText = doc.reason;
                        moderation.approveText = "Garder le produit";
                        moderation.rejectText = "Supprimer le produit";
                }

                // Then we find the corresponding product
                var product = Products.findOne({_id: moderation.elementId});
                // And we add the moderation + the product to the returned array
                elementsToReturn.push( {
                                        product: product,
                                        moderation: moderation
                                        }
                                    );
            }
            return elementsToReturn;
        }
    },
    'moderationAccepted'({moderationId}){
        // Type check to prevent malicious calls
        check(moderationId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // TODO: Vefier que l'user est legitime d'accepter une mdoeration
            const currentModeration = Moderation.findOne({_id: moderationId});
            switch(currentModeration.reason){
                case 'newProduct':
                    // New product accepted, it's already in the Products db so we only need to remove it from Moderation
                    break;
                case 'duplicate':
                case 'offTopic':
                    // Duplicate or off topic approved, removing the product and it's images
                    var productImages = Products.findOne({_id: currentModeration.elementId}).images;  // Catching the product images
                    Products.remove(currentModeration.elementId, function(error, result){
                        if(error){
                            // There was an error while removing the product
                            throw new Meteor.Error('removeProductFailed', 'La suppression du produit a échoué, veuillez réessayer.');
                        } else{
                            // The product was successfully removed, we can now delete it's images
                            for(var image of productImages){
                                Images.remove(image);
                            }
                        }
                    });
                    break;
            }
            // Now let's catch the correponding contribution to update it's status
            const contributionId = Contributions.findOne({moderationId: moderationId})._id;
            Contributions.update(contributionId, { $set: { status: 'accepted' } } );
            // Removing the moderation
            Moderation.remove(moderationId);
            return true;
        }
    },
    'rejectEditModeration'({editedProductId}){
        // Type check to prevent malicious calls
        check(editedProductId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // TODO: Check if user is admin
            // Catching the product to delete
            const editedProduct = EditedProducts.findOne({_id: editedProductId});
            // Edit proposition was rejected, we delete it from the database
            EditedProducts.remove(editedProductId, function(error, result){
                if(error){
                    // There was an error while removing the edit proposition
                    throw new Meteor.Error('removeProductFailed', 'La suppression du produit a échoué, veuillez réessayer.');
                } else{
                    // Edit proposition was successfully removed, we check it's images to delete those who aren't in the real product
                    const editedProductImages = editedProduct.images;
                    const productImages = Products.findOne({_id: editedProduct.originalId}).images;
                    for(var imageId of editedProductImages){
                        if(!productImages.includes(imageId)){
                            // Image isn't in the product's ones, we can delete it safely delete it
                            Images.remove(imageId);
                        }
                    }
                    // Now let's catch the correponding contribution to update it's status
                    const originalProductId = editedProduct.originalId;
                    const moderationId = Moderation.findOne({elementId: originalProductId})._id;
                    const contributionId = Contributions.findOne({moderationId: moderationId})._id;
                    // Updating the status
                    Contributions.update(contributionId, { $set: { status: 'rejected' } });
                    // Deleting the moderation
                    Moderation.remove(moderationId);
                }
            });
        }
    },
    'approveEditModeration'({editedProductId}){
        // Type check to prevent malicious calls
        check(editedProductId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // TODO: Check if user is admin
            // Catching the edited product
            const editedProduct = EditedProducts.findOne({_id: editedProductId});
            // Edit proposition was approved, updating the current product with modified informations
            const productId = editedProduct.originalId;
            const originalProduct = Products.findOne({_id: productId});
            Products.update(productId, { $set: {
                name: editedProduct.name,
                description: editedProduct.description,
                images: editedProduct.images,
                categories: editedProduct.categories
            }}, function(error, result){
                if(error){
                    // There was an error while updating the product
                    throw new Meteor.Error('productUpdateFailed', 'La mise à jour du produit a échoué, veuillez réessayer.');
                } else{
                    // Product was successfully modified, we check images to delete those who aren't in the real product anymore
                    const oldImages = originalProduct.images;
                    const newImages = editedProduct.images;
                    for(var imageId of oldImages){
                        if(!newImages.includes(imageId)){
                            // This image isn't used in the product anymore, we can delete it
                            Images.remove(imageId);
                        }
                    }

                    // Now let's catch the correponding contribution to update it's status
                    const originalProductId = editedProduct.originalId;
                    const moderationId = Moderation.findOne({elementId: originalProductId})._id;
                    const contributionId = Contributions.findOne({moderationId: moderationId})._id;
                    // Updating the status
                    Contributions.update(contributionId, { $set: { status: 'accepted' } });
                    // Deleting the edited product
                    EditedProducts.remove(editedProductId);
                    // Deleting the moderation
                    Moderation.remove(moderationId);
                }
            });
        }
    }
});
