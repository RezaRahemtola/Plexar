// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './contributions.html';

// Initializing Session variable
Session.set('levelProgressInformations', {});
Session.set('pointsLeftUntilNextLevel', 0);


Template.contributions.onRendered(function(){
    if(Meteor.user()){
        // User is logged in, updating his points
        Meteor.call('updateAndGetUserPoints');
    }
});


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
    },
    displayLevelProgress: function(){
        Meteor.call('getLevelProgressInformations', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Value and maximum of the progress bar were returned, saving them in a Session variable
                Session.set('levelProgressInformations', result);
            }
        });
        // Returning it in an array to use {{#each}}
        return [Session.get('levelProgressInformations')];
    },
    calculateProgressPercentage: function(){
        // Checking if progress bar informations were retrieved
        if(Session.get('levelProgressInformations') !== {}){
            // Progress bar informations are set, calculating the percentage
            const value = Session.get('levelProgressInformations').progressValue;
            const max = Session.get('levelProgressInformations').progressMaximum;
            const result = value / max * 100;
            // The result may have many decimals, so we will round it (https://stackoverflow.com/a/12830454/12171474)
            return +result.toFixed(2);
        }
    },
    displayPointsLeftUntilNextLevel: function(){
        Meteor.call('getPointsLeftUntilNextLevel', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Number of points left before reaching the next level retrieved successfully, saving it in a Session variable
                Session.set('pointsLeftUntilNextLevel', result);
            }
        });
        return Session.get('pointsLeftUntilNextLevel');
    }
});


Template.contributions.events({
    'click #infoPointsAndLevels'(event){
        event.preventDefault();
        // The "more informations" icon is clicked
        Session.set('displayedFaqQuestion', 'pointsAndLevels');  // Updating the value of the question to display
        Session.set('page', 'faq');  // Sending the user to faq page
    }
});
