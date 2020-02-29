// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './body.html';

// JS Imports
import './home.js';
import './manageProduit.js';
import './user/userProfile.js';
import './productPage.js';
import './shopPage.js';

Session.set('page', 'home');  // Site loads with home page
Session.set('formErrorMessage', null);  // No forms error for the moment


Template.body.helpers({
    currentPage: function(page){
        return Session.get('page');  // Return current page
  }
});

Template.body.events({
    'click #home' (event){
        Session.set('page', 'home');  // Switch to home page
    },
    'click #userProfile' (event){
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', '');  // Set the user page to default
    },
    'click #manageProduit' (event){
        Session.set('page', 'manageProduit');
    },
    'click #shopPage' (event){
        Session.set('page', 'shopPage');
    },
    'click .produit'(event){
        event.preventDefault();
        Session.set('page', 'productPage');
        Session.set('IDproduit', event.currentTarget.id);
    }
});
