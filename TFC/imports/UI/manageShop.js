// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Shops } from '../bdd/shops.js';

// HTML import
import './manageShop.html';

Template.manageShop.events({
    'click #addShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newShop'));
        var shopName = form.get('shopName');
        var shopDescription = form.get('shopDescription');

        // Inserting informations in the database
        Shops.insert({
            name: shopName,
            description: shopDescription,
        });
    },
    'click #deleteShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteShop'));
        var shopID = form.get('ID');

        // Delete corresponding line in the database
        Shops.remove(shopID);
    }
});

Template.manageShop.helpers({
    displayAllShops: function(){
        return Shops.find({}, {});
    }
});
