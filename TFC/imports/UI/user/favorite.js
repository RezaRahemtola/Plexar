// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './favorite.html';

// Database import
import { Favoris } from '../../bdd/favoris.js';
import { Produits } from '../../bdd/produits.js';

Template.favorite.helpers({
    displayFavorites: function(){
        var favoriteProductsID = Favoris.findOne({user: Meteor.user()._id}).produits  // Return an array with IDs of the products database
        var favoritesProducts = [];  // Creating an empty array of the products
        for (var element of favoriteProductsID) {
            // Filling the array with the products
            favoritesProducts.push(Produits.findOne({_id : element}));
        }
        return favoritesProducts;
    }
});
