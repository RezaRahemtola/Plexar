// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// HTML import
import './forgotPassword.html';

// Functions import
import '../functions/checkInputs.js';


Template.forgotPassword.events({
    'submit form' (event){
        // When the form is submitted
        event.preventDefault();
        var form = new FormData(document.getElementById('forgotPassword'));  // Catching form data
        var email = form.get('email');  // Catching email input
        Accounts.forgotPassword({email: email}, function(error){
            if(error){
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});
            } else{
                Session.set('message', {type: "header", headerContent: "Un email pour réinitialiser votre mot de passe vous a été envoyé", style: "is-success"});  // Success message
                Session.set('userPage', 'login');
            }
        });
    }
});
