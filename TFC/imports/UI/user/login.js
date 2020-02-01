// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { Utilisateurs } from '../../bdd/utilisateurs.js';

// HTML imports
import './login.html';
import './formValidation.js';



Template.login.helpers({
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
  }
});

Template.login.events({
    'submit form' (event){
        event.preventDefault();
        var form = new FormData(document.getElementById('login'));
        var email = form.get('email');
        var password = form.get('password');
        Meteor.loginWithPassword(email, password, function(error){
            if(error){
                Session.set('formErrorMessage', error.reason);
            } else{
                Session.set('formErrorMessage', null);  // Reseting formErrorMessage
                Session.set('userPage', '');  // Send the logged user to userprofile page
            }
        });
    },
    'click .forgotPassword' (event){
        event.preventDefault();
        Session.set('userPage', 'forgotPassword');
    }
});
