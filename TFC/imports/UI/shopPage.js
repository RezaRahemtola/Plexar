// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './shopPage.html';

// CSS import
import './css/slideshow.css';

// Database imports
import { Shops } from '../bdd/shops.js';
import { Favorites } from '../bdd/favorites.js';
import { Images } from '../bdd/images.js';

Template.displayedShopPage.events({
    'click #addToFavoriteShops'(event){
        // User wants to add this shop to it's favorites
        event.preventDefault();
        var favoriteShops = Favorites.findOne({userId: Meteor.userId()}).shops;  // Getting favorite shops of the current user in the db
        var favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteShops.push(Session.get('currentShopID'));  // Adding the shop to the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            shops: favoriteShops
        }});
        Session.set('message', {type: "header", headerContent: "Magasin bien ajouté aux favoris !", style: "is-success"});  // Showing a confirmation message
    },
    'click #removeFromFavoriteShops'(event){
        // User wants to remove this shop from it's favorites
        event.preventDefault();
        var favoriteShops = Favorites.findOne({userId: Meteor.userId()}).shops;  // Getting favorite shops of the current user in the db
        var favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteShops.pop(Session.get('currentShopID'));  // Removing the shop from the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            shops: favoriteShops
        }});
        Session.set('message', {type: "header", headerContent: "Magasin supprimé de vos favoris", style: "is-success"});  // Showing a confirmation message
    }
})

Template.shopPage.helpers({
    displayShop: function(){
        // Return the shop that corresponds to the one to display
        return Shops.find({_id: Session.get('currentShopID')});
    }
});

Template.displayedShopPage.helpers({
    shopInFavorites: function(IDshop){
        // Check if the given shop ID is in the favorite shops of the user
        var favoriteShops = Favorites.findOne({userId: Meteor.userId()}).shops;  // Return the favorites of the current user
        if(favoriteShops.indexOf(IDshop) === -1){
            return false;  // Given ID is not in the favorite shops, so return false
        }
        return true;  // Given ID is in the favorite shops, return true
    },
    displayShopImages: function(){
        var shopImagesID = Shops.findOne({_id: Session.get('currentShopID')}).imagesID;  // Return an array with IDs of the shop images
        var shopImages = [];  // Creating an empty array for images
        for(var imageID of shopImagesID){
            // Filling the array with shop's images
            shopImages.push(Images.findOne({_id: imageID}));
        }
        return shopImages
    }
});
