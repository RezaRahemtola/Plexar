// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

// Database imports
import { Products } from '../bdd/products.js';
import { Shops } from '../bdd/shops.js';

// HTML imports
import './searchResults.html';

Template.searchResults.helpers({
    displayProductsResults: function(){
        Meteor.call('searchForProducts', {text: Session.get("searchedText")}, function(error, result){
            Session.set("searchedProductsID", result);  // Result is an array of products ID, saving it in a Session variable
        });
        var searchedProducts = []  // We will save the products in an array
        for (var productID of Session.get("searchedProductsID")){
            // For each product ID we add the product to the array
            searchedProducts.push(Products.findOne({_id : productID}))
        }
        return searchedProducts  // Return the products array
    },
    displayShopsResults: function(){
        Meteor.call('searchForShops', {text: Session.get("searchedText")}, function(error, result){
            Session.set("searchedShopsID", result);  // Result is an array of shops ID, saving it in a Session variable
        });
        var searchedShops = []  // We will save the shops in an array
        for (var shopID of Session.get("searchedShopsID")){
            // For each shop ID we add the shop to the array
            searchedShops.push(Shops.findOne({_id : shopID}))
        }
        return searchedShops  // Return the shops array
    }
});


Template.searchResults.events({
    'click #sortResults'(event){
        var selectedOption = event.target.value;  // Catch the value attribute of the selected option
        // Change the icon depending of the selected option
        if(selectedOption === 'A-Z')
            document.getElementById("sortResultsIconContainer").innerHTML = '<i class="fas fa-sort-alpha-down"></i>';  // Change HTML content of the icon's parent div
        else if(selectedOption === 'Z-A')
            document.getElementById("sortResultsIconContainer").innerHTML = '<i class="fas fa-sort-alpha-down-alt"></i>';  // Change HTML content of the icon's parent div
    }
});
// Ordre alphabetique {sort: {name: -1}}
// Ordre alphabetique inverse {sort: {name: -1}}
