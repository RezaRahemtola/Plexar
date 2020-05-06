// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './collectiveModeration.html';

// JS imports
import './moderationBanner.js';
import './editProductModeration.js';
import './moderationProductPage.js';

// Initializing Session variables
Session.set('currentDailyVotes', 0);
Session.set('currentDailyVotesLimit', 0);


Template.collectiveModeration.helpers({
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
    },
    userIsAdmin: function(){
        // Checking is user is admin
        Meteor.call('userIsAdmin', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else if(result === true || result === false){
                // Method successfully executed, saving the result
                Session.set('userIsAdmin', result);
            }
        });
        return Session.get('userIsAdmin');
    },
    displayCurrentDailyVotes: function(){
        // Display user's number of participations to collective moderation today
        Meteor.call('displayCurrentDailyVotes', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Saving the result in a Session variable to display it after
                Session.set('currentDailyVotes', result);
            }
        });
        return Session.get('currentDailyVotes');
    },
    displayCurrentDailyVotesLimit: function(){
        // Display user's limit of participations to collective moderation
        Meteor.call('displayCurrentDailyVotesLimit', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Saving the result in a Session variable to display it after
                Session.set('currentDailyVotesLimit', result);
            }
        });
        return Session.get('currentDailyVotesLimit');
    }
});


Template.collectiveModeration.events({
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
                Template.collectiveModeration.__helpers.get('displayModeration').call();
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
                Template.collectiveModeration.__helpers.get('displayModeration').call();
            }
        });
    },
    'click .seeEdit'(event){
        event.preventDefault();
        // Catching the moderationId
        const moderationId = event.currentTarget.id;

        // Catching the editedProductId with this moderation moderationId
        Meteor.call('findModerationElementId', {moderationId: moderationId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Catching edited product Id and retriving the whole edited product with it
                const editedProductId = result;
                Meteor.call('findOneEditedProductById', {editedProductId: editedProductId}, function(error, result){
                    if(error){
                        // There was an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    } else if(result){
                        // Result is the edited product, saving it and finding the original product with it's originalid
                        const editedProduct = result;
                        const productId = result.originalId;

                        Meteor.call('findOneProductById', {productId: productId}, function(error, result){
                            if(error){
                                // There was an error
                                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                            } else if(result){
                                // Result is the original product, catching it and saving moderationId, editedProduct and originalProduct in a Session variable
                                const originalProduct = result;
                                Session.set('editProductModeration', {moderationId: moderationId, editedProduct: editedProduct, originalProduct: originalProduct});
                                var navigation = Session.get('navigation');  // Catching navigation history
                                navigation.push(Session.get('page'));  // Adding the current page
                                Session.set('navigation', navigation);  // Updating the value
                                Session.set('page', 'editProductModeration');
                            }
                        });
                    }
                });
            }
        });
    }
});
