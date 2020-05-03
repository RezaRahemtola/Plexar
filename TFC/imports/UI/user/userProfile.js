// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// HTML import
import './userProfile.html';

// JS imports
import './contributions.js';
import './favorite.js';
import './informations.js';


Template.userProfile.onRendered(function(){
    $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
    $("li#"+Session.get('userPage')).addClass("is-active");  // Set the current tab as the active one
});


Template.userProfile.helpers({
    currentUserPage: function(){
        return Session.get('userPage');
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
    }
});


Template.userProfile.events({
    'click #informations, click #favorite, click #contributions'(event){
        // Switching tabs
        event.preventDefault();
        Session.set('userPage', event.currentTarget.id);
    },
    'click #moderation'(event){
        event.preventDefault();
        // Checking is user is admin
        Meteor.call('userIsAdmin', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else if(result){
                // User is admin
                var navigation = Session.get('navigation');  // Catching navigation history
                navigation.push(Session.get('page'));  // Adding the current page
                Session.set('navigation', navigation);  // Updating the value
                Session.set('page', 'moderation');
            }
        });
    }
});
