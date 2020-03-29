// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// HTML import
import './login.html';

// CSS import
import '../css/form.css';

// Functions import
import '../functions/checkInputs.js';


Template.login.events({
    'click #submitForm' (event){
        event.preventDefault();
        event.target.classList.add("is-loading");  // Add a loading effect to the button
        var form = new FormData(document.getElementById('login'));
        var email = form.get('email');
        var password = form.get('password');
        Meteor.loginWithPassword(email, password, function(error){
            if(error){
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});
                event.target.classList.remove("is-loading");  // Remove the loading effect of the button
            } else{
                Session.set('userPage', '');  // Send the logged user to userprofile page
            }
        });
    },
    'click #forgotPassword' (event){
        event.preventDefault();
        Session.set('userPage', 'forgotPassword');
    }
});
