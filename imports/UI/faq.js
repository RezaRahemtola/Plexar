// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './faq.html';

// Collapsible bulma extension import
import bulmaCollapsible from '@creativebulma/bulma-collapsible';


FlowRouter.route('/faq/:question', {
    name: 'faq',
    action(params, queryParams){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'faq'});
        // Scrolling the window back to the top
        window.scrollTo(0, 0);
        // Checking if there is a question to open
        if(params.hasOwnProperty('question')){
            // There is an answer to display, we catch the question & trigger a click on the corresponding answer link
            const askedQuestion = params['question'];
            document.querySelector('a[href="#'+askedQuestion+'"]').click();
        }
    }
});


Template.faq.onRendered(function(){
    // Return an array of bulmaCollapsible instances (empty if no DOM node found)
    const bulmaCollapsibleInstances = bulmaCollapsible.attach('.is-collapsible');
});
