// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './contributions.html';

// Initializing Session variable
Session.set('userPoints', 0);

Template.contributions.helpers({
    displayContributions: function(){
        Meteor.call('displayContributions', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                Session.set('userContributions', result);
            }
        });
        return Session.get('userContributions');
    },
    displayPoints: function(){
        Meteor.call('getUserPoints', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                Session.set('userPoints', result)
            }
        });
        return Session.get('userPoints');
    },
    displayUserLevel: function(){
        Meteor.call('getUserLevel', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // User level was successfully retrieved, saving it in a Session variable
                Session.set('userLevel', result);
            }
        });
        return Session.get('userLevel');
    }
});


Template.contributions.events({
    'click #infoPointsAndLevels'(event){
        event.preventDefault();
        // More informations icon is clicked
        Session.set('displayedFaqQuestion', 'pointsAndLevels');  // Updating the value of the question to display
        Session.set('page', 'faq');  // Sending the user to faq page
    }
});
