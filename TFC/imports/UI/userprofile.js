// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Utilisateurs } from '../bdd/utilisateurs.js';

// HTML imports
import './userprofile.html';

Template.userprofile.events({
    'click .register' (event){
        event.preventDefault();
        Session.set('page', 'register');
    },
    'click .login' (event){
        event.preventDefault();
        Session.set('page', 'login');
    },
    'click .logout' (event){
        event.preventDefault();
        Meteor.logout();  // Log out the user
    },
    'click .editProfile' (event){
        event.preventDefault();
        Session.set('page', 'editProfile');
    }
});

Template.register.events({
    'submit form'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('register'));
        var username = form.get('username');
        var email = form.get('email');
        var password = form.get('password');

        // Creating the new user
        Accounts.createUser({
            username: username,
            email: email,
            password: password
        }, function(error){
                if(error){
                    console.log(error.reason); // Output error if registration fails
                } else{
                    // TODO: Define things to complete in Utilisateurs (db collums order)
                    Session.set('page', 'userprofile');  // Send the new user to userprofile page
                }
            });
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
                console.log(error.reason);
            } else{
                Session.set('page', 'userprofile');  // Send the logged user to userprofile page
            }
        });
    },
    'click .forgotPassword' (event){
        event.preventDefault();
        Session.set('page', 'forgotPassword');
    }
});

Template.forgotPassword.events({
    'submit form' (event){
        event.preventDefault();
        var form = new FormData(document.getElementById('forgotPassword'));
        var email = form.get('email');
        Accounts.forgotPassword({email: email}, function(error){
            if(error){
                console.log(error.reason);
            } else{
                console.log("Email envoyé avec succès")
                Session.set('page', 'userprofile');  // Send the logged user to userprofile page
            }
        });
    }
});
