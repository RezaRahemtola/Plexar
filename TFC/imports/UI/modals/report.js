// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

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
        switch(checkedOption){
            case 'duplicate':
                var reason = "Signalement : Produit référencé plusieurs fois.";
                break;
            case 'offTopic':
                var reason = "Signalement : Produit hors-sujet";
                break;
            case 'incorrectInformations':
                var reason = "Signalement : Informations incorrectes";
                break;
            default:
                var reason = "Signalement : Raison non-renseignée";
        }
        
        Moderation.insert({
            elementId: productId,
            reason: reason
        });
        Session.set('page', Session.get('lastPage'));
    }
});
