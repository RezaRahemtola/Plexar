// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './moderation.html';

// Database import
import { Products } from '../../databases/products.js';
import { Moderation } from '../../databases/moderation.js';


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
                console.log('new');
                break;
            case 'duplicate':
                // Duplicate approved, removing the product
                Products.remove(currentModeration.elementId);
                break;
            case 'offTopic':
                // Off topic approved, removing the product
                Products.remove(currentModeration.elementId);
                break;
        }
        Moderation.remove(moderationId);
    }
});
