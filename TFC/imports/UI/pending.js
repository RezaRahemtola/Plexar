// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './pending.html';

// Database import
import { Products } from '../databases/products.js';


Template.pending.helpers({
    displayPending: function(){
        return Products.find({pending: true});
    }
});


Template.pending.events({
    'click .pendingAccepted'(event){
        // TODO: Vefier que l'user est legitime d'accepter un pending
        event.preventDefault();
        var productID = event.currentTarget.id;
        Products.update(productID, { $set: {
            pending: false
        }});
    }
});
