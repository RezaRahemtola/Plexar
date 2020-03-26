// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './favorite.html';

// Database imports
import { Favorites } from '../../databases/favorites.js';
import { Products } from '../../databases/products.js';

Template.favorite.helpers({
    displayFavoriteProducts: function(){
        var favoriteProductsID = Favorites.findOne({userId: Meteor.userId()}).products  // Return an array with IDs of the products database
        const favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        var favoriteProducts = [];  // Creating an empty array of the products
        for(var productID of favoriteProductsID){
            // Filling the array with the products
            if(Products.findOne({_id : productID}) === undefined){
                // This product is in favorites but doesn't exist in the products db (maybe deleted), we remove it from favorites
                favoriteProductsID.pop(productID);  // Removing the product from the array
                Favorites.update(favoriteID, { $set: {
                    // Updating the database with the modified array
                    products: favoriteProductsID
                }});
            } else{
                // Product exists, adding it to the array
                favoriteProducts.push(Products.findOne({_id : productID}));
            }
        }
        return favoriteProducts;  // Returning the array of products to display
    }
});
