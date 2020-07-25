// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './contact.html';


FlowRouter.route('/contact', {
    name: 'contact',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'contact'});
    }
});


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

        $(event.target).addClass("is-loading");  // Adding a loading effect on the button

        // Checking if the email address is correct
        Meteor.call('checkEmailInput', {email: email}, function(error, result){
            if(error){
                // Value isn't a valid email address, showing an error message
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});
                $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
            } else{
                // Value is a valid email address, we can continue the process

                // This call can take some time to complete, showing a waiting message
                Session.set('message', {type:"header", headerContent:"Envoi du message en cours..."});

                Meteor.call('sendContactMessage', {email: email, subject: subject, message: message}, function(error, result){
                    if(error){
                        // There was an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});
                        $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
                    } else{
                        // Email was successfully sent, displaying a confirmation email
                        Session.set('message', {type:"header", headerContent:"Message envoyé, nous reviendrons vers vous dès que possible.", style:"is-success"});
                        FlowRouter.go('/');  // Sending user to home page
                    }
                });
            }
        });
    }
});
