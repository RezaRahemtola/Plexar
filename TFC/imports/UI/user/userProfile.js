// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { Utilisateurs } from '../../bdd/utilisateurs.js';

// HTML import
import './userProfile.html';

// JS imports
import './register.js';
import './login.js';
import './forgotPassword.js';
import './editProfile.js';

Session.set('userPage', '');  // Set the page to default

Template.userProfile.helpers({
    currentUserPage: function(userPage){
        return Session.get('userPage');  // Return current page on user profile
  },
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
    }
});

Template.userProfile.events({
    'click .register' (event){
        event.preventDefault();
        Session.set('userPage', 'register');
    },
    'click .login' (event){
        event.preventDefault();
        Session.set('userPage', 'login');
    },
    'click .logout' (event){
        event.preventDefault();
        Session.set('userPage', '');  // Set the page to default
        Meteor.logout();  // Log out the user
    },
    'click .editProfile' (event){
        event.preventDefault();
        Session.set('userPage', 'editProfile');
    }
});
