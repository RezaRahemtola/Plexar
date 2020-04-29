// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './moderation.html';

// JS import
import './moderationBanner.js';


Template.moderation.helpers({
    displayModeration: function(){
        Meteor.call('displayModeration', function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                Session.set('moderationElements', result);
            }
        });

        return Session.get('moderationElements');
    }
});


Template.moderation.events({
    'click .moderationAccepted'(event){
        event.preventDefault();

        const moderationId = event.currentTarget.id;

        Meteor.call('moderationAccepted', {moderationId: moderationId}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Moderation successfully accepted, calling the template helper to refresh the list of product under moderation
                Template.moderation.__helpers.get('displayModeration').call();
            }
        });
    }
});
