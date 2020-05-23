// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productPage.html';

// CSS import
import './css/slideshow.css';

// Database import
import { Images } from '../databases/images.js';

// Initializing Session variable
Session.set('productInFavorites', null);


Template.productPage.onRendered(function(){
    // Scrolling the window back to the top
    window.scrollTo(0, 0);

    if(Meteor.user() && Session.get('currentProduct')){
        // Catching current productId for the call
        const productId = Session.get('currentProduct')._id;

        Meteor.call('getVoteValue', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                if(result > 0){
                    // Product has already been upvoted by the user
                    $('#upvote').addClass("has-text-primary");
                } else if(result < 0){
                    // User has already downvoted this product
                    $('#downvote').addClass("has-text-primary");
                }
            }
        });
    }
});


Template.productPage.events({
    'click #return, click #addToFavoriteProducts, click #removeFromFavoriteProducts, click .report, click .suggestChanges'(event){
        // Prevent default action for all events
        event.preventDefault();
    },
    'click #addToFavoriteProducts'(event){
        // User wants to add this product to it's favorites
        const productId = Session.get('currentProduct')._id;
        Meteor.call('addProductToFavorite', {productId: productId}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Product was successfully added to favorite, showing a confirmation message
                Session.set('message', {type: "header", headerContent: "Produit bien ajouté aux favoris !", style: "is-success"});
                // Refreshing the favorite icon by calling the associated helper
                Template.productPage.__helpers.get('productInFavorites').call();
            }
        });
    },
    'click #removeFromFavoriteProducts'(event){
        // User wants to remove this product from it's favorites
        const productId = Session.get('currentProduct')._id;
        Meteor.call('removeProductFromFavorite', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Product was successfully removed from favorite, showing a confirmation message
                Session.set('message', {type: "header", headerContent: "Produit supprimé de vos favoris", style: "is-success"});
                // Refreshing the favorite icon by calling the associated helper
                Template.productPage.__helpers.get('productInFavorites').call();
            }
        });
    },
    'click .productVote'(event){
        // User wants to vote on this product
        event.preventDefault();
        // Catching parameters for the call
        const productId = Session.get('currentProduct')._id;
        const vote = event.currentTarget.id;
        // Remove the active class on votes buttons
        $('#upvote, #downvote').removeClass("has-text-primary");

        Meteor.call('updateProductScore', {productId: productId, vote: vote}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Database was successfully updated, refreshing the Session variable with the updated product
                Meteor.call('findOneProductById', {productId: productId}, function(error, result){
                    if(!error){
                        // Product was succesfully found
                        Session.set('currentProduct', result);
                    }
                });

                // Return value is the vote, set an active class on the corresponding button
                if(result === 'upvote'){
                    $('#upvote').addClass("has-text-primary");
                } else if(result === 'downvote'){
                    $('#downvote').addClass("has-text-primary");
                }
            }
        });
    },
    'click .report'(event){
        if(!Meteor.user()){
            // User isn't logged in
            Session.set('modal', 'register');
        } else{
            // User is logged in, checking if the product is already in moderation

            // Catching productId for the call
            const productId = Session.get('currentProduct')._id;

            Meteor.call('checkIfProductInModeration', {productId: productId}, function(error, result){
                if(error){
                    // There was an error
                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                } else if(result){
                    // Product is already in moderation, display an helping message
                    Session.set('message', {type:"header", headerContent:"Ce produit est déjà en modération, veuillez réessayer ultérieurement.", style:"is-warning"} );
                } else{
                    // Product isn't already under moderation, we can display the report modal
                    Session.set('modal', 'report');
                }
            });
        }
    },
    'click .suggestChanges'(event){
        if(!Meteor.user()){
            // User isn't logged in
            Session.set('modal', 'register');
        } else{
            // User is logged in, checking if the product is already in moderation

            // Catching productId for the call
            const productId = Session.get('currentProduct')._id;

            Meteor.call('checkIfProductInModeration', {productId: productId}, function(error, result){
                if(error){
                    // There was an error
                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                } else if(result){
                    // Product is already in moderation, display an helping message
                    Session.set('message', {type:"header", headerContent:"Ce produit est déjà en modération, veuillez réessayer ultérieurement.", style:"is-warning"} );
                } else{
                    // Product isn't already under moderation, we can send the user to the edit page
                    var navigation = Session.get('navigation');  // Catching navigation history
                    navigation.push(Session.get('page'));  // Adding the current page
                    Session.set('navigation', navigation);  // Updating the value
                    Session.set('page', 'editProduct');
                }
            });
        }
    }
})


Template.productPage.helpers({
    displayProduct: function(){
        // Return the product that corresponds to the one to display
        if(Session.get('currentProduct')){
            return [Session.get('currentProduct')];
        }
    },
    productInFavorites: function(){
        // Check if the product is in the favorite products of the user
        const productId = Session.get('currentProduct')._id;
        Meteor.call('productInFavorites', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result === true || result === false){
                // No error
                Session.set('productInFavorites', result);
            }
        });
        return Session.get('productInFavorites');
    },
    displayProductImages: function(){
        if(Session.get('currentProduct')){
            // There is a product to display
            var productImagesId = Session.get('currentProduct').images;  // Return an array with IDs of the product images
            var productImages = [];  // Creating an empty array for the images
            for(var imageId of productImagesId){
                // Filling the array with product's images links
                productImages.push(Images.findOne({_id: imageId}).link());
            }
            return productImages;
        }
    },
    moreThanOneImage: function(){
        if(Session.get('currentProduct')){
            const productImagesId = Session.get('currentProduct').images;  // Return an array with IDs of the product images
            if(productImagesId.length > 1){
                return true;
            }
            return false;
        }
    },
    displayWebsite: function(){
        if(Session.get('currentProduct')){
            // Catching the website
            const website = Session.get('currentProduct').website;
            if(website !== ""){
                // If a website has been given we display it
                return [website];
            }
        }
    }
});


Template.productPage.onDestroyed(function(){
    // Reset unused Session variables
    Session.set('productInFavorites', null);
});
