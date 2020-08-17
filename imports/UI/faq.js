// Useful imports
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './faq.html';

// Collapsible bulma extension import
import bulmaCollapsible from '@creativebulma/bulma-collapsible';


FlowRouter.route('/faq', {
    name: 'faq',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'faq'});
        // Scrolling the window back to the top
        window.scrollTo(0, 0);
    }
});


Template.faq.onRendered(function(){
    // Return an array of bulmaCollapsible instances (empty if no DOM node found)
    const bulmaCollapsibleInstances = bulmaCollapsible.attach('.is-collapsible');

    // Checking if a question was selected
    const askedQuestion = FlowRouter.getQueryParam('question');
    if(askedQuestion !== undefined){
        // Open the corresponding answer
        document.querySelector('a[href="#'+askedQuestion+'"]').click();
    }
});
