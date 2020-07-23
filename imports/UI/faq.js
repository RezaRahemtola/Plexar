// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './faq.html';

// Collapsible bulma extension import
import bulmaCollapsible from '@creativebulma/bulma-collapsible';

// Initializing Session variable
Session.set('displayedFaqQuestion', null);


FlowRouter.route('/faq', {
    name: 'faq',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'faq'});
    }
});


Template.faq.onRendered(function(){
    // Scrolling the window back to the top
    window.scrollTo(0, 0);

    // Return an array of bulmaCollapsible instances (empty if no DOM node found)
    const bulmaCollapsibleInstances = bulmaCollapsible.attach('.is-collapsible');

    // Checking if there is a question to open
    const askedQuestion = Session.get('displayedFaqQuestion');
    if(askedQuestion !== null){
        // There is an answer to display, we trigger a click on the corresponding answer link
        document.querySelector('a[href="#'+askedQuestion+'"]').click();
    }
});


Template.faq.onDestroyed(function(){
    // Reset the displayed question
    Session.set('displayedFaqQuestion', null);
});
