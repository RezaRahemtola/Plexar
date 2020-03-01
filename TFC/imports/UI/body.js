// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './body.html';

// JS Imports
import './home.js';
import './manageProduct.js';
import './user/userProfile.js';
import './productPage.js';
import './shopPage.js';
import './manageShop.js';

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
    'click #userProfile'(event){
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', '');  // Set the user page to default
    },
    'click #manageProduit'(event){
        Session.set('page', 'manageProduct');
    },
    'click #manageShop'(event){
        Session.set('page', 'manageShop');
    },
    'click #shopPage' (event){
        Session.set('page', 'shopPage');
    },
    'click .productBanner'(event){
        // When a product banner is clicked (like in search result or favorites)
        event.preventDefault();
        Session.set('currentProductID', event.currentTarget.id);  // Setting displayed product with value of the target
        Session.set('page', 'productPage');  // Redirecting to product page
    },
    'click .shopBanner'(event){
        // When a shop banner is clicked (like in search result or favorites)
        event.preventDefault();
        Session.set('currentShopID', event.currentTarget.id);  // Setting displayed product with value of the target
        Session.set('page', 'shopPage');  // Redirecting to product page
    }
});
