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
import './contact.js';
import './collectiveModeration.js';
import './faq.js';

// Messages imports
import './messages/header.js';
import './messages/full.js';

// Modals imports
import './modals/register.js';
import './modals/login.js';
import './modals/forgotPassword.js';
import './modals/report.js';

// Databases imports
import { Images } from '../databases/images.js';

// Alone Template
import './credits.html';
import './about.html';

// Initializing Session variables
Session.set('page', 'home');  // Site loads with home page
Session.set('navigation', []);  // Used to store page navigation history to use return button
Session.set("searchedProducts", [] );  // No search for the moment
Session.set('message', null);  // No message to display for the moment
Session.set('modal', null);  // No modal to display for the moment
Session.set('search', {query: "", categories: [], sort: 'popularity'});
Session.set('coverImageId', null);
Session.set('otherImagesId', []);
Session.set('productsCounter', 0);
Session.set('userContributions', []);
Session.set('profilePicture', 'user.svg');
Session.set('productCategories', []);
Session.set('userIsAdmin', false);  // By default the current user isn't admin


Template.body.onRendered(function(){
    Meteor.subscribe('images');
});


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
        Meteor.call('hasProfilePicture', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // The current user has a profile picture, imageId was returned
                const profilePictureId = result  // Catch the result
                const image = Images.findOne({_id: profilePictureId}).url();  // Find the url
                Session.set('profilePicture', image);
            } else{
                // Current user doesn't have a profile picture, set it to the default one
                Session.set('profilePicture', 'user.svg');
            }
        });

        return Session.get('profilePicture');
    },
    displayCategories: function(){
        // Display available categories
        Meteor.call('getCategories', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else{
                Session.set('productCategories', result);
            }
        });
        return Session.get('productCategories');
    },
    userIsAdmin: function(){
        // Checking is user is admin
        Meteor.call('userIsAdmin', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else if(result === true || result === false){
                // Method successfully executed, saving the result
                Session.set('userIsAdmin', result);
            }
        });
        return Session.get('userIsAdmin');
    }
});

Template.body.events({
    // Global events :
    'click .register'(event){
        event.preventDefault();
        Session.set('modal', 'register');  // Display the register modal
    },
    'click .login'(event){
        event.preventDefault();
        Session.set('modal', 'login');  // Display the login modal
    },
    'click .logout'(event){
        event.preventDefault();
        var navigation = Session.get('navigation');  // Catching navigation history
        navigation.push(Session.get('page'));  // Adding the current page
        Session.set('navigation', navigation);  // Updating the value
        Session.set('page', 'home');  // Set the page to default
        Meteor.logout();  // Log out the user
    },
    'click #return'(event){
        event.preventDefault();
        var navigation = Session.get('navigation');  // Catching navigation history
        const lastPage = navigation[navigation.length-1];  // Catching the last page
        navigation.pop();  // We will come back to the last page, so removing it from the navigation
        Session.set('navigation', navigation);  // Updating value in Session
        Session.set('page', lastPage)  // Sending user to the last visited page
    },
    'click .productBanner'(event){
        event.preventDefault();
        // When a product banner is clicked (like in search result or favorites)
        Session.set('currentProduct', null);  // Reset the variable
        Meteor.call('findOneProductById', {productId: event.currentTarget.id}, function(error, result){
            if(error){
                // TODO: error display
            } else if(result){
                Session.set('currentProduct', result);
                var navigation = Session.get('navigation');  // Catching navigation history
                navigation.push(Session.get('page'));  // Adding the current page
                Session.set('navigation', navigation);  // Updating the value
                Session.set('page', 'productPage');  // Redirecting to product page
            }
        });
    },
    'click div.message-header button.delete'(event){
        event.preventDefault();
        // When the closing button of a message is clicked
        Session.set('message', null);  // Remove the message
    },
    'click .modal-card-head .delete, click .modal-background'(event){
        event.preventDefault();
        // When the closing button of a modal is clicked
        Session.set('modal', null);  // Remove the modal
    },


    // Navbar events
    'click a#home, click a#search, click a#addProduct, click a#contact, click a#faq, click a#about, click #categoriesDropdown .navbar-item, click a#collectiveModeration'(event){
        event.preventDefault();
        var navigation = Session.get('navigation');  // Catching navigation history
        navigation.push(Session.get('page'));  // Adding the current page
        Session.set('navigation', navigation);  // Updating the value
    },
    'click a#home'(event){
        Session.set('page', 'home');  // Switch to home page
    },
    'click a#search'(event){
        Session.set('page', 'searchResults');
    },
    'click a#addProduct'(event){
        Session.set('page', 'addProduct');
    },
    'click a#contact'(event){
        Session.set('page', 'contact');  // Switch to contact page
    },
    'click a#faq'(event){
        Session.set('page', 'faq');  // Switch to FAQ page
    },
    'click a#about'(event){
        Session.set('page', 'about');  // Switch to about page
    },
    'click #categoriesDropdown .navbar-item'(event){
        // A category of the categories dropdown is clicked
        const selectedCategory = event.currentTarget.innerText;  // Catching the clicked category
        var search = Session.get('search');  // Catching the current search
        search.query = "";  // Resetting the text query so we will find all the products
        search.categories = [selectedCategory];  // Adding a filter with the selected category
        Session.set('search', search);  // Updating the Session value
        Session.set('page', 'searchResults');  // Sending the user to the search results page
    },
    'click a#collectiveModeration'(event){
        Session.set('page', 'collectiveModeration');
    },


    // Profile dropdown and user profile tabs events
    'click #contributions, click #favorite, click #informations'(event){
        event.preventDefault();
        var navigation = Session.get('navigation');  // Catching navigation history
        navigation.push(Session.get('page'));  // Adding the current page
        Session.set('navigation', navigation);  // Updating the value
    },
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
        event.preventDefault();
        // Checking is user is admin
        Meteor.call('userIsAdmin', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else if(result){
                // User is admin
                var navigation = Session.get('navigation');  // Catching navigation history
                navigation.push(Session.get('page'));  // Adding the current page
                Session.set('navigation', navigation);  // Updating the value
                Session.set('page', 'moderation');  // Switch to moderation page
            }
        });
    },


    // Footer events
    'click li#credits, click li#faq, click li#about, click #contact'(event){
        event.preventDefault();
        var navigation = Session.get('navigation');  // Catching navigation history
        navigation.push(Session.get('page'));  // Adding the current page
        Session.set('navigation', navigation);  // Updating the value
    },
    'click li#credits'(event){
        Session.set('page', 'credits');  // Switch to credits page
    },
    'click li#faq'(event){
        Session.set('page', 'faq');  // Switch to FAQ page
    },
    'click li#about'(event){
        Session.set('page', 'about');  // Switch to about page
    },
    'click li#contact'(event){
        Session.set('page', 'contact');  // Switch to contact page
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
