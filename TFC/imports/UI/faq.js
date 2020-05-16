// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './faq.html';

// Collaosible bulma extension import
import bulmaCollapsible from '@creativebulma/bulma-collapsible';

// Initializing Session variable
Session.set('displayedFaqQuestion', null);

Template.faq.onRendered(function(){
    // Return an array of bulmaCollapsible instances (empty if no DOM node found)
    const bulmaCollapsibleInstances = bulmaCollapsible.attach('.is-collapsible');

    // Checking if there is a question to open
    const askedQuestion = Session.get('displayedFaqQuestion');
    if(askedQuestion !== null){
        // There is a question to display, catching the element to expand
        // Code from https://demo.creativebulma.net/components/bulma-collapsible/1.0/javascript/#symbol-expand
        const answerToDisplay = document.querySelector('div.is-collapsible#'+askedQuestion);
        // Call method directly on bulmaCollapsible instance registered on the node
        answerToDisplay.bulmaCollapsible('expand');
    }
});


Template.faq.onDestroyed(function(){
    // Reset the displayed question
    Session.set('displayedFaqQuestion', null);
});
