// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './body.html';
import './productBanner.html';
import './shopBanner.html';

// JS Imports
import './home.js';
import './manageProduct.js';
import './productPage.js';
import './shopPage.js';
import './manageShop.js';
import './user/userProfile.js';
import './searchResults.js'


Session.set('page', 'home');  // Site loads with home page
Session.set('formErrorMessage', null);  // No forms error for the moment


Template.body.helpers({
    currentPage: function(page){
        return Session.get('page');  // Return the page to display
  }
});

Template.body.events({
    'click #home' (event){
        event.preventDefault();
        Session.set('page', 'home');  // Switch to home page
    },
    'click #userProfile'(event){
        event.preventDefault();
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', '');  // Set the user page to default
    },
    'click #manageProduit'(event){
        event.preventDefault();
        Session.set('page', 'manageProduct');
    },
    'click #manageShop'(event){
        event.preventDefault();
        Session.set('page', 'manageShop');
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
