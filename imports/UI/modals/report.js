// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './report.html';

// CSS import
import '../css/form.css';

// Database imports
import { Moderation } from '../../databases/moderation.js';


FlowRouter.route('/reportProduct/:_id', {
    name: 'reportProduct',
    action(params, queryParams){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentModal: 'report'});

        // With the given id, we search for the product
        const productId = params["_id"];
        Meteor.call('findOneProductById', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Product was successfully returned, saving it in a Session variable
                Session.set('currentProduct', result);
            }
        });
    }
});


Template.report.events({
    'click #reportSubmit' (event){
        // Catching parameters for the report
        const productId = Session.get('currentProduct')._id;
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
                        // Product was successfully reported, showing a success message
                        Session.set('message', {type: "header", headerContent: "Signalement effectué avec succès !", style:"is-success"} );
                        FlowRouter.go('/product/'+productId);  // Sending the user back to the product
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
