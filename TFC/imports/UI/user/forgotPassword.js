// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { Utilisateurs } from '../../bdd/utilisateurs.js';

// HTML import
import './forgotPassword.html';

// Form validation functions import
import './formValidation.js';


Template.forgotPassword.onRendered(function(){
    Session.set('formErrorMessage', null);  // Reseting formErrorMessage
});


Template.forgotPassword.events({
    'submit form' (event){
        event.preventDefault();
        var form = new FormData(document.getElementById('forgotPassword'));
        var email = form.get('email');
        Accounts.forgotPassword({email: email}, function(error){
            if(error){
                Session.set('formErrorMessage', error.reason);
            } else{
                alert("Email envoyé avec succès");  // Success message
                Session.set('userPage', '');  // Send the logged user to userprofile page
            }
        });
    }
});
