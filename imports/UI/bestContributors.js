// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './bestContributors.html';

// Initializing Session variable
Session.set('bestContributors', []);

Template.bestContributors.helpers({
    displayBestContributors: function(){
        Meteor.call('getBestContributors', function(error, result){
            if(error){
                // There was an error
                // TODO: error
            } else if(result){
                // Best contributors array was return, saving it in a Session variable
                Session.set('bestContributors', result);
            }
        });
        return Session.get('bestContributors');
    }
});
