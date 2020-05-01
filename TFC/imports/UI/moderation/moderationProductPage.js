// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './moderationProductPage.html';

// CSS import
import '../css/slideshow.css';

// Database import
import { Images } from '../../databases/images.js';


Template.moderationProductPage.events({
    'click #return'(event){
        event.preventDefault();
        Session.set('page', Session.get('lastPage'));
    }
})


Template.moderationProductPage.helpers({
    displayProduct: function(){
        // Return the product that corresponds to the one to display
        if(Session.get('currentProduct')){
            return [Session.get('currentProduct')];
        }
    },
    displayProductImages: function(){
        if(Session.get('currentProduct')){
            var productImagesId = Session.get('currentProduct').images;  // Return an array with IDs of the product images
            var productImages = [];  // Creating an empty array for the images
            for(var imageId of productImagesId){
                // Filling the array with product's images
                productImages.push(Images.findOne({_id: imageId}));
            }
            return productImages;
        }
    },
    moreThanOneImage: function(){
        if(Session.get('currentProduct')){
            const productImagesId = Session.get('currentProduct').images;  // Return an array with IDs of the product images
            if(productImagesId.length > 1){
                return true;
            }
            return false;
        }
    },
    displayWebsite: function(){
        if(Session.get('currentProduct')){
            // Catching the website
            const website = Session.get('currentProduct').website;
            if(website !== ""){
                // If a website has been given we display it
                return [website];
            }
        }
    }
});
