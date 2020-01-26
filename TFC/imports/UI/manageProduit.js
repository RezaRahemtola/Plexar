// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Produits } from '../bdd/produits.js';

// HTML import
import './manageProduit.html';

Template.manageProduit.events({
    'click #addProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newProduit'));
        var productName = form.get('productName');
        var productDescription = form.get('productDescription');

        // Inserting informations in the database
        Produits.insert({
            nom: productName,
            description: productDescription,
        });
    },
    'click #deleteProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteProduit'));
        var IDproduit = form.get('ID');

        // Delete corresponding line in the database
        Produits.remove(IDproduit);
    }
});

Template.manageProduit.helpers({
    displayAllProduits: function(){
        return Produits.find({}, {});
    }
});
