// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

// Database imports
import { Products } from '../databases/products.js';
import { Shops } from '../databases/shops.js';

// HTML imports
import './searchResults.html';

// Functions import
import './functions/sortResults.js';


Template.searchResults.onRendered(function(){

    // Catch sorting select changes to filter results
    const sortResults = document.querySelector("select#sortResults");
    sortResults.onchange = () => {
        var selectedOption = sortResults.value;  // Catch the value attribute of the selected option
        switch(selectedOption){
            case 'default':
                document.getElementById("sortResultsIconContainer").innerHTML = '';  // Change HTML content of the icon's parent div
                break;
            case 'A-Z':
                document.getElementById("sortResultsIconContainer").innerHTML = '<i class="fas fa-sort-alpha-down"></i>';  // Change HTML content of the icon's parent div
                Session.set('searchFilter', 'A-Z');  // Set the new filter
                break;
            case 'Z-A':
                document.getElementById("sortResultsIconContainer").innerHTML = '<i class="fas fa-sort-alpha-down-alt"></i>';  // Change HTML content of the icon's parent div
                Session.set('searchFilter', 'Z-A');  // Set the new filter
                break;
            case 'random':
                document.getElementById('sortResultsIconContainer').innerHTML = '<i class="fas fa-random"></i>';  // Change HTML content of the icon's parent div
                Session.set('searchFilter', 'random');  // Set the new filter
                break;
        }
    }
});


Template.searchResults.helpers({
    getSearchQuery: function(){
        return Session.get('searchedText');
    },
    displayProductsResults: function(){
        Meteor.call('searchForProducts', {text: Session.get("searchedText")}, function(error, result){
            Session.set("searchedProductsID", result);  // Result is an array of products ID, saving it in a Session variable
        });
        var searchedProducts = []  // We will save the products in an array
        for (var productID of Session.get("searchedProductsID")){
            // For each product ID we add the product to the array
            searchedProducts.push(Products.findOne({_id : productID}))
        }
        var searchFilter = Session.get('searchFilter');  // Get search filter to sort the products array
        sortResults(searchedProducts, order=searchFilter);
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
        var searchFilter = Session.get('searchFilter');  // Get search filter to sort the shops array
        sortResults(searchedShops, order=searchFilter);
        return searchedShops  // Return the shops array
    }
});


Template.searchResults.events({
    'submit form#searchForm'(event){
        event.preventDefault();
        Session.set('searchedText', document.getElementById("searchBox").value);  // Storing search input value in a variable
    }
});
