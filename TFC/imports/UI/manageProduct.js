// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Products } from '../bdd/products.js';

// HTML import
import './manageProduct.html';

Template.manageProduct.events({
    'click #addProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newProduct'));
        var productName = form.get('productName');
        var productDescription = form.get('productDescription');

        // Inserting informations in the database
        Products.insert({
            name: productName,
            description: productDescription,
        });
    },
    'click #deleteProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteProduct'));
        var productID = form.get('ID');

        // Delete corresponding line in the database
        Products.remove(productID);
    }
});

Template.manageProduct.helpers({
    displayAllProducts: function(){
        return Products.find({}, {});
    }
});
