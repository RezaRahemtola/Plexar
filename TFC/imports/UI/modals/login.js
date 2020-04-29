// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './login.html';

// CSS import
import '../css/form.css';


Template.login.onRendered(function(){
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


Template.login.events({
    'click #loginSubmit' (event){
        event.preventDefault();
        $(event.target).addClass("is-loading");  // Add a loading effect to the button
        var form = new FormData(document.getElementById('loginForm'));
        var email = form.get('email');
        var password = form.get('password');
        Meteor.loginWithPassword(email, password, function(error){
            if(error){
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});
                $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
            } else{
                Session.set('modal', null)  // Remove the login modal
            }
        });
    },
    'click #forgotPassword' (event){
        event.preventDefault();
        Session.set('modal', 'forgotPassword');
    }
});
