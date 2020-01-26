// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

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
        });
        Session.set('page', 'userprofile');  // Send the new user to userprofile page
    }
});

Template.login.events({
    'submit form' (event){
        event.preventDefault();
        var form = new FormData(document.getElementById('login'));
        var email = form.get('email');
        var password = form.get('password');
        Meteor.loginWithPassword(email, password);
        Session.set('page', 'userprofile');  // Send the logged user to userprofile page
    }
});
