// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './404NotFound.html';


// Create 404 route (catch-all)
FlowRouter.route('*', {
    action(){
        // Show 404 error page
        BlazeLayout.render('main', {currentPage: '404NotFound'});
    }
});
