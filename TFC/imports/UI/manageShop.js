// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Magasins } from '../bdd/magasins.js';

// HTML import
import './manageShop.html';

Template.manageShop.events({
    'click #addShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newShop'));
        var shopName = form.get('shopName');
        var shopDescription = form.get('shopDescription');

        // Inserting informations in the database
        Magasins.insert({
            nom: shopName,
            description: shopDescription,
        });
    },
    'click #deleteShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteShop'));
        var IDshop = form.get('ID');

        // Delete corresponding line in the database
        Magasins.remove(IDshop);
    }
});

Template.manageShop.helpers({
    displayAllShops: function(){
        return Magasins.find({}, {});
    }
});
