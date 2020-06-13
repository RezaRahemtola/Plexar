// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './about.html';


Template.about.onRendered(function(){
    // Scrolling the window back to the top
    window.scrollTo(0, 0);
})
