// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// HTML import
import './forgotPassword.html';


Template.forgotPassword.onRendered(function(){
    // Live email validation
    const emailInput = document.querySelector('input#email');
    emailInput.onchange = function(){
        // Value looks like a valid email adress, checking if it's already taken
        Meteor.call('checkIfEmailIsTaken', {email: emailInput.value}, function(error, result){
            if(!result){
                // Email is not already used
                $('input#email').addClass("is-danger");
                document.querySelector('#emailField p.help.is-danger').textContent = "Cette adresse email ne correspond à aucun compte";  // Adding a danger help message
            } else{
                // Email is in our database
                $('input#email').removeClass("is-danger");
                document.querySelector('#emailField p.help.is-danger').textContent = "";  // Removing danger help message
            }
        });

    }
});

Template.forgotPassword.events({
    'click #forgotPasswordSubmit' (event){
        // When the form is submitted
        event.preventDefault();
        $(event.target).addClass("is-loading");  // Add a loading effect to the button
        var form = new FormData(document.getElementById('forgotPassword'));  // Catching form data
        var email = form.get('email');  // Catching email input
        Accounts.forgotPassword({email: email}, function(error){
            if(error){
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});
                $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
            } else{
                Session.set('message', {type: "header", headerContent: "Un email pour réinitialiser votre mot de passe vous a été envoyé", style: "is-success"});  // Success message
                Session.set('modal', null);  // Remove the modal
            }
        });
    }
});


Template.forgotPassword.helpers({
    messageToDisplay: function(){
        var message = Session.get('message');
        if(message !== null){
            // There is a message to display
            return message.type;  // Return the message to display
        }
    }
});
