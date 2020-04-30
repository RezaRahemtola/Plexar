// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './moderationBanner.html';

// CSS imports
import '../css/image.css';
import '../css/banners.css';

// Database imports
import { Images } from '../../databases/images.js';


Template.moderationBanner.helpers({
    displayProductFirstImage: function(images){
        return Images.findOne({_id: images[0]}).url();  // Return the url of the image
    },
    editModeration: function(moderationReason){
        if(moderationReason === 'editProduct'){
            // It's an edit suggestion, display a button to see edits
            return true;
        }
        return false;
    }
});
