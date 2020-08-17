// Useful import
import { Template } from 'meteor/templating';

// HTML import
import './moderationBanner.html';

// Database imports
import { Images } from '../../databases/images.js';


Template.moderationBanner.helpers({
    displayProductFirstImage: function(images){
        return Images.findOne({_id: images[0]}).link();  // Return the url of the image
    },
    editModeration: function(moderationReason){
        // Check if it's an edit suggestion to display a button to see edits
        return moderationReason === 'editProduct';
    }
});
