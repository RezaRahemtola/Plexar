// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './favorite.html';

// Database imports
import { Favorites } from '../../databases/favorites.js';
import { Products } from '../../databases/products.js';
import { Shops } from '../../databases/shops.js';

Template.favorite.helpers({
    displayFavoriteProducts: function(){
        var favoriteProductsID = Favorites.findOne({userId: Meteor.userId()}).products  // Return an array with IDs of the products database
        const favoriteID = Favorites.findOne({userId :{$eq: Meteor.userId()}})._id;  // Getting line ID (needed to modify data)
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
    },
    displayFavoriteShops: function(){
        var favoriteShopsID = Favorites.findOne({userId: Meteor.userId()}).shops  // Return an array with IDs of the shops database
        const favoriteID = Favorites.findOne({userId: {$eq: Meteor.userId()}})._id;  // Getting line ID (needed to modify data)
        var favoriteShops = [];  // Creating an empty array of the shops
        for (var shopID of favoriteShopsID) {
            // Filling the array with the shops
            if (Shops.findOne({_id : shopID}) === undefined){
                // This shop is in favorites but doesn't exist in the products db (maybe deleted), we remove it from favorites
                favoriteShopsID.pop(shopID);  // Removing the product from the array
                Favorites.update(favoriteID, { $set: {
                    // Updating the database with the modified array
                    shops: favoriteShopsID
                }});
            } else{
                // Shop exists, adding it to the array
                favoriteShops.push(Shops.findOne({_id : shopID}));
            }
        }
        return favoriteShops;  // Returning the array of shops to display
    }
});
