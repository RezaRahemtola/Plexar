//import utile
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

//import de la database
import { Produits } from '../bdd/produits.js';

// HTML imports
import './manageProduit.html';

Template.manageProduit.events({
    'click #submitAdd'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newProduit'));
        var nomProduit = form.get('nom');
        var descriptionProduit = form.get('description');

        // Insertion des informations dans la database
        Produits.insert({
            nom: nomProduit,
            description: descriptionProduit,
        });
    },
    'click #submitDelete'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteProduit'));
        var IDproduit = form.get('ID');

        //Supprime la ligne de la database
        Produits.remove(IDproduit);
    }
});

Template.manageProduit.helpers({
    afficherProduits: function(){
            return Produits.find({}, {});
    }
});
