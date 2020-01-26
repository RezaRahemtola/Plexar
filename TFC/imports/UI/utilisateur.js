// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './utilisateur.html';

Template.register.events({
    'submit form'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('register'));
        var username = form.get('username');
        var email = form.get('email');
        var password = form.get('password');

        // Creationg the new user
        Accounts.createUser({
            username: username,
            email: email,
            password: password
        });
        Session.set('page', 'user');
    }
});

Template.login.events({
    'submit form' (event){
        event.preventDefault();
        var form = new FormData(document.getElementById('login'));
        var email = form.get('email');
        var password = form.get('password');
        Meteor.loginWithPassword(email, password);
        Session.set('page', 'user');
    }
});

Template.user.events({
    'click .register' (event){
        Session.set('page', 'register');
    },
    'click .logout' (event){
        event.preventDefault();
        Meteor.logout();
    },
    'click .login' (event){
        Session.set('page', 'login');
    }
});
