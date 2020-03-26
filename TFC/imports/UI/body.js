// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './body.html';

// CSS imports
import './css/navbar.css';
import './css/image.css';
import './css/footer.css';
import './css/generic.css';

// JS imports
import './home.js';
import './manageProduct.js';
import './productPage.js';
import './user/userProfile.js';
import './searchResults.js';
import './productBanner.js'

// Messages imports
import './messages/header.js';
import './messages/full.js';

// Databases imports
import { UsersInformations } from '../databases/usersInformations.js';
import { Images } from '../databases/images.js';

// Initializing Session variables
Session.set('page', 'home');  // Site loads with home page
Session.set('formErrorMessage', null);  // No forms error for the moment
Session.set("searchedProductsID", [] );  // No search for the moment
Session.set('message', null);  // No message to display for the moment
Session.set('searchFilters', '');  // No search filters for the moment


Template.body.helpers({
    currentPage: function(){
        return Session.get('page');  // Return the page to display
    },
    currentMessage: function(){
        var message = Session.get('message');
        if(message !== null){
            // There is a message to display
            return message.type  // Return the message to display
        }
    },
    hasProfilePicture: function(){
        // Find the current user and return true if he has a profile picture
        if(UsersInformations.findOne({userID: Meteor.userId()}).profilePictureID !== null){
            return true
        }
        return false
    },
    displayProfilePicture: function(){
        var profilePictureID = UsersInformations.findOne({userID: Meteor.userId()}).profilePictureID;
        return Images.find({_id: profilePictureID});
    }
});

Template.body.events({
    'click #home'(event){
        event.preventDefault();
        Session.set('page', 'home');  // Switch to home page
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
    'click .logout'(event){
        event.preventDefault();
        Session.set('page', 'home');  // Set the page to default
        Meteor.logout();  // Log out the user
    },
    'click a#addProduct'(event){
        event.preventDefault();
        Session.set('page', 'manageProduct');
    },
    'click .productBanner'(event){
        // When a product banner is clicked (like in search result or favorites)
        event.preventDefault();
        Session.set('currentProductID', event.currentTarget.id);  // Setting displayed product with value of the target
        Session.set('page', 'productPage');  // Redirecting to product page
    },
    'click div.message-header button.delete'(event){
        // When the closing button of a message is clicked
        event.preventDefault();
        Session.set('message', null);  // Remove the message
    },
    'click #editProfile' (event){
        event.preventDefault();
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', 'editProfile');
        $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
        $("li#editProfile").addClass("is-active");  // Set the current tab as the active one

    },
    'click #favorite' (event){
        event.preventDefault();
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', 'favorite');
        $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
        $("li#favorite").addClass("is-active");  // Set the current tab as the active one

    }
});

// jQuery code to display nav menu when burger-menu is clicked (code from https://bulma.io/documentation/components/navbar/)
$(document).ready(function(){
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function(){
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
    // Check for click events on the navbar dropdown link
    $("#moreDropdown .navbar-link").click(function(){
        // If navbar is in mobile mode
        if($(".navbar-burger").hasClass("is-active")){
            // Toggle dropdown options display
            $('#moreDropdown .navbar-dropdown').toggleClass("is-hidden-mobile");
        }
    });
});
