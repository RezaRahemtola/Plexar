// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './bestContributors.html';

// Initializing Session variables
Session.set('userRank', 0);  // We don't know the user rank for the moment
Session.set('bestContributors', []);


Template.bestContributors.onRendered(function(){
    // Scrolling the window back to the top
    window.scrollTo(0, 0);
});


Template.bestContributors.helpers({
    displayUserRank: function(){
        Meteor.call('getUserRank', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // User rank was successfully retrieved, saving it in a Session variable
                Session.set('userRank', result);
            }
        });
        return Session.get('userRank');
    },
    displayBestContributors: function(){
        Meteor.call('getBestContributors', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Best contributors array was return, saving it in a Session variable
                Session.set('bestContributors', result);
            }
        });
        return Session.get('bestContributors');
    },
    contributorInPodium: function(rank){
        // Checking if the given rank is in the podium
        if(rank === 1 || rank === 2 || rank === 3){
            // This contributor is in the podium
            return true;
        }
        return false;
    },
    firstPlace: function(rank){
        if(rank === 1){
            return true;
        }
        return false;
    },
    getMedalUrl: function(rank){
        if(rank === 1){ return 'goldMedal.png'; }
        else if(rank === 2){ return 'silverMedal.png'; }
        else if(rank === 3){ return 'bronzeMedal.png'; }
    }
});
