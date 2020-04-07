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
import './moderation.js';


Template.userProfile.onRendered(function(){
    $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
    $("li#"+Session.get('userPage')).addClass("is-active");  // Set the current tab as the active one
});


Template.userProfile.helpers({
    currentUserPage: function(){
        return Session.get('userPage');
    }
});


Template.userProfile.events({
    'click #informations, click #favorite, click #contributions, click #moderation'(event){
        // Switching tabs
        event.preventDefault();
        Session.set('userPage', event.currentTarget.id);
    }
});
