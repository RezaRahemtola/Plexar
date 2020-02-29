// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productPage.html';

// Database import
import { Produits } from '../bdd/produits.js';
import { Favoris } from '../bdd/favoris.js';

Template.displayedProductPage.events({
    'click #addToFavoriteProducts'(event){
        event.preventDefault();
        var favorites = Favoris.findOne({user :{$eq: Meteor.user()._id}});
        favorites.produits.push(Session.get('IDproduit'));
        Favoris.update(favorites._id, { $set: {
            produits: favorites.produits
        }});
        alert("Produit bien ajouté aux favoris !");
    },
    'click #removeFromFavoriteProducts'(event){
        var favorites = Favoris.findOne({user :{$eq: Meteor.user()._id}});
        favorites.produits.pop(Session.get('IDproduit'));
        Favoris.update(favorites._id, { $set: {
            produits: favorites.produits
        }});
        alert("Produit supprimé de vos favoris");
    }
})

Template.productPage.helpers({
    displayProduct: function(){
        return Produits.find({_id :{$eq: Session.get('IDproduit')}},{});
    }
});

Template.displayedProductPage.helpers({
    productInFavorites: function(IDproduit){
        // Check if the given product ID is in the favorite products of the user
        var favorites = Favoris.findOne({user: Meteor.user()._id});  // Return the favorites of the current user
        if(favorites.produits.indexOf(IDproduit) === -1){
            return false;  // Given ID is not in the favorite products, so return false
        } else{
            return true;  // Given ID is in the favorite products, return true
        }
    }
});
