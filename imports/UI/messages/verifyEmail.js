// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './verifyEmail.html';


Template.verifyEmail.helpers({
    messageToDisplay: function(){
        return Session.get('message');
    },
    userEmail: function(){
        if(Meteor.user()){
            // User is logged in, catching it's email
            return Meteor.user().emails[0].address;
        }
    }
});


Template.verifyEmail.events({
    'click #resendVerificationEmail'(event){
        event.preventDefault();

        // This call can take a few seconds to complete, showing a waiting message
        Session.set('message', {type:"header", headerContent:"Renvoi de l'email de vérification en cours..."});

        Meteor.call('sendVerificationEmail', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Verification email was sent successfully, showing a confirmation message
                Session.set('message', {type:"header", headerContent:"Email de vérification renvoyé avec succès.", style:"is-success"} );
            }
        });
    }
});
