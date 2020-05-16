// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './productBanner.html';

// CSS imports
import './css/image.css';
import './css/banners.css';

// Database imports
import { Images } from '../databases/images.js';


Template.productBanner.helpers({
    displayProductFirstImage: function(images){
        return Images.findOne({_id: images[0]}).url();  // Return the url of the image
    }
});
