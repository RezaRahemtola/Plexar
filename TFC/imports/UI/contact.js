// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './contact.html';


Template.contact.onRendered(function(){
    if(Meteor.userId()){
        // User is logged in, we can fill the email field with their email
        const emailInput = document.querySelector('input#email');
        const userEmail = Meteor.user().emails[0].address;
        emailInput.value = userEmail;
    }
});
