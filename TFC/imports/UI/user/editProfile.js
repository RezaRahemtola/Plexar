// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { UsersInformations } from '../../bdd/usersInformations.js';
import { Images } from '../../bdd/images.js';

// HTML import
import './editProfile.html';

// Form validation functions import
import './formValidation.js';
import '../functions/checkFileUpload.js';


Template.editProfile.helpers({
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
  }
});


Template.editProfile.onRendered(function(){  // When the template is rendered on the screen
    Session.set('formErrorMessage', null);  // Reseting formErrorMessage
    var userInformations = UsersInformations.findOne({userId: Meteor.userId()});
    document.getElementById('username').value = Meteor.user().username;  // Auto fill username with current value
    document.getElementById('email').value = Meteor.user().emails[0].address;  // Auto fill email with current value
    document.getElementById('firstName').value = userInformations.firstName;  // Auto fill first name with current value
    document.getElementById('lastName').value = userInformations.lastName;  // Auto fill last name with current value

    //Code to update file name from https://bulma.io/documentation/form/file/
    const fileInput = document.querySelector('input#profilePictureFile');  // Saving input in a variable
    fileInput.onchange = () => {
        if(fileInput.files.length > 0){
            // There's a file in the input
            const fileName = document.querySelector('span.file-name');  //Catching the file name display
            fileName.textContent = fileInput.files[0].name;  //Updating displayed value
        }
    }
});


Template.editProfile.events({
    'click button[type="submit"]' (event){
        event.preventDefault();
        var userInformationsID = UsersInformations.findOne({userId: Meteor.userId()})._id;
        var currentProfilePictureID = UsersInformations.findOne({userId: Meteor.userId()}).profilePictureID;
        // Catching the form element and saving inputs in variables
        const form = new FormData(document.getElementById('editProfileForm'));
        var files = document.querySelector('input#profilePictureFile').files;  // Catching profile picture files

        if(checkFileUpload(files=files, minLength=1, maxLength=1, type='image')){
            Images.insert(files[0], function (error, fileObj){
                if(!error){
                    // Image was successfully inserted, linking it with user's informations
                    UsersInformations.update(userInformationsID, { $set: {
                        profilePictureID: fileObj._id
                    }}, function(error, result){
                            if(!error){
                                // Image was successfully linked, we can now remove the old profile picture
                                Images.remove(currentProfilePictureID);
                            }
                        });
                }
            });
        }



        var username = form.get('username');
        var firstName = form.get('firstName');
        var lastName = form.get('lastName');
        var email = form.get('email');
        // Updating non-sensitive informations in our database
        UsersInformations.update(userInformationsID, { $set: {
            firstName: firstName,
            lastName: lastName,
        }});

        // Changing username with server method :
        Meteor.call('changeUsername', {newUsername: username}, function(error){
            if(error){
                Session.set('formErrorMessage', error.reason);  // Set the error message with given error value
            } else{
                // Username was changed successfully, updating value in our database
                UsersInformations.update(userInformationsID, { $set: {
                    username: username
                }});
                if(document.getElementById('advancedEdition').style.display == 'none'){
                    // Advanced edition is disabled, sending user to profile page
                    Session.set('message', {type: "header", headerContent: "Vos informations ont été modifiées avec succès !", style:"is-success"} );  // Display a success message
                    Session.set('userPage', '');
                } else{
                    var oldPassword = form.get('oldPassword');  // Saving inputs in variables
                    var newPassword = form.get('newPassword');  // Saving inputs in variables
                    var confirmNewPassword = form.get('confirmNewPassword');  // Saving inputs in variables
                    if(!(areValidPasswords(newPassword, confirmNewPassword))){
                        // Error in passwords fields
                        document.getElementById('newPassword').classList.add("is-danger");
                        document.getElementById('confirmNewPassword').classList.add("is-danger");
                    } else{
                        // No error
                        Accounts.changePassword(oldPassword, newPassword, function(error){  // Callback function which can raise an error
                            if(error){
                                Session.set('formErrorMessage', error.reason);  // Set the error message with given error value
                            } else{
                                Session.set('message', {type: "header", headerContent: "Vos informations ont été modifiées avec succès !", style:"is-success"} );  // Display a success message
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
