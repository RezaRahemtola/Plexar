// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './favorite.html';

// Database imports
import { Favoris } from '../../bdd/favoris.js';
import { Products } from '../../bdd/products.js';
import { Shops } from '../../bdd/shops.js';

Template.favorite.helpers({
    displayFavoriteProducts: function(){
        var favoriteProductsID = Favoris.findOne({user: Meteor.user()._id}).products  // Return an array with IDs of the products database
        var favoritesProducts = [];  // Creating an empty array of the products
        for (var element of favoriteProductsID) {
            // Filling the array with the products
            favoritesProducts.push(Products.findOne({_id : element}));
        }
        return favoritesProducts;  // Returning the array of products to display
    },
    displayFavoriteShops: function(){
        var favoriteShopsID = Favoris.findOne({user: Meteor.user()._id}).shops  // Return an array with IDs of the shops database
        var favoriteShops = [];  // Creating an empty array of the shops
        for (var element of favoriteShopsID) {
            // Filling the array with the shops
            favoriteShops.push(Shops.findOne({_id : element}));
        }
        return favoriteShops;  // Returning the array of shops to display
    }
});
