//import utile
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

//import de la database
import { Produits } from '../bdd/produits.js';

// HTML imports
import './addProduit.html';

Template.addProduit.events({
    'click #submitProduit'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newProduit'));
        var nomProduit = form.get('nom');
        var descriptionProduit = form.get('description');

        // Insertion des informations dans la database
        Produits.insert({
            nom: nomProduit,
            description: descriptionProduit,
        });
    }
});
