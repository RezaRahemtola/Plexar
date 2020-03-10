// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// HTML import
import './forgotPassword.html';
import '../messages/forgotPasswordEmailSent.html';

// Form validation functions import
import './formValidation.js';


Template.forgotPassword.onRendered(function(){
    Session.set('formErrorMessage', null);  // Reseting formErrorMessage
});

Template.forgotPassword.helpers({
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
  }
});


Template.forgotPassword.events({
    'submit form' (event){
        // When the form is submitted
        event.preventDefault();
        var form = new FormData(document.getElementById('forgotPassword'));  // Catching form data
        var email = form.get('email');  // Catching email input
        Accounts.forgotPassword({email: email}, function(error){
            if(error){
                Session.set('formErrorMessage', error.reason);
            } else{
                Session.set('message', 'forgotPasswordEmailSent');  // Success message
                Session.set('userPage', 'login');
            }
        });
    }
});
