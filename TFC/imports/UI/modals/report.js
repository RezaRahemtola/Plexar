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
        // Catching parameters for the report
        const productId = document.querySelector('button.report').id;
        const checkedOption = document.querySelector("input[type='radio'][name='reportReason']:checked").id;

        // Checking that the product isn't already under moderation
        Meteor.call('checkIfProductInModeration', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Product is already in moderation, display an helping message
                Session.set('message', {type:"header", headerContent:"Ce produit est déjà en modération, veuillez réessayer ultérieurement.", style:"is-warning"} );
            } else{
                // Product isn't already under moderation, we can create the report
                Meteor.call('reportProduct', {productId: productId, reason: checkedOption}, function(error, result){
                    if(error){
                        // There was an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    } else{
                        // Product was successfully reported, removing the report modal and showing a success message
                        Session.set('modal', null);
                        Session.set('message', {type: "header", headerContent: "Signalement effectué avec succès !", style:"is-success"} );
                    }
                });
            }
        });
    }
});


Template.report.helpers({
    messageToDisplay: function(){
        var message = Session.get('message');
        if(message !== null){
            // There is a message to display
            return message.type;  // Return the message to display
        }
    }
});
