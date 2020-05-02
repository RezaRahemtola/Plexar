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
        var navigation = Session.get('navigation');  // Catching navigation history
        navigation.push(Session.get('page'));  // Adding the current page
        Session.set('navigation', navigation);  // Updating the value
        Session.set('page', 'moderation');
    }
});
