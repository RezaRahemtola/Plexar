// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { Utilisateurs } from '../../bdd/utilisateurs.js';

// HTML imports
import './forgotPassword.html';
import './formValidation.js';



Template.forgotPassword.events({
    'submit form' (event){
        event.preventDefault();
        var form = new FormData(document.getElementById('forgotPassword'));
        var email = form.get('email');
        Accounts.forgotPassword({email: email}, function(error){
            if(error){
                Session.set('formErrorMessage', error.reason);
            } else{
                console.log("Email envoyé avec succès");  // Success message
                Session.set('formErrorMessage', null);  // Reseting formErrorMessage
                Session.set('userPage', '');  // Send the logged user to userprofile page
            }
        });
    }
});
