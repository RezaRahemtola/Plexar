import { Accounts } from 'meteor/accounts-base';


// Handling email verification
Accounts.onEmailVerificationLink(function(token, done){
    // When the verification link is clicked, passing the token to the verification function
    Accounts.verifyEmail(token, function(error){
        if(error){
            // There was an error while verifying the email address
            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
        } else{
            // Email was successfully verified, displaying a success message
            Session.set('message', {type: "header", headerContent: "Adresse email vérifiée avec succès.", style: "is-success"});
            done();
        }
    });
});


// Handling password reset
Accounts.onResetPasswordLink(function(token, done){
    // When the reset password link is clicked, saving the token in a Session variable to be able to call Accounts.resetPassword with it
    Session.set('resetPasswordToken', token);
    Session.set('modal', 'resetPassword');  // Display a modal to ask the new password
});
