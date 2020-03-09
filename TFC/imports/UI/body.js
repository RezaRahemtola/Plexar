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

// Initializing Session variables
Session.set('page', 'home');  // Site loads with home page
Session.set('formErrorMessage', null);  // No forms error for the moment
Session.set("searchedShopsID", []);  // No search for the moment
Session.set("searchedProductsID", []);  // No search for the moment


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
    'click .register'(event){
        event.preventDefault();
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', 'register');  // Set the user page to register
    },
    'click .login'(event){
        event.preventDefault();
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', 'login');  // Set the user page to register
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

// jQuery code to display nav menu when burger-menu is clicked (code from https://bulma.io/documentation/components/navbar/)
$(document).ready(function() {
  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
  });
});
