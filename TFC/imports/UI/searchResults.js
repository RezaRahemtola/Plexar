// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

// Database imports
import { Products } from '../bdd/products.js';
import { Shops } from '../bdd/shops.js';

// HTML imports
import './searchResults.html';

console.log();

Template.searchResults.helpers({
    displayProductsResults: function(){
        Meteor.call('searchForProducts', {text: Session.get("searchedText")}, function(error, result){
            // Result is an array of products ID, we find the products in the db
            var searchedProducts = []
            for (var productID of result){
                // For each product ID we add the product to the array
                searchedProducts.push(Products.findOne({_id : productID}))
            }
            Session.set("searchedProducts", searchedProducts);  // Saving products in a Session variable
        });
        return Session.get("searchedProducts")
    },
    displayShopsResults: function(){
        Meteor.call('searchForShops', {text: Session.get("searchedText")}, function(error, result){
            // Result is an array of shops ID, we find the shops in the db
            var searchedShops = []
            for (var shopID of result){
                // For each shop ID we add the shop to the array
                searchedShops.push(Shops.findOne({_id : shopID}))
            }
            Session.set("searchedShops", searchedShops);  // Saving shops in a Session variable
        });
        return Session.get("searchedShops")
    }
});
