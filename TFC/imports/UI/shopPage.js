// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './shopPage.html';

// Database import
import { Shops } from '../bdd/shops.js';
import { Favoris } from '../bdd/favoris.js';

Template.displayedShopPage.events({
    'click #addToFavoriteShops'(event){
        event.preventDefault();
        var favoriteShops = Favoris.findOne({user :{$eq: Meteor.user()._id}}).shops;
        var favoriteID = Favoris.findOne({user :{$eq: Meteor.user()._id}})._id;
        favoriteShops.push(Session.get('currentShopID'));
        Favoris.update(favoriteID, { $set: {
            shops: favoriteShops
        }});
        alert("Magasin bien ajouté aux favoris !");
    },
    'click #removeFromFavoriteShops'(event){
        var favoriteShops = Favoris.findOne({user :{$eq: Meteor.user()._id}}).shops;
        var favoriteID = Favoris.findOne({user :{$eq: Meteor.user()._id}})._id;
        favoriteShops.pop(Session.get('currentShopID'));
        Favoris.update(favoriteID, { $set: {
            shops: favoriteShops
        }});
        alert("Magasin supprimé de vos favoris");
    }
})

Template.shopPage.helpers({
    displayShop: function(){
        return Shops.find({_id :{$eq: Session.get('currentShopID')}},{});
    }
});

Template.displayedShopPage.helpers({
    shopInFavorites: function(IDshop){
        // Check if the given shop ID is in the favorite shops of the user
        var favoriteShops = Favoris.findOne({user: Meteor.user()._id}).shops;  // Return the favorites of the current user
        if(favoriteShops.indexOf(IDshop) === -1){
            return false;  // Given ID is not in the favorite shops, so return false
        } else{
            return true;  // Given ID is in the favorite shops, return true
        }
    }
});
