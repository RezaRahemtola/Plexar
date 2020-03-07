// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database imports
import { Products } from '../bdd/products.js';
import { Shops } from '../bdd/shops.js';

// HTML imports
import './searchResults.html';


Template.searchResults.helpers({
    displayProductsResults: function(){
        var products = Products.find({name: Session.get("searchedText")});
        return products
    },
    displayShopsResults: function(){
        var shops = Shops.find({name: Session.get("searchedText")});
        return shops
    }
});
