// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// HTML import
import './userProfile.html';

// JS imports
import './informations.js';
import './favorite.js';
import './contributions.js';

Session.set('userPage', '');  // Set the page to default

Template.userProfile.onRendered(function(){
    $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
    $("li#"+Session.get('userPage')).addClass("is-active");  // Set the current tab as the active one
});

Template.userProfile.helpers({
    currentUserPage: function(){
        return Session.get('userPage');  // Return current page on user profile
  }
});


Template.userProfile.events({
    'click #informations, click #favorite, click #contributions'(event){
        // Prevent default action for all events
        event.preventDefault();
    },
    'click #informations'(event){
        Session.set('userPage', 'informations');
    },
    'click #favorite'(event){
        Session.set('userPage', 'favorite');
    },
    'click #contributions'(event){
        Session.set('userPage', 'contributions');
    }
});
