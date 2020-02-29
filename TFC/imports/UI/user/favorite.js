// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './favorite.html';

// Database import
import { Favoris } from '../../bdd/favoris.js';
import { Produits } from '../../bdd/produits.js';

Template.favorite.helpers({
    getFavorites: function(){
        return Favoris.find({user :{$eq: Meteor.user()._id}},{});
    },
    displayFavorites: function(IDproduit){
        return Produits.find({_id :{$eq: IDproduit}},{});
    }
});
