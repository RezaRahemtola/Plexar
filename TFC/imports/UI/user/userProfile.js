// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// HTML import
import './userProfile.html';

// JS imports
import './register.js';
import './login.js';
import './forgotPassword.js';
import './editProfile.js';
import './favorite.js';

Session.set('userPage', '');  // Set the page to default

Template.userProfile.onRendered(function(){
    $("li.is-active").removeClass("is-active");  // Remove active from all tabs
});


Template.userProfile.helpers({
    currentUserPage: function(userPage){
        return Session.get('userPage');  // Return current page on user profile
  },
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
    }
});


Template.userProfile.events({
    'click #editProfile' (event){
        event.preventDefault();
        $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
        event.currentTarget.classList.add("is-active");  // Set the current tab as the active one
        Session.set('userPage', 'editProfile');
    },
    'click #favorite' (event){
        event.preventDefault();
        $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
        event.currentTarget.classList.add("is-active");  // Set the current tab as the active one
        Session.set('userPage', 'favorite');
    }
});
