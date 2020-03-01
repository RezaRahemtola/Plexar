// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './home.html';

// Database import
import { Products } from '../bdd/products.js';

Template.home.helpers({
    productsCounter(){
        return Products.find().count();
    }
});
