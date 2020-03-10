// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productPage.html';
import './messages/productAddedToFavorite.html';
import './messages/productRemovedFromFavorite.html'

// Database imports
import { Products } from '../bdd/products.js';
import { Favorites } from '../bdd/favorites.js';

Template.displayedProductPage.events({
    'click #addToFavoriteProducts'(event){
        // User wants to add this product to it's favorites
        event.preventDefault();
        var favoriteProducts = Favorites.findOne({userId :{$eq: Meteor.userId()}}).products;  // Getting favorite products of the current user in the db
        var favoriteID = Favorites.findOne({userId :{$eq: Meteor.userId()}})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.push(Session.get('currentProductID'));  // Adding the product to the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        Session.set('message', 'productAddedToFavorite');  // Showing a confirmation message
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
        Session.set('message', 'productRemovedFromFavorite');  // Showing a confirmation message
    }
})

Template.productPage.helpers({
    displayProduct: function(){
        // Return the product that corresponds to the one to display
        return Products.find({_id :{$eq: Session.get('currentProductID')}},{});
    }
});

Template.displayedProductPage.helpers({
    productInFavorites: function(productID){
        // Check if the given product ID is in the favorite products of the user
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Return the favorites of the current user
        if(favoriteProducts.indexOf(productID) === -1){
            return false;  // Given ID is not in the favorite products, so return false
        } else{
            return true;  // Given ID is in the favorite products, return true
        }
    }
});
