// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './pending.html';

// Database import
import { Products } from '../databases/products.js';
import { Moderation } from '../databases/moderation.js';


Template.pending.helpers({
    displayPending: function(){
        var elements = Moderation.find();
        var products = [];
        for(var element of elements){
            products.push(Products.findOne({_id: element.elementId}))
        }
        return products;
    }
});


Template.pending.events({
    'click .moderationAccepted'(event){
        // TODO: Vefier que l'user est legitime d'accepter un pending
        event.preventDefault();
        var moderationId = event.currentTarget.id;
        Moderation.remove(moderationId);
    }
});
