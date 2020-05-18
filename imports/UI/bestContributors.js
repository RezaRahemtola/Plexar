// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './bestContributors.html';

// Initializing Session variables
Session.set('userRank', 0);
Session.set('bestContributors', []);

Template.bestContributors.helpers({
    displayUserRank: function(){
        Meteor.call('getUserRank', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
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
    firstPlace: function(rank){
        if(rank === 1){
            return true;
        }
        return false;
    }
});
