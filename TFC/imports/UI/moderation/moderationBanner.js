// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './moderationBanner.html';

// CSS imports
import '../css/image.css';
import '../css/banners.css';

// Database imports
import { Images } from '../../databases/images.js';

// Initializing Session variables
Session.set('originalProduct', null);

Template.moderationBanner.helpers({
    displayProductFirstImage: function(images){
        return Images.findOne({_id: images[0]}).url();  // Return the url of the image
    },
    editModeration: function(moderationReason){
        if(moderationReason === 'editProduct'){
            // It's an edit suggestion, display a button to see edits
            return true;
        }
        return false;
    }
});


Template.moderationBanner.events({
    'click #seeEdit'(event){
        // TODO: Check if user is admin
        event.preventDefault();
        const productId = event.currentTarget.id;
        Meteor.call('findOneProductById', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                Session.set('originalProduct', result);
            }
        });
        var originalProduct = Session.get('originalProduct');
        //var editedProduct = EditedProducts.findOne({originalId: productId});
    }
});
