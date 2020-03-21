// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productPage.html';

// CSS import
import './css/slideshow.css';

// Database imports
import { Products } from '../bdd/products.js';
import { Favorites } from '../bdd/favorites.js';
import { Images } from '../bdd/images.js';
import { UsersInformations } from '../bdd/usersInformations.js';


Template.productPage.helpers({
    displayProduct: function(){
        // Return the product that corresponds to the one to display
        return Products.find({_id: Session.get('currentProductID')});
    }
});


Template.displayedProductPage.onRendered(function(){
    if(Meteor.user()){
        var productID = Session.get('currentProductID');
        var productScore = Products.findOne({_id: productID}).score;
        var userUpvotes = UsersInformations.findOne({userID: Meteor.userId()}).upvotes;
        var userDownvotes = UsersInformations.findOne({userID: Meteor.userId()}).downvotes;
        if(userUpvotes.includes(productID)){
            // Product has already been upvoted by the user
            document.getElementById('upvote').classList.add("green");
        } else if(userDownvotes.includes(productID)){
            // User has already downvoted this product
            document.getElementById('downvote').classList.add("green");
        }
    }
});

Template.displayedProductPage.events({
    'click #addToFavoriteProducts'(event){
        // User wants to add this product to it's favorites
        event.preventDefault();
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Getting favorite products of the current user in the db
        var favoriteID = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
        favoriteProducts.push(Session.get('currentProductID'));  // Adding the product to the array
        Favorites.update(favoriteID, { $set: {
            // Updating the database with the modified array
            products: favoriteProducts
        }});
        Session.set('message', {type: "header", headerContent: "Produit bien ajouté aux favoris !", style: "is-success"});  // Showing a confirmation message
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
        Session.set('message', {type: "header", headerContent: "Produit supprimé de vos favoris", style: "is-success"});  // Showing a confirmation message
    },
    'click .productVote'(event){
        var productID = Session.get('currentProductID');
        var productScore = Products.findOne({_id: productID}).score;
        var userInformationsID = UsersInformations.findOne({userID: Meteor.userId()})._id;
        var userUpvotes = UsersInformations.findOne({userID: Meteor.userId()}).upvotes;
        var userDownvotes = UsersInformations.findOne({userID: Meteor.userId()}).downvotes;

        if(event.currentTarget.id === "upvote"){
            if(userUpvotes.includes(productID)){
                // Product has already been upvoted, we remove the upvote
                userUpvotes.pop(productID);
                productScore--;
                document.getElementById('upvote').classList.remove("green");
            } else if(userDownvotes.includes(productID)){
                // Product has already been downvoted, remove the downvote and set an upvote
                userDownvotes.pop(productID);
                userUpvotes.push(productID);
                productScore += 2;  // Removing the downvote and adding an upvote
                document.getElementById('upvote').classList.add("green");
                document.getElementById('downvote').classList.remove("green");
            } else{
                // Product hasn't already been voted
                userUpvotes.push(productID);
                productScore++;
                document.getElementById('upvote').classList.add("green");
            }
        } else{
            if(userUpvotes.includes(productID)){
                // Product has already been upvoted, we remove the upvote and set a downvote
                userUpvotes.pop(productID);
                userDownvotes.push(productID);
                productScore -= 2;
                document.getElementById('upvote').classList.remove("green");
                document.getElementById('downvote').classList.add("green");
            } else if(userDownvotes.includes(productID)){
                // Product has already been downvoted, remove the downvote
                userDownvotes.pop(productID);
                productScore++;
                document.getElementById('downvote').classList.remove("green");
            } else{
                // Product hasn't already been voted
                userDownvotes.push(productID);
                productScore--;
                document.getElementById('downvote').classList.add("green");
            }
        }
        Products.update(productID, { $set: {
            // Updating the database with the new score
            score: productScore
        }});
        UsersInformations.update(userInformationsID, { $set: {
            upvotes: userUpvotes,
            downvotes: userDownvotes
        }});
    }
})


Template.displayedProductPage.helpers({
    productInFavorites: function(){
        // Check if the given product ID is in the favorite products of the user
        var favoriteProducts = Favorites.findOne({userId: Meteor.userId()}).products;  // Return the favorites of the current user
        return favoriteProducts.includes(Session.get('currentProductID'));
    },
    displayProductImages: function(){
        var productImagesID = Products.findOne({_id: Session.get('currentProductID')}).imagesID;  // Return an array with IDs of the product images
        var productImages = [];  // Creating an empty array for the images
        for(var imageID of productImagesID){
            // Filling the array with product's images
            productImages.push(Images.findOne({_id: imageID}));
        }
        return productImages
    },
    moreThanOneImage: function(){
        var productImagesID = Products.findOne({_id: Session.get('currentProductID')}).imagesID;  // Return an array with IDs of the product images
        if(productImagesID.length > 1){
            return true
        }
        return false
    }
});
