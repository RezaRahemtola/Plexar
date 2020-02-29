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
        Favoris.insert({
            user: Meteor.user()._id,
            produit: Session.get('IDproduit')
        });
        alert("Produit bien ajouté aux favoris !");
    },
    'click #removeFromFavoriteProducts'(event){
        var productToRemove = Favoris.findOne({user :{$eq: Meteor.user()._id}, produit: Session.get('IDproduit')},{});
        console.log(productToRemove._id);
        Favoris.remove(productToRemove._id);
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
        var productInDatabase = Favoris.findOne({user :{$eq: Meteor.user()._id}, produit: IDproduit},{});
        if(productInDatabase === undefined){
            // This product is not in the database, we return false
            return false
        }
        return true
    }
});
