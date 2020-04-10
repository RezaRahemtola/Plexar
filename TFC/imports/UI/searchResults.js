// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database imports
import { Products } from '../databases/products.js';

// HTML imports
import './searchResults.html';

// Functions import
import './functions/sortResults.js';


Template.searchResults.onRendered(function(){
    Session.set("searchedProductsID", []);
    // Catch sorting select changes to filter results
    const sortResults = document.querySelector("select#sortResults");
    sortResults.onchange = function(){
        var selectedOption = sortResults.value;  // Catch the value attribute of the selected option
        var search = Session.get("search");
        switch(selectedOption){
            case 'popularity':
                document.getElementById("sortResultsIconContainer").innerHTML = '<i class="fas fa-heart"></i>';  // Change HTML content of the icon's parent div
                search.sort = 'popularity';
                break;
            case 'A-Z':
                document.getElementById("sortResultsIconContainer").innerHTML = '<i class="fas fa-sort-alpha-down"></i>';  // Change HTML content of the icon's parent div
                search.sort = 'A-Z';
                break;
            case 'Z-A':
                document.getElementById("sortResultsIconContainer").innerHTML = '<i class="fas fa-sort-alpha-down-alt"></i>';  // Change HTML content of the icon's parent div
                search.sort = 'Z-A';
                break;
            case 'random':
                document.getElementById('sortResultsIconContainer').innerHTML = '<i class="fas fa-random"></i>';  // Change HTML content of the icon's parent div
                search.sort = 'random';
                break;
        }
        Session.set('search', search);
    }


    // Dynamically check and show selected categories
    const select = document.querySelector("select#categories");  // Catching the select element

    select.onchange = function(){
        var search = Session.get('search');  // Catching the search object
        var selectedOption = select.value;  // Catch the value attribute of the selected option
        if(selectedOption !== 'add' && !search.categories.includes(selectedOption)){
            // The selected option isn't the default one and isn't already selected, displaying the category tag
            var newElement = document.createElement("div");  // Creating a new element to contain the tag
            newElement.className = "control";  // Adding a class for a better display
            // Adding the tag in the div :
            newElement.innerHTML = '<div class="tags has-addons"> <a class="tag is-link">'+selectedOption+'</a> <a class="tag is-delete"></a> </div>';
            document.getElementById("categoryTags").appendChild(newElement);  // Inserting it in the category tags container
            search.categories.push(selectedOption);  // Adding the category to the selected ones
            Session.set('search', search);  // Updating the value of the Session variable
        }
        select.value = 'add';  // Reseting the select with the default value
    }
});


Template.searchResults.helpers({
    getSearchQuery: function(){
        return Session.get('search').query;
    },
    displayProductsResults: function(){
        Meteor.call('searchForProducts', {text: Session.get("search").query}, function(error, result){
            Session.set("searchedProductsID", result);  // Result is an array of products ID, saving it in a Session variable
        });
        var searchedProducts = [];  // We will save the products in an array
        var currentProduct;
        for (var productID of Session.get("searchedProductsID")){
            // For each product ID we add the product to the array
            currentProduct = Products.findOne({_id : productID});
            if(Session.get('search').categories.length > 0){
                // User wants to filter results by categories
                var matchingCategories = 0;
                for (var category of Session.get('search').categories){
                    if(currentProduct.categories.includes(category)){
                        matchingCategories++;
                    }
                }
                if(matchingCategories > 0){
                    searchedProducts.push(currentProduct);
                }
            } else{
                searchedProducts.push(currentProduct);
            }
        }
        var search = Session.get('search');  // Get search object with sort option inside
        sortResults(searchedProducts, order=search.sort);
        return searchedProducts;  // Return the products array
    }
});


Template.searchResults.events({
    'submit form#searchForm'(event){
        event.preventDefault();
        var search = Session.get('search');
        search.query = document.getElementById("searchBox").value;
        Session.set('search', search);  // Storing search input value in a variable
    },
    'click a.tag.is-delete'(event){
        // Link to delete a category tag is cliked
        event.preventDefault();
        var search = Session.get('search');  // Catching the array of categories that are already selected
        // Catching the grand parent element of the delete link (delete link is inside tags div which is inside a control div) :
        var tagToRemove = event.currentTarget.parentElement.parentElement;
        // The catagory to remove is the text content of the tag (control div's first elem is tags div, and it's first elem is the tag) :
        var categoryToRemove = tagToRemove.firstElementChild.firstElementChild.innerText;
        var index = search.categories.indexOf(categoryToRemove);  // Catching the index of the category to delete
        search.categories.splice(index, 1);  // Removing the category
        Session.set('search', search);  // Updating the value of the Session variable
        tagToRemove.parentNode.removeChild(tagToRemove);  // Removing the tag
    }
});
