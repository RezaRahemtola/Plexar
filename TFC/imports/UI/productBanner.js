// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './productBanner.html';

// CSS imports
import './css/image.css';
import './css/banners.css';

// Database imports
import { Products } from '../databases/products.js';
import { Images } from '../databases/images.js';


Template.productBanner.helpers({
    displayProductFirstImage: function(productID){
        var productImagesID = Products.findOne({_id: productID}).imagesID;  // Return an array with IDs of the product images
        var productFirstImage = [Images.findOne({_id: productImagesID[0]})];  // Making an array so we can use {{#each}}
        return productFirstImage
    },
    displayProductCategories: function(productID){
        var productCategories = Products.findOne({_id: productID}).categories;
        return productCategories;
    }
});
