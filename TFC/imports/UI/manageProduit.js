// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Produits } from '../bdd/produits.js';

// HTML import
import './manageProduit.html';

Template.manageProduit.events({
    'click #submitAdd'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newProduit'));
        var nomProduit = form.get('nom');
        var descriptionProduit = form.get('description');

        // Inserting informations in the database
        Produits.insert({
            nom: nomProduit,
            description: descriptionProduit,
        });
    },
    'click #submitDelete'(event){
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
