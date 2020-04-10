// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productBanner.html';

// CSS imports
import './css/image.css';
import './css/banners.css';

// Database imports
import { Products } from '../databases/products.js';
import { Images } from '../databases/images.js';
import { Moderation } from '../databases/moderation.js';


Template.productBanner.helpers({
    displayProductFirstImage: function(productID){
        var firstImageID = Products.findOne({_id: productID}).imagesID[0];  // Return the ID of the first product image
        return Images.findOne({_id: firstImageID}).url();  // Return the url of the image
    },
    displayProductCategories: function(productID){
        return Products.findOne({_id: productID}).categories;
    },
    underModeration: function(productID){
        // TODO: check if current user is an admin/power users
        var isUnderModeration = (Moderation.findOne({elementId: productID})) ? true : false;
        if(Session.get('userPage') === 'moderation' && isUnderModeration){
            return true;
        }
        return false;
    },
    displayModerationControls: function(productID){
        var moderationCursor = [Moderation.findOne({elementId: productID})];
        var formattedMoration = [];
        moderationCursor.forEach(function(doc){
            switch(doc.reason){
                case 'newProduct':
                    doc.reasonText = "Proposition d'ajout";
                    doc.approveText = "Valider l'ajout";
                    doc.rejectText = "Rejeter l'ajout";
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
    }
});
