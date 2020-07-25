// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './main.html';

// CSS imports
import './css/navbar.css';
import './css/image.css';
import './css/footer.css';
import './css/generic.css';

// JS imports
import './about.js';
import './home.js';
import './404NotFound.js';
import './addProduct.js';
import './productPage.js';
import './user/userProfile.js';
import './moderation/collectiveModeration.js';
import './search.js';
import './productBanner.js';
import './editProduct.js';
import './contact.js';
import './faq.js';
import './bestContributors.js';
import './loginRequired';

// Messages imports
import './messages/header.js';
import './messages/full.js';
import './messages/verifyEmail.js';

// Modals imports
import './modals/register.js';
import './modals/login.js';
import './modals/forgotPassword.js';
import './modals/report.js';
import './modals/resetPassword.js';

// Databases imports
import { Images } from '../databases/images.js';

// Render layouts directly into the body
BlazeLayout.setRoot('body');


FlowRouter.route('/', {
    name: 'index',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'home'});
    }
});


Template.main.onCreated(function(){

    // Initializing Session variables
    Session.set("searchedProducts", [] );  // No search for the moment
    Session.set('message', null);  // No message to display for the moment
    Session.set('search', {query: "", categories: [], sort: 'popularity'});
    Session.set('coverImageId', null);
    Session.set('otherImagesId', []);
    Session.set('productsCounter', 0);
    Session.set('userContributions', []);
    Session.set('productCategories', []);
    Session.set('userIsAdmin', false);  // By default the current user isn't admin
    Session.set('userLevel', null);  // We don't need the user level for the moment

    // Catching url of the default profile picture
    Meteor.call('getDefaultProfilePictureUrl', function(error, result){
        if(error){
            // There was an error
            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
        } else if(result){
            // Default profile picture url was returned, saving it in a Session variable
            Session.set('defaultProfilePicture', result);
            Session.set('profilePicture', result);  // Set user's profile picture url to default one
        }
    });

    if(Session.get('resetPasswordToken') !== null){
        // There's a token to reset the password that has been set
        FlowRouter.go('/resetPassword');  // Display the reset password modal
    }

    // Subscribing to allow operations on the Images database
    Meteor.subscribe('images');
});


Template.main.helpers({
    currentMessage: function(){
        // Catching current message
        const message = Session.get('message');
        if(message !== null){
            // There is a message to display
            return message.type;  // Return the message to display
        } else if(Meteor.user()){
            // User is logged in, checking if user's email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // User email isn't verified, display a warning message
                Session.set('message', {type:"verifyEmail"} );  // Set the message
            }
        }
    },
    displayProfilePicture: function(){
        // Checking if there's a profile picture to display
        Meteor.call('hasProfilePicture', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // The current user has a profile picture, imageId was returned
                const profilePictureId = result;  // Saving the result
                const image = Images.findOne({_id: profilePictureId}).link();  // Find the url of this image
                Session.set('profilePicture', image);
            } else{
                // Current user doesn't have a profile picture, set it to the default one
                Session.set('profilePicture', Session.get('defaultProfilePicture'));
            }
        });

        return Session.get('profilePicture');
    },
    displayCategories: function(){
        // Display available categories
        Meteor.call('getCategories', function(error, result){
            if(error){
                // There was an error while retrieving the categories
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else{
                // Available categories were successfully returned, saving them in a Session variable
                Session.set('productCategories', result);
            }
        });
        return Session.get('productCategories');
    }
});

Template.main.events({
    // Global events :
    'click .logout'(event){
        event.preventDefault();
        FlowRouter.go('/');  // Set the page to home
        Meteor.logout();  // Log out the user
    },
    'click .productBanner'(event){
        event.preventDefault();
        // When a product banner is clicked (like in search result or favorites)
        const productId = event.currentTarget.id;
        FlowRouter.go('/product/'+productId);  // Redirecting to product page
    },
    'click #return'(event){
        event.preventDefault();
        // When a return button is clicked
        window.history.back();  // Going back to the last page
    },
    'click div.message-header button.delete'(event){
        event.preventDefault();
        // When the closing button of a message is clicked
        Session.set('message', null);  // Remove the message
    },
    'click .modal-card-head .delete, click .modal-background'(event){
        event.preventDefault();
        // When the closing button of a modal is clicked
        FlowRouter.go('/');  // Remove the modal by going back to the home page
    },


    // Navbar events
    'click #categoriesDropdown .navbar-item'(event){
        event.preventDefault();
        // A category of the categories dropdown is clicked
        const selectedCategory = event.currentTarget.innerText;  // Catching the clicked category
        var search = Session.get('search');  // Catching the current search
        search.query = "";  // Resetting the text query so we will find all the products
        search.categories = [selectedCategory];  // Adding a filter with the selected category
        Session.set('search', search);  // Updating the Session value
        FlowRouter.go('/search');  // Sending the user to the search results page
    }
});


// jQuery code to display nav menu when burger-menu is clicked (code from https://bulma.io/documentation/components/navbar/)
$(document).ready(function(){
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function(){
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger, .navbar-menu").toggleClass("is-active");
    });
    // Display more dropdown when clicked in mobile mode, checking for click events on the navbar dropdown link
    $("#moreDropdown .navbar-link").click(function(){
        // If navbar is in mobile mode
        if($(".navbar-burger").hasClass("is-active")){
            // Toggle dropdown options display
            $('#moreDropdown .navbar-dropdown').toggleClass("is-hidden-touch");
        }
    });
    // Display categories dropdown when clicked in mobile mode, checking for click events on the navbar dropdown link
    $("#categoriesDropdown .navbar-link").click(function(){
        // If navbar is in mobile mode
        if($(".navbar-burger").hasClass("is-active")){
            // Toggle dropdown options display
            $('#categoriesDropdown .navbar-dropdown').toggleClass("is-hidden-touch");
        }
    });
    // Hide the global navbar dropdown when one of it's element is clicked in mobile mode
    $(".navbar-item").click(function(event){
        // If navbar is in mobile mode and clicked item isn't a dropdown
        if($(".navbar-burger").hasClass("is-active") && !($(event.target).hasClass("navbar-link"))){
            $(".navbar-burger, .navbar-menu").removeClass("is-active");
        }
    });
});
