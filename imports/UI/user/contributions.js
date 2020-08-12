// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './contributions.html';

// Initializing Session variables
Session.set('levelProgressInformations', {});
Session.set('pointsLeftUntilNextLevel', 0);
Session.set('levelIcon', '');


FlowRouter.route('/user/contributions', {
    name: 'userContributions',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'userProfile', currentUserPage: 'contributions'});
    }
});


Template.contributions.onRendered(function(){
    if(Meteor.user()){
        // User is logged in, updating his points
        Meteor.call('updateAndGetUserPoints');
    }

    $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
    $("li#contributions").addClass("is-active");  // Set the current tab as the active one
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
    displayLevelIcon: function(){
        // Let's catch the icon that corresponds to the user's level
        Meteor.call('getLevelIcon', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Level icon was successfully retrieved, saving it in a Session variable
                Session.set('levelIcon', result);
            }
        });
        return Session.get('levelIcon');
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
        return Session.get('levelProgressInformations');
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
