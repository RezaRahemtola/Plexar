// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './report.html';

// CSS import
import '../css/form.css';

// Database imports
import { Moderation } from '../../databases/moderation.js';


Template.report.events({
    'click #reportSubmit' (event){
        // TODO: En fonction du nombre de points/admin de l'user, instant valider le report et effectuer l'action correspondante
        var productId = document.querySelector('button.report').id;
        var checkedOption = document.querySelector("input[type='radio'][name='reportReason']:checked").id;
        Moderation.insert({
            elementId: productId,
            reason: checkedOption
        });
        Session.set('modal', null);
        Session.set('page', Session.get('lastPage'));
    }
});
