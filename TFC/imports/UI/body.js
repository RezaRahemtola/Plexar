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
import './addProduct.js';
import './productPage.js';
import './user/userProfile.js';
import './moderation/moderation.js';
import './searchResults.js';
import './productBanner.js';
import './editProduct.js';

// Messages imports
import './messages/header.js';
import './messages/full.js';

// Modals imports
import './modals/register.js';
import './modals/login.js';
import './modals/forgotPassword.js';
import './modals/report.js';

// Databases imports
import { UsersInformations } from '../databases/usersInformations.js';
import { Images } from '../databases/images.js';

// Alone Template
import './credits.html';
import './faq.html';
import './about.html';

// Initializing Session variables
Session.set('page', 'home');  // Site loads with home page
Session.set('lastPage', null);  // No last page (used for return button)
Session.set("searchedProducts", [] );  // No search for the moment
Session.set('message', null);  // No message to display for the moment
Session.set('modal', null);  // No modal to display for the moment
Session.set('search', {query: "", categories: [], sort: 'popularity'});
Session.set('coverImageId', null);
Session.set('otherImagesId', []);
Session.set('productsCounter', 0);


Template.body.helpers({
    currentPage: function(){
        return Session.get('page');  // Return the page to display
    },
    currentMessage: function(){
        var message = Session.get('message');
        var modal = Session.get('modal');
        if(message !== null && modal === null){
            // There is a message to display and no modal is active
            return message.type;  // Return the message to display
        }
    },
    currentModal: function(){
        if(Session.get('modal') !== null){
            return Session.get('modal');  // Return the modal to display
        }
    },
    displayProfilePicture: function(){
        if(Meteor.userId() && UsersInformations.findOne({userID: Meteor.userId()}) && UsersInformations.findOne({userID: Meteor.userId()}).profilePictureID !== null){
            // The current user has a profile picture
            var profilePictureId = UsersInformations.findOne({userID: Meteor.userId()}).profilePictureID;  // Catch the picture ID
            return Images.findOne({_id: profilePictureId}).url();  // Return the url of the image
        } else{
            // The current user doesn't have a profile picture, return the default one
            return 'user.svg';
        }
    }
});

Template.body.events({
    'click .register, click .login, click .logout, click .productBanner, click div.message-header button.delete, click .modal button.delete, click .modal-background, click a#home, click a#addProduct, click #contributions, click #favorite, click #informations, click li#credits, click li#faq'(event){
        // Prevent default action for all events
        event.preventDefault();
    },


    // Global events :
    'click .register'(event){
        Session.set('modal', 'register');  // Display the register modal
    },
    'click .login'(event){
        Session.set('modal', 'login');  // Display the login modal
    },
    'click .logout'(event){
        Session.set('page', 'home');  // Set the page to default
        Meteor.logout();  // Log out the user
    },
    'click .productBanner'(event){
        // When a product banner is clicked (like in search result or favorites)
        Session.set('currentProductID', event.currentTarget.id);  // Setting displayed product with value of the target
        Session.set('lastPage', Session.get('page'))  // Set the last page to this one to use the return button after
        Session.set('page', 'productPage');  // Redirecting to product page
    },
    'click div.message-header button.delete'(event){
        // When the closing button of a message is clicked
        Session.set('message', null);  // Remove the message
    },
    'click .modal-card-head .delete, click .modal-background'(event){
        // When the closing button of a modal is clicked
        Session.set('modal', null);  // Remove the modal
    },


    // Navbar events
    'click a#home'(event){
        Session.set('page', 'home');  // Switch to home page
    },
    'click a#search'(event){
        Session.set('page', 'searchResults');
    },
    'click a#addProduct'(event){
        Session.set('page', 'addProduct');
    },


    // Profile dropdown and user profile tabs events
    'click #contributions'(event){
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', 'contributions');
        $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
        $("li#contributions").addClass("is-active");  // Set the current tab as the active one
    },
    'click #favorite'(event){
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', 'favorite');
        $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
        $("li#favorite").addClass("is-active");  // Set the current tab as the active one
    },
    'click #informations'(event){
        Session.set('page', 'userProfile');  // Switch to userProfile page
        Session.set('userPage', 'informations');
        $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
        $("li#informations").addClass("is-active");  // Set the current tab as the active one
    },
    'click #moderation'(event){
        Session.set('page', 'moderation');  // Switch to moderation page
    },


    // Footer events
    'click li#credits'(event){
        Session.set('page', 'credits');  // Switch to credits page
    },
    'click li#faq'(event){
        Session.set('page', 'faq');  // Switch to FAQ page
    },
    'click li#about'(event){
        Session.set('page', 'about');  // Switch to about page
    }
});

// jQuery code to display nav menu when burger-menu is clicked (code from https://bulma.io/documentation/components/navbar/)
$(document).ready(function(){
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function(){
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger, .navbar-menu").toggleClass("is-active");
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
