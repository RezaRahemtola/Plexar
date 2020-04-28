// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productPage.html';

// CSS import
import './css/slideshow.css';

// Database imports
import { Favorites } from '../databases/favorites.js';
import { Images } from '../databases/images.js';
import { UsersInformations } from '../databases/usersInformations.js';


Template.productPage.onRendered(function(){
    if(Meteor.user() && Session.get('currentProduct')){
        const product = Session.get('currentProduct');
        var userVotes = UsersInformations.findOne({userID: Meteor.userId()}).votes;
        if(userVotes[product._id] !== undefined){
            // Product has already been voted by the user
            var currentVote = userVotes[product._id];  // Catching the vote
            if(currentVote > 0){
                // Product has already been upvoted by the user
                $('#upvote').addClass("has-text-primary");
            } else if(currentVote < 0){
                // User has already downvoted this product
                $('#downvote').addClass("has-text-primary");
            }
        }
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
        const product = Session.get('currentProduct');
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Getting favorite products of the current user in the db
        const favoriteId = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.push(product._id);  // Adding the product to the array
        Favorites.update(favoriteId, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        Session.set('message', {type: "header", headerContent: "Produit bien ajouté aux favoris !", style: "is-success"});  // Showing a confirmation message
    },
    'click #removeFromFavoriteProducts'(event){
        // User wants to remove this product from it's favorites
        const product = Session.get('currentProduct');
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Getting favorite products of the current user in the db
        const favoriteId = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.pop(product._id);  // Removing the product from the array
        Favorites.update(favoriteId, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        Session.set('message', {type: "header", headerContent: "Produit supprimé de vos favoris", style: "is-success"});  // Showing a confirmation message
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
        // Check if the given product ID is in the favorite products of the user
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Return the favorites of the current user
        return favoriteProducts.includes(Session.get('currentProduct')._id);
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
