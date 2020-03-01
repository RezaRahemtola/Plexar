// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './home.html';

// Database imports
import { Products } from '../bdd/products.js';
import { Shops } from '../bdd/shops.js';

Template.home.helpers({
    productsCounter(){
        return Products.find().count();
    },
    shopsCounter(){
        return Shops.find().count();
    }
});
