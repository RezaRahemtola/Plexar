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
        var firstImageID = Products.findOne({_id: productID}).imagesID[0];  // Return the ID of the first product image
        return Images.findOne({_id: firstImageID}).url();  // Return the url of the image
    },
    displayProductCategories: function(productID){
        return Products.findOne({_id: productID}).categories;
    }
});
