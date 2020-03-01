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
        // User wants to add this shop to it's favorites
        event.preventDefault();
        var favoriteShops = Favoris.findOne({user :{$eq: Meteor.user()._id}}).shops;  // Getting favorite shops of the current user in the db
        var favoriteID = Favoris.findOne({user :{$eq: Meteor.user()._id}})._id;  // Getting line ID (needed to modify data)
        favoriteShops.push(Session.get('currentShopID'));  // Adding the shop to the array
        Favoris.update(favoriteID, { $set: {
            // Updating the database with the modified array
            shops: favoriteShops
        }});
        alert("Magasin bien ajouté aux favoris !");  // Showing a confirmation message
    },
    'click #removeFromFavoriteShops'(event){
        // User wants to remove this shop from it's favorites
        event.preventDefault();
        var favoriteShops = Favoris.findOne({user :{$eq: Meteor.user()._id}}).shops;  // Getting favorite shops of the current user in the db
        var favoriteID = Favoris.findOne({user :{$eq: Meteor.user()._id}})._id;  // Getting line ID (needed to modify data)
        favoriteShops.pop(Session.get('currentShopID'));  // Removing the shop from the array
        Favoris.update(favoriteID, { $set: {
            // Updating the database with the modified array
            shops: favoriteShops
        }});
        alert("Magasin supprimé de vos favoris");  // Showing a confirmation message
    }
})

Template.shopPage.helpers({
    displayShop: function(){
        // Return the shop that corresponds to the one to display
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
