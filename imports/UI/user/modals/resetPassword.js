// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './resetPassword.html';

// Initializing Session variable
Session.set('resetPasswordToken', null);


FlowRouter.route('/resetPassword', {
    name: 'resetPassword',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentModal: 'resetPassword'});
    }
});


Template.resetPassword.events({
    'click #resetPasswordSubmit'(event){
        event.preventDefault();

        // Reset password request was submitted, catching the form
        const form = new FormData(document.getElementById('resetPasswordForm'));

        // Catching inputs to call the validation method
        const newPassword = form.get('newPassword');
        const confirmNewPassword = form.get('confirmNewPassword');

        $(event.target).addClass("is-loading");  // Add a loading effect to the button

        Meteor.call('checkPasswordsInput', {password: newPassword, confirmPassword: confirmNewPassword}, function(error, result){
            if(error){
                // There is an error in password fields
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                $('input#newPassword, input#confirmNewPassword').addClass("is-danger");  // Adding a red border to those fields
                $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
            } else{
                // New passwords match all criteria, catching the token provided in reset password email
                const token = Session.get('resetPasswordToken');

                Accounts.resetPassword(token, newPassword, function(error){
                    if(error){
                        // There was an error while resetting the password
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});  // Display an error message
                        $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
                    } else{
                        // Password was successfully reset, displaying a success message
                        Session.set('message', {type:"header", headerContent:"Mot de passe réinitialisé avec succès", style:"is-success"});
                        Session.set('resetPasswordToken', null);  // Token has been used, we can reset the Session variable
                        FlowRouter.go('/');  // Reset password completed, we can remove the modal by sending the user to the home page
                    }
                });
            }
        });
    }
});


Template.resetPassword.helpers({
    messageToDisplay: function(){
        const message = Session.get('message');
        if(message !== null){
            // There is a message to display
            return message.type;  // Return the message to display
        }
    }
});
