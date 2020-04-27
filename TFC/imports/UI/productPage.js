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
        var product = Session.get('currentProduct');
        var userUpvotes = UsersInformations.findOne({userID: Meteor.userId()}).upvotes;
        var userDownvotes = UsersInformations.findOne({userID: Meteor.userId()}).downvotes;
        if(userUpvotes.includes(product._id)){
            // Product has already been upvoted by the user
            $('#upvote').addClass("has-text-primary");
        } else if(userDownvotes.includes(product._id)){
            // User has already downvoted this product
            $('#downvote').addClass("has-text-primary");
        }
    }
});

Template.productPage.events({
    'click #return, click #addToFavoriteProducts, click #removeFromFavoriteProducts, click .productVote, click .report, click .suggestChanges'(event){
        // Prevent default action for all events
        event.preventDefault();
    },
    'click #return'(event){
        Session.set('page', Session.get('lastPage'));
    },
    'click #addToFavoriteProducts'(event){
        // User wants to add this product to it's favorites
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Getting favorite products of the current user in the db
        const favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.push(Session.get('currentProductID'));  // Adding the product to the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        Session.set('message', {type: "header", headerContent: "Produit bien ajouté aux favoris !", style: "is-success"});  // Showing a confirmation message
    },
    'click #removeFromFavoriteProducts'(event){
        // User wants to remove this product from it's favorites
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Getting favorite products of the current user in the db
        const favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.pop(Session.get('currentProductID'));  // Removing the product from the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        Session.set('message', {type: "header", headerContent: "Produit supprimé de vos favoris", style: "is-success"});  // Showing a confirmation message
    },
    'click .productVote'(event){
        var product = Session.get('currentProduct');
        const userInformationsID = UsersInformations.findOne({userID: Meteor.userId()})._id;
        var userUpvotes = UsersInformations.findOne({userID: Meteor.userId()}).upvotes;
        var userDownvotes = UsersInformations.findOne({userID: Meteor.userId()}).downvotes;
        var voteToApply = 0;

        if(event.currentTarget.id === 'upvote'){
            if(userUpvotes.includes(product._id)){
                // Product has already been upvoted, we remove the upvote
                userUpvotes.pop(product._id);
                voteToApply = -1;
                $('#upvote').removeClass("has-text-primary");
            } else if(userDownvotes.includes(product._id)){
                // Product has already been downvoted, remove the downvote and set an upvote
                userDownvotes.pop(product._id);
                userUpvotes.push(product._id);
                voteToApply = 2;
                $('#upvote').addClass("has-text-primary");
                $('#downvote').removeClass("has-text-primary");
            } else{
                // Product hasn't already been voted
                userUpvotes.push(product._id);
                voteToApply = 1;
                $('#upvote').addClass("has-text-primary");
            }
        } else{
            if(userUpvotes.includes(product._id)){
                // Product has already been upvoted, we remove the upvote and set a downvote
                userUpvotes.pop(product._id);
                userDownvotes.push(product._id);
                voteToApply = -2;
                $('#upvote').removeClass("has-text-primary");
                $('#downvote').addClass("has-text-primary");
            } else if(userDownvotes.includes(product._id)){
                // Product has already been downvoted, remove the downvote
                userDownvotes.pop(product._id);
                voteToApply = 1;
                $('#downvote').removeClass("has-text-primary");
            } else{
                // Product hasn't already been voted
                userDownvotes.push(product._id);
                voteToApply = -1;
                $('#downvote').addClass("has-text-primary");
            }
        }
        Meteor.call('updateProductScore', {productId: product._id, vote: voteToApply}, function(error, result){
            if(!error){
                // Database was successfully updated, refreshing the Session variable with the updated product
                Meteor.call('findOneProductById', {productId: product._id}, function(error, result){
                    if(!error){
                        // Product wass succesfully found
                        Session.set('currentProduct', result);
                    }
                });
            }
        });
        UsersInformations.update(userInformationsID, { $set: {
            upvotes: userUpvotes,
            downvotes: userDownvotes
        }});
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
            Session.set('currentProductID', event.currentTarget.id);  // Setting displayed product with value of the target
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
