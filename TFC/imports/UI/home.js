// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './home.html';

// Database import
import { Produits } from '../bdd/produits.js';

Template.home.helpers({
    productsCounter(){
        return Produits.find().count();
    }
});
