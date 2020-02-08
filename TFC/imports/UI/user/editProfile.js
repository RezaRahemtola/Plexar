// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { Utilisateurs } from '../../bdd/utilisateurs.js';

// HTML import
import './editProfile.html';

// Form validation functions import
import './formValidation.js';


Template.editProfile.helpers({
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
  }
});
Template.editProfile.onRendered(function(){  // When the template is rendered on the screen
    Session.set('formErrorMessage', null);  // Reseting formErrorMessage
    var userInformations = Utilisateurs.findOne({username :{$eq: Meteor.user().username}},{});
    document.getElementById('username').value = Meteor.user().username;  // Auto fill username with current value
    document.getElementById('email').value = Meteor.user().emails[0].address;  // Auto fill email with current value
    document.getElementById('firstName').value = userInformations.firstName;  // Auto fill first name with current value
    document.getElementById('lastName').value = userInformations.lastName;  // Auto fill last name with current value

});

Template.editProfile.events({
    'submit form' (event){
        event.preventDefault();
        var userInformations = Utilisateurs.findOne({username :{$eq: Meteor.user().username}},{});  // Getting current user informations

        // Catching the form element and saving inputs in variables
        var form = new FormData(document.getElementById('editProfile'));
        var username = form.get('username');
        var firstName = form.get('firstName');
        var lastName = form.get('lastName');
        var email = form.get('email');

        // Updating non-sensitive informations in our database
        Utilisateurs.update(userInformations._id, { $set: {
            firstName: firstName,
            lastName: lastName
        }});

        Meteor.call('changeUsername', {userId: Meteor.userId(), newUsername: username}, function(error){
            if(error){
                Session.set('formErrorMessage', error.reason);  // Set the error message with given error value
            } else{
                // Username was changed successfully, updating value in our database
                Utilisateurs.update(userInformations._id, { $set: {
                    username: username
                }});
                if(document.getElementById('advancedEdition').style.display == 'none'){
                    // Advanced edition is disabled, sending user to profile page
                    alert('Vos informations ont été modifiées avec succès !');
                    Session.set('userPage', '');
                } else{
                    var oldPassword = form.get('oldPassword');  // Saving inputs in variables
                    var newPassword = form.get('newPassword');  // Saving inputs in variables
                    var confirmNewPassword = form.get('confirmNewPassword');  // Saving inputs in variables
                    if(!(areValidPasswords(newPassword, confirmNewPassword))){
                        // Error in passwords fields
                        document.getElementById('newPassword').classList.add("error");
                        document.getElementById('confirmNewPassword').classList.add("error");
                    } else{
                        // No error
                        Accounts.changePassword(oldPassword, newPassword, function(error){  // Callback function which can raise an error
                            if(error){
                                Session.set('formErrorMessage', error.reason);  // Set the error message with given error value
                            } else{
                                alert("Le mot de passe a été modifié avec succès");  // Success message
                                Session.set('userPage', '');
                            }
                        });
                    }
                }
            }
        });
    },
    'click #showAdvancedEdition'(event){
        event.preventDefault();
        if(document.getElementById('advancedEdition').style.display == 'none'){  // Advanced options are hidden
            document.getElementById('advancedEdition').style.display = 'inherit';  // Display advanced options
            document.getElementById('oldPassword').required = true;  // Set the passwords inputs as required
            document.getElementById('newPassword').required = true;  // Set the passwords inputs as required
            document.getElementById('confirmNewPassword').required = true;  // Set the passwords inputs as required
        } else{  // Advenced options are displayed
            document.getElementById('advancedEdition').style.display = 'none';  // Hide advenced options
            document.getElementById('oldPassword').required = false;  // Passwords inputs are no longer required
            document.getElementById('newPassword').required = false;  // Passwords inputs are no longer required
            document.getElementById('confirmNewPassword').required = false;  // Passwords inputs are no longer required
        }
    }
});
