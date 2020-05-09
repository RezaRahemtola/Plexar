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


Template.contact.events({
    'click button#sendMessage'(event){
        event.preventDefault();

        // Catching form and fields
        const form = new FormData(document.getElementById('contactForm'));
        const email = form.get('email');
        const subject = form.get('subject');
        const message = form.get('message');

        // This call can take some time to complete, showing a waiting message
        Session.set('message', {type:"header", headerContent:"Envoi du message en cours..."});
        $(event.target).addClass("is-loading");  // Adding a loading effect on the button

        Meteor.call('sendContactMessage', {email: email, subject: subject, message: message}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});
            } else if(result){
                // Email was successfully sent, displaying a confirmation email
                Session.set('page', 'home');
                $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
                Session.set('message', {type:"header", headerContent:"Message envoyé, nous reviendrons vers vous dès que possible", style:"is-success"});
            }
        });
    }
});
