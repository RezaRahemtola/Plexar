// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './moderationBanner.html';

// CSS imports
import '../css/image.css';
import '../css/banners.css';

// Database imports
import { Products } from '../../databases/products.js';
import { Images } from '../../databases/images.js';
import { Moderation } from '../../databases/moderation.js';


Template.moderationBanner.helpers({
    displayProductFirstImage: function(images){
        return Images.findOne({_id: images[0]}).url();  // Return the url of the image
    },
    underModeration: function(productId){
        // TODO: check if current user is an admin/power users
        var isUnderModeration = (Moderation.findOne({elementId: productId})) ? true : false;
        if(Session.get('page') === 'moderation' && isUnderModeration){
            return true;
        }
        return false;
    },
    displayModerationControls: function(productId){
        var moderationCursor = [Moderation.findOne({elementId: productId})];
        var formattedMoration = [];
        moderationCursor.forEach(function(doc){
            switch(doc.reason){
                case 'newProduct':
                    doc.reasonText = "Proposition d'ajout";
                    doc.approveText = "Valider l'ajout";
                    doc.rejectText = "Rejeter l'ajout";
                    break;
                case 'editProduct':
                    doc.reasonText = "Proposition de modification";
                    doc.approveText = "Valider les modifications";
                    doc.rejectText = "Rejeter les modifications";
                    break;
                case 'duplicate':
                    doc.reasonText = "Signalement : Produit référencé plusieurs fois.";
                    doc.approveText = "Supprimer le produit";
                    doc.rejectText = "Garder le produit";
                    break;
                case 'offTopic':
                    doc.reasonText = "Signalement : Produit hors-sujet";
                    doc.approveText = "Supprimer le produit";
                    doc.rejectText = "Garder le produit";
                    break;
                case 'incorrectInformations':
                    doc.reasonText = "Signalement : Informations incorrectes";
                    // TODO: Récupérer le champ plus d'infos pour personnaliser les boutons
                    doc.approveText = "";
                    doc.rejectText = "";
                    break;
                default:
                    // Unknown reason
                    doc.reasonText = doc.reason;
                    doc.approveText = "Garder le produit";
                    doc.rejectText = "Supprimer le produit";
            }
            formattedMoration.push(doc);
        });
        return formattedMoration;
    },
    editModeration: function(productId){
        var moderation = Moderation.findOne({elementId: productId});
        if(moderation.reason === 'editProduct'){
            // It's an edit suggestion, display a button to see edits
            return [{_id: productId}];
        }
    }
});


Template.moderationBanner.events({
    'click #seeEdit'(event){
        // TODO: Check if user is admin
        event.preventDefault();
        var productId = event.currentTarget.id;
        var originalProduct = Products.findOne({_id: productId});
        var editedProduct = EditedProducts.findOne({originalId: productId});
    }
});
