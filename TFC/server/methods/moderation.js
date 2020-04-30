// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { Images } from '../../imports/databases/images.js';
import { Moderation } from '../../imports/databases/moderation.js';

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
            // Removing the moderation
            Moderation.remove(moderationId);
            return true;
        }
    }
});
