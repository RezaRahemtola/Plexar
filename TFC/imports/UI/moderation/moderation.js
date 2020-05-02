// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './moderation.html';

// JS imports
import './moderationBanner.js';
import './editProductModeration.js';
import './moderationProductPage.js';


Template.moderation.helpers({
    displayModeration: function(){
        Meteor.call('displayModeration', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                Session.set('moderationElements', result);
            }
        });

        return Session.get('moderationElements');
    },
    moderationCounter: function(){
        Meteor.call('moderationCounter', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                Session.set('moderationCounter', result);
            }
        });
        return [Session.get('moderationCounter')];
    }
});


Template.moderation.events({
    'click .moderationBanner'(event){
        // When a moderation banner is clicked
        Session.set('currentProduct', null);  // Reset the variable
        Meteor.call('findOneProductById', {productId: event.currentTarget.id}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                Session.set('currentProduct', result);
            }
        });
        var navigation = Session.get('navigation');  // Catching navigation history
        navigation.push(Session.get('page'));  // Adding the current page
        Session.set('navigation', navigation);  // Updating the value
        Session.set('page', 'moderationProductPage');
    },
    'click .moderationAccepted'(event){
        event.preventDefault();

        const moderationId = event.currentTarget.id;

        Meteor.call('moderationAccepted', {moderationId: moderationId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Moderation successfully accepted, calling the template helper to refresh the list of product under moderation
                Template.moderation.__helpers.get('displayModeration').call();
            }
        });
    },
    'click .moderationRejected'(event){
        event.preventDefault();

        const moderationId = event.currentTarget.id;

        Meteor.call('moderationRejected', {moderationId: moderationId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Moderation successfully rejected, calling the template helper to refresh the list of product under moderation
                Template.moderation.__helpers.get('displayModeration').call();
            }
        });
    },
    'click .seeEdit'(event){
        // TODO: Check if user is admin
        event.preventDefault();
        const productId = event.currentTarget.id;
        Meteor.call('findOneProductById', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Saving the result in a variable
                Session.set('editProductModeration', {originalProduct: result} );
                Meteor.call('findOneEditedProductByOriginalId', {originalId: productId}, function(error, result){
                    if(error){
                        // There was an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    } else if(result){
                        // Catching the object with original product and adding the edited one
                        var editModeration = Session.get('editProductModeration');
                        editModeration.editedProduct = result;
                        Session.set('editProductModeration', editModeration);
                        var navigation = Session.get('navigation');  // Catching navigation history
                        navigation.push(Session.get('page'));  // Adding the current page
                        Session.set('navigation', navigation);  // Updating the value
                        Session.set('page', 'editProductModeration');
                    }
                })
            }
        });
    }
});
