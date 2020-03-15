// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productPage.html';

// Database imports
import { Products } from '../bdd/products.js';
import { Favorites } from '../bdd/favorites.js';
import { Images } from '../bdd/images.js';

Template.displayedProductPage.events({
    'click #addToFavoriteProducts'(event){
        // User wants to add this product to it's favorites
        event.preventDefault();
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Getting favorite products of the current user in the db
        var favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.push(Session.get('currentProductID'));  // Adding the product to the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        Session.set('message', {type: "header", headerContent: "Produit bien ajouté aux favoris !", style: "is-success"});  // Showing a confirmation message
    },
    'click #removeFromFavoriteProducts'(event){
        // User wants to remove this product from it's favorites
        event.preventDefault();
        var favoriteProducts = Favorites.findOne({userId :{$eq: Meteor.userId()}}).products;  // Getting favorite products of the current user in the db
        var favoriteID = Favorites.findOne({userId :{$eq: Meteor.userId()}})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.pop(Session.get('currentProductID'));  // Removing the product from the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        Session.set('message', {type: "header", headerContent: "Produit supprimé de vos favoris", style: "is-success"});  // Showing a confirmation message
    }
})

Template.productPage.helpers({
    displayProduct: function(){
        // Return the product that corresponds to the one to display
        return Products.find({_id: Session.get('currentProductID')});
    }
});

Template.displayedProductPage.helpers({
    productInFavorites: function(){
        // Check if the given product ID is in the favorite products of the user
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Return the favorites of the current user
        if(favoriteProducts.indexOf(Session.get('currentProductID')) === -1){
            return false;  // Given ID is not in the favorite products, so return false
        } else{
            return true;  // Given ID is in the favorite products, return true
        }
    },
    displayProductImages: function(){
        var productImagesID = Products.findOne({_id: Session.get('currentProductID')}).imagesID;  // Return an array with IDs of the product images
        var productImages = [];  // Creating an empty array for the images
        for(var imageID of productImagesID){
            // Filling the array with product's images
            productImages.push(Images.findOne({_id: imageID}));
        }
        return productImages
    }
});
