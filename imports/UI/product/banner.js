// Useful import
import { Template } from 'meteor/templating';

// HTML import
import './banner.html';

// Database imports
import { Images } from '../../databases/images.js';


Template.productBanner.helpers({
    displayProductFirstImage: function(images){
        // With a given array of imagesId, return the link of the first image to display it in the banner
        if(Images.findOne({_id: images[0]})){
            // Checking if this image is available, if yes returning the link
            return Images.findOne({_id: images[0]}).link();
        }
    }
});
