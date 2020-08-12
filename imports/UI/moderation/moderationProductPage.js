// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML imports
import './moderationProductPage.html';

// CSS import
import '../css/slideshow.css';

// Database import
import { Images } from '../../databases/images.js';


FlowRouter.route('/moderationProduct/:_id', {
    name: 'moderationProduct',
    action(params, queryParams){
        // With the given id, we search for the product
        const productId = params["_id"];
        Meteor.call('findOneProductById', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                // Sending user back to home page to avoid a blank page displayed
                FlowRouter.go('/');
            } else if(result){
                // Product was successfully returned, saving it in a Session variable
                Session.set('currentProduct', result);
                // Render a template using Blaze
                BlazeLayout.render('main', {currentPage: 'moderationProductPage'});
                // Scrolling the window back to the top
                window.scrollTo(0, 0);
            }
        });
    }
});


Template.moderationProductPage.helpers({
    displayProduct: function(){
        // Return the product that corresponds to the one to display
        if(Session.get('currentProduct')){
            return Session.get('currentProduct');
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
                return website;
            }
        }
    },
    imagesLoading: function(){
        // Check if the Images collection is ready to receive our requests
        return !Meteor.subscribe('images').ready();
    }
});
