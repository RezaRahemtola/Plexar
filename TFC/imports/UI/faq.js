// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './faq.html';

// Collaosible bulma extension import
import bulmaCollapsible from '@creativebulma/bulma-collapsible';


Template.faq.onRendered(function(){
    // Return an array of bulmaCollapsible instances (empty if no DOM node found)
    const bulmaCollapsibleInstances = bulmaCollapsible.attach('.is-collapsible');
});
