// Useful imports
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './about.html';


FlowRouter.route('/about', {
    name: 'about',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'about'});
        // Scrolling the window back to the top
        window.scrollTo(0, 0);
    }
});
