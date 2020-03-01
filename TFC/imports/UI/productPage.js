// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productPage.html';

// Database import
import { Products } from '../bdd/products.js';
import { Favoris } from '../bdd/favoris.js';

Template.displayedProductPage.events({
    'click #addToFavoriteProducts'(event){
        // User wants to add this product to it's favorites
        event.preventDefault();
        var favoriteProducts = Favoris.findOne({user :{$eq: Meteor.user()._id}}).products;  // Getting favorite products of the current user in the db
        var favoriteID = Favoris.findOne({user :{$eq: Meteor.user()._id}})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.push(Session.get('currentProductID'));  // Adding the product to the array
        Favoris.update(favoriteID, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        alert("Produit bien ajouté aux favoris !");  // Showing a confirmation message
    },
    'click #removeFromFavoriteProducts'(event){
        // User wants to remove this product from it's favorites
        event.preventDefault();
        var favoriteProducts = Favoris.findOne({user :{$eq: Meteor.user()._id}}).products;  // Getting favorite products of the current user in the db
        var favoriteID = Favoris.findOne({user :{$eq: Meteor.user()._id}})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.pop(Session.get('currentProductID'));  // Removing the product from the array
        Favoris.update(favoriteID, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        alert("Produit supprimé de vos favoris");  // Showing a confirmation message
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
        var favoriteProducts = Favoris.findOne({user: Meteor.user()._id}).products;  // Return the favorites of the current user
        if(favoriteProducts.indexOf(productID) === -1){
            return false;  // Given ID is not in the favorite products, so return false
        } else{
            return true;  // Given ID is in the favorite products, return true
        }
    }
});
