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
    }
});
