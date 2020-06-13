// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './contact.html';


Template.contact.onRendered(function(){
    // Scrolling the window back to the top
    window.scrollTo(0, 0);

    if(Meteor.userId()){
        // User is logged in, we can fill the email field with their email
        const emailInput = document.querySelector('input#email');
        const userEmail = Meteor.user().emails[0].address;
        emailInput.value = userEmail;
    }


    // Live email validation
    const emailInput = document.querySelector('input#email');
    emailInput.onchange = function(){
        Meteor.call('checkEmailInput', {email: emailInput.value}, function(error, result){
            if(error){
                // Value isn't a valid email address
                $('input#email').addClass("is-danger");
                document.querySelector('#emailField p.help.is-danger').textContent = "Veuillez entrer une adresse email valide";  // Adding a danger help message
            } else{
                // Value is a valid email address, removing danger display
                $('input#email').removeClass("is-danger");
                document.querySelector('#emailField p.help.is-danger').textContent = "";  // Removing the danger help message
            }
        });
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
                $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
                Session.set('message', {type:"header", headerContent:"Message envoyé, nous reviendrons vers vous dès que possible", style:"is-success"});
                // Sending user to home page
                var navigation = Session.get('navigation');  // Catching navigation history
                navigation.push(Session.get('page'));  // Adding the current page
                Session.set('navigation', navigation);  // Updating the value
                Session.set('page', 'home');
            }
        });
    }
});
