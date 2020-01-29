// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Utilisateurs } from '../bdd/utilisateurs.js';

// HTML imports
import './userProfile.html';
import './formValidation.js'

Session.set('userPage', '');  // Set the page to default

Template.userProfile.helpers({
    currentUserPage: function(userPage){
        return Session.get('userPage');  // Return current page on user profile
  },
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
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

Template.register.helpers({
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
  }
});

Template.register.events({
    'submit form'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('register'));
        var username = form.get('username');
        var email = form.get('email');
        var password = form.get('password');
        var confirmPassword = form.get('confirmPassword');

        if(areValidPasswords(password, confirmPassword)){
            // Creating the new user
            Accounts.createUser({
                username: username,
                email: email,
                password: password
            }, function(error){
                    if(error){
                        Session.set('formErrorMessage', error.reason); // Output error if registration fails
                    } else{
                        // TODO: Define things to complete in Utilisateurs (db collums order)
                        console.log('Votre compte a bien été créé');
                        Session.set('formErrorMessage', null);  // Reseting formErrorMessage
                        Session.set('userPage', '');  // Send the new user to default userprofile page
                    }
                }
            );
        }
    }
});

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

Template.editProfile.helpers({
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
  }
});
Template.editProfile.onRendered(function(){  // When the template is rendered on the screen
    document.getElementById('username').value = Meteor.user().username;  // Auto fill username with current value
    document.getElementById('email').value = Meteor.user().emails[0].address;  // Auto fill email with current value
});

Template.editProfile.events({
    'submit form' (event){
        event.preventDefault();
        var form = new FormData(document.getElementById('editProfile'));  // Catch the form element
        var firstName = form.get('firstName');  // Saving inputs in variables
        var lastName = form.get('lastName');  // Saving inputs in variables
        var email = form.get('email');  // Saving inputs in variables

        // TODO:  Insert informations of the form in the Utilisateurs database

        if(document.getElementById('advancedEdition').style.display == 'inherit'){  // Advanced options are displayed, so they should have been filled
            var oldPassword = form.get('oldPassword');  // Saving inputs in variables
            var newPassword = form.get('newPassword');  // Saving inputs in variables
            var confirmNewPassword = form.get('confirmNewPassword');  // Saving inputs in variables
            if(areValidPasswords(newPassword, confirmNewPassword)){
                Accounts.changePassword(oldPassword, newPassword, function(error){  // Callback function which can raise an error
                    if(error){
                        Session.set('formErrorMessage', error.reason);
                    } else{
                        console.log("Le mot de passe a été modifié avec succès");  // Success message
                        Session.set('formErrorMessage', null);  // Reseting formErrorMessage
                        Session.set('userPage', '');
                    }
                });
            }
        }
    },
    'click #showAdvancedEdition'(event){
        event.preventDefault();
        if(document.getElementById('advancedEdition').style.display == 'none'){  // Advanced options are hidden
            document.getElementById('advancedEdition').style.display = 'inherit';  // Display advanced options
            document.getElementById('oldPassword').required = true;  // Set the passwords inputs as required
            document.getElementById('newPassword').required = true;  // Set the passwords inputs as required
            document.getElementById('confirmNewPassword').required = true;  // Set the passwords inputs as required
        } else{  // Advenced options are displayed
            document.getElementById('advancedEdition').style.display = 'none';  // Hide advenced options
            document.getElementById('oldPassword').required = false;  // Passwords inputs are no longer required
            document.getElementById('newPassword').required = false;  // Passwords inputs are no longer required
            document.getElementById('confirmNewPassword').required = false;  // Passwords inputs are no longer required
        }
    }
});
