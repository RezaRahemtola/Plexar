// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './report.html';

// CSS import
import '../css/form.css';

// Database imports
import { Moderation } from '../../databases/moderation.js';


Template.report.events({
    'click #reportSubmit' (event){
        // TODO: En fonction du nombre de points/admin de l'user, instant valider le report et effectuer l'action correspondante
        const productId = document.querySelector('button.report').id;
        const checkedOption = document.querySelector("input[type='radio'][name='reportReason']:checked").id;
        Meteor.call('reportProduct', {productId: productId, reason: checkedOption}, function(error, result){
            if(error){
                // TODO: error display
            } else{
                // Product was successfully reported, removing the report modal and showing a success message
                Session.set('modal', null);
                Session.set('message', {type: "header", headerContent: "Signalement effectué avec succès !", style:"is-success"} );
            }
        });
    }
});
