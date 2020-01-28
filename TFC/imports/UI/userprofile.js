// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Utilisateurs } from '../bdd/utilisateurs.js';

// HTML imports
import './userProfile.html';

Session.set('userPage', '');  // Set the page to default

Template.userProfile.helpers({
    currentUserStatus: function(userPage){
        return Session.get('userPage');
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
                    Session.set('userPage', '');  // Send the new user to userprofile page
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
                Session.set('userPage', '');  // Send the logged user to userprofile page
            }
        });
    },
    'click .forgotPassword' (event){
        event.preventDefault();
        Session.set('userPage', 'forgotPassword');
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
                Session.set('userPage', '');  // Send the logged user to userprofile page
            }
        });
    }
});

Template.editProfile.events({
    'submit form' (event){
        event.preventDefault();
        var form = new FormData(document.getElementById('editProfile'));
        var firstName = form.get('firstName');
        var lastName = form.get('lastName');
        var email = form.get('email');
        // TODO:  Insert informations of the form in the Utilisateurs database
        Session.set('userPage', '');
    }
});
