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
import { UsersInformations } from '../bdd/usersInformations.js';


Template.shopPage.helpers({
    displayShop: function(){
        // Return the shop that corresponds to the one to display
        return Shops.find({_id: Session.get('currentShopID')});
    }
});


Template.displayedShopPage.events({
    'click #addToFavoriteShops'(event){
        // User wants to add this shop to it's favorites
        event.preventDefault();
        var favoriteShops = Favorites.findOne({userId: Meteor.userId()}).shops;  // Getting favorite shops of the current user in the db
        const favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
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
        const favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteShops.pop(Session.get('currentShopID'));  // Removing the shop from the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            shops: favoriteShops
        }});
        Session.set('message', {type: "header", headerContent: "Magasin supprimé de vos favoris", style: "is-success"});  // Showing a confirmation message
    },
    'click .shopVote'(event){
        var shopID = Session.get('currentShopID');
        var shopScore = Shops.findOne({_id: shopID}).score;
        const userInformationsID = UsersInformations.findOne({userID: Meteor.userId()})._id;
        var userUpvotes = UsersInformations.findOne({userID: Meteor.userId()}).upvotes;
        var userDownvotes = UsersInformations.findOne({userID: Meteor.userId()}).downvotes;

        if(event.currentTarget.id === "upvote"){
            if(userUpvotes.includes(shopID)){
                // Shop has already been upvoted, we remove the upvote
                userUpvotes.pop(shopID);
                shopScore--;
                $('#upvote').removeClass("green");
            } else if(userDownvotes.includes(shopID)){
                // Shop has already been downvoted, remove the downvote and set an upvote
                userDownvotes.pop(shopID);
                userUpvotes.push(shopID);
                shopScore += 2;  // Removing the downvote and adding an upvote
                $('#upvote').addClass("green");
                $('#downvote').removeClass("green");
            } else{
                // Shop hasn't already been voted
                userUpvotes.push(shopID);
                shopScore++;
                $('#upvote').addClass("green");
            }
        } else{
            if(userUpvotes.includes(shopID)){
                // Shop has already been upvoted, we remove the upvote and set a downvote
                userUpvotes.pop(shopID);
                userDownvotes.push(shopID);
                shopScore -= 2;
                $('#upvote').removeClass("green");
                $('#downvote').addClass("green");
            } else if(userDownvotes.includes(shopID)){
                // Shop has already been downvoted, remove the downvote
                userDownvotes.pop(shopID);
                shopScore++;
                $('#downvote').removeClass("green");
            } else{
                // Shop hasn't already been voted
                userDownvotes.push(shopID);
                shopScore--;
                $('#downvote').addClass("green");
            }
        }
        Shops.update(shopID, { $set: {
            // Updating the database with the new score
            score: shopScore
        }});
        UsersInformations.update(userInformationsID, { $set: {
            upvotes: userUpvotes,
            downvotes: userDownvotes
        }});
    }
})


Template.displayedShopPage.helpers({
    shopInFavorites: function(IDshop){
        // Check if the given shop ID is in the favorite shops of the user
        var favoriteShops = Favorites.findOne({userId: Meteor.userId()}).shops;  // Return the favorites of the current user
        return favoriteShops.includes(IDshop);
    },
    displayShopImages: function(){
        var shopImagesID = Shops.findOne({_id: Session.get('currentShopID')}).imagesID;  // Return an array with IDs of the shop's images
        var shopImages = [];  // Creating an empty array for images
        for(var imageID of shopImagesID){
            // Filling the array with shop's images
            shopImages.push(Images.findOne({_id: imageID}));
        }
        return shopImages
    },
    moreThanOneImage: function(){
        var shopImagesID = Shops.findOne({_id: Session.get('currentShopID')}).imagesID;  // Return an array with IDs of the shop's images
        if(shopImagesID.length > 1){
            return true
        }
        return false
    },
    displayShopCategories: function(shopID){
        return Shops.findOne({_id: shopID}).categories;

    }
});
