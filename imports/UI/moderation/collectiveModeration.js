// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './collectiveModeration.html';

// JS imports
import './moderationBanner.js';
import './editProductModeration.js';
import './moderationProductPage.js';

// Initializing Session variables
Session.set('currentDailyVotes', 0);
Session.set('currentDailyVotesLimit', 0);


FlowRouter.route('/collectiveModeration', {
    name: 'collectiveModeration',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'collectiveModeration'});
        // Scrolling the window back to the top
        window.scrollTo(0, 0);
    }
});


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
        return Session.get('moderationCounter');
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
    'click .moderationAccepted'(event){
        event.preventDefault();
        // Catching moderationId for the call
        const moderationId = event.currentTarget.id;

        /* We will remove this moderation from the list to avoid the following error :
        if any information is removed from databases, display functions will throw errors as they'll not be able to retrive it */

        // Catching the elements
        const moderationElements = Session.get('moderationElements');

        // Looping on the elements to find the current one
        for(const [index, element] of moderationElements.entries()){
            if(element._id === moderationId){
                // This element is the one we are looking for, removing it
                moderationElements.pop(index);
                // Updating the Session variable with the modified array
                Session.set('moderationElements', moderationElements);
                break;  // We've found the element, exiting the loop
            }
        }

        Meteor.call('moderationAccepted', {moderationId: moderationId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Moderation successfully accepted, calling the template helper to refresh the list of product under moderation
                Template.collectiveModeration.__helpers.get('displayModeration').call();
                // Checking if user is admin
                const userIsAdmin = Session.get('userIsAdmin');
                if(userIsAdmin){
                    // Refreshing stats displayed for admins
                    Template.collectiveModeration.__helpers.get('moderationCounter').call();
                }
            }
        });
    },
    'click .moderationRejected'(event){
        event.preventDefault();
        // Catching moderationId for the call
        const moderationId = event.currentTarget.id;

        /* We will remove this moderation from the list to avoid the following error :
        if any information is removed from databases, display functions will throw errors as they'll not be able to retrive it */

        // Catching the elements
        const moderationElements = Session.get('moderationElements');

        // Looping on the elements to find the current one
        for(const [index, element] of moderationElements.entries()){
            if(element._id === moderationId){
                // This element is the one we are looking for, removing it
                moderationElements.pop(index);
                // Updating the Session variable with the modified array
                Session.set('moderationElements', moderationElements);
                break;  // We've found the element, exiting the loop
            }
        }

        Meteor.call('moderationRejected', {moderationId: moderationId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Moderation successfully rejected, calling the template helper to refresh the list of product under moderation
                Template.collectiveModeration.__helpers.get('displayModeration').call();
                // Checking if user is admin
                const userIsAdmin = Session.get('userIsAdmin');
                if(userIsAdmin){
                    // Refreshing stats displayed for admins
                    Template.collectiveModeration.__helpers.get('moderationCounter').call();
                }
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
                                FlowRouter.go('/collectiveModeration/editedProduct/'+productId);
                            }
                        });
                    }
                });
            }
        });
    }
});
