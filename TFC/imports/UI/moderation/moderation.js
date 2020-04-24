// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './moderation.html';

// JS import
import './moderationBanner.js';

// Database import
import { Products } from '../../databases/products.js';
import { EditedProducts } from '../../databases/editedProducts.js';
import { Moderation } from '../../databases/moderation.js';
import { Images } from '../../databases/moderation.js';


Template.moderation.helpers({
    displayModeration: function(){
        var elements = Moderation.find();
        var products = [];
        for(var element of elements){
            products.push(Products.findOne({_id: element.elementId}))
        }
        return products;
    }
});


Template.moderation.events({
    'click .moderationAccepted'(event){
        // TODO: Vefier que l'user est legitime d'accepter un pending
        event.preventDefault();
        var moderationId = event.currentTarget.id;
        var currentModeration = Moderation.findOne({_id: moderationId});
        switch(currentModeration.reason){
            case 'newProduct':
                // New product accepted, it's already in the Products db so we only need to remove it from Moderation
                break;
            case 'duplicate':
            case 'offTopic':
                // Duplicate or off topic approved, removing the product
                var productImagesID = Products.findOne({_id: currentModeration.elementId}).imagesID;  // Catching the product images
                Products.remove(currentModeration.elementId, function(error, result){
                    if(!error){
                        // The product was successfully removed, we can now delete it's images
                        for(var imageID of productImagesID){
                            Images.remove(imageID);
                        }
                    }
                });
                break;
        }
        Moderation.remove(moderationId);
    }
});
