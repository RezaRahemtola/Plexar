// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './shopBanner.html';

// CSS imports
import './css/image.css';
import './css/banners.css';

// Database imports
import { Shops } from '../bdd/shops.js';
import { Images } from '../bdd/images.js';


Template.shopBanner.helpers({
    displayShopFirstImage: function(shopID){
        var shopImagesID = Shops.findOne({_id: shopID}).imagesID;  // Return an array with IDs of the shop images
        var shopFirstImage = [Images.findOne({_id: shopImagesID[0]})];
        return shopFirstImage
    },
    displayShopCategories: function(shopID){
        var shopCategories = Shops.findOne({_id: shopID}).categories;
        return shopCategories;
    }
});
