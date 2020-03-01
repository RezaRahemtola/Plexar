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
        event.preventDefault();
        var favoriteProducts = Favoris.findOne({user :{$eq: Meteor.user()._id}}).products;
        var favoriteID = Favoris.findOne({user :{$eq: Meteor.user()._id}})._id;
        favoriteProducts.push(Session.get('currentProductID'));
        Favoris.update(favoriteID, { $set: {
            products: favoriteProducts
        }});
        alert("Produit bien ajouté aux favoris !");
    },
    'click #removeFromFavoriteProducts'(event){
        var favorites = Favoris.findOne({user :{$eq: Meteor.user()._id}}).products;
        var favoriteID = Favoris.findOne({user :{$eq: Meteor.user()._id}})._id;
        favoriteProducts.pop(Session.get('currentProductID'));
        Favoris.update(favoriteID, { $set: {
            products: favoriteProducts
        }});
        alert("Produit supprimé de vos favoris");
    }
})

Template.productPage.helpers({
    displayProduct: function(){
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
