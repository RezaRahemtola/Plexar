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
    if(Meteor.user() && Session.get('currentProduct')){

        // Catching current productId for the call
        const productId = Session.get('currentProduct')._id;

        Meteor.call('getVoteValue', {productId: productId}, function(error, result){
            if(!error && result){
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
    'click #return'(event){
        Session.set('page', Session.get('lastPage'));
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
                // There is an error
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
            if(!error && result){
                // Database was successfully updated, refreshing the Session variable with the updated product
                Meteor.call('findOneProductById', {productId: product._id}, function(error, result){
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
        // TODO: En fonction du nombre de points/admin de l'user, instant valider le report et effectuer l'action correspondante
        if(!Meteor.user()){
            // User isn't logged in
            Session.set('modal', 'register');
        } else{
            // User is logged in
            Session.set('modal', 'report');
        }
    },
    'click .suggestChanges'(event){
        // TODO: En fonction du nombre de points/admin de l'user, instant valider la modification
        if(!Meteor.user()){
            // User isn't logged in
            Session.set('modal', 'register');
        } else{
            // User is logged in
            Session.set('lastPage', Session.get('page'))  // Set the last page to this one to use the return button after
            Session.set('page', 'editProduct');
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
            var productImagesId = Session.get('currentProduct').images;  // Return an array with IDs of the product images
            var productImages = [];  // Creating an empty array for the images
            for(var imageId of productImagesId){
                // Filling the array with product's images
                productImages.push(Images.findOne({_id: imageId}));
            }
            return productImages;
        }
    },
    moreThanOneImage: function(){
        if(Session.get('currentProduct')){
            var productImagesId = Session.get('currentProduct').images;  // Return an array with IDs of the product images
            if(productImagesId.length > 1){
                return true;
            }
            return false;
        }
    }
});


Template.productPage.onDestroyed(function(){
    // Reset unused Session variables
    Session.set('productInFavorites', null);
});
