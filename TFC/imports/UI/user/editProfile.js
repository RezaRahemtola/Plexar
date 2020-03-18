// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { UsersInformations } from '../../bdd/usersInformations.js';
import { Images } from '../../bdd/images.js';

// HTML import
import './editProfile.html';

// Functions import
import '../functions/checkInputs.js';


Template.editProfile.onRendered(function(){  // When the template is rendered on the screen
    var userInformations = UsersInformations.findOne({userId: Meteor.userId()});
    document.getElementById('username').value = Meteor.user().username;  // Auto fill username with current value
    document.getElementById('email').value = Meteor.user().emails[0].address;  // Auto fill email with current value
    document.getElementById('firstName').value = userInformations.firstName;  // Auto fill first name with current value
    document.getElementById('lastName').value = userInformations.lastName;  // Auto fill last name with current value

    //Code to update file name from https://bulma.io/documentation/form/file/
    const fileInput = document.querySelector('input#profilePictureFile');  // Saving input in a variable
    fileInput.onchange = () => {
        const fileName = document.querySelector('span.file-name');  //Catching the file name display
        if(fileInput.files.length === 0){
            // No file uploaded
            fileName.textContent = "Aucun fichier sélectionné";
        } else if(fileInput.files.length === 1){
            // There's a file in the input
            fileName.textContent = fileInput.files[0].name;  //Updating displayed value
        }
    }
});


Template.editProfile.events({
    'click button[type="submit"]' (event){
        event.preventDefault();
        var userInformationsID = UsersInformations.findOne({userId: Meteor.userId()})._id;
        var currentProfilePictureID = UsersInformations.findOne({userId: Meteor.userId()}).profilePictureID;
        var formErrors = 0;  // No error for the moment
        var callbacksPending = 0;  // No callback is pending for the moment
        // Catching the form element and saving inputs in variables
        const form = new FormData(document.getElementById('editProfileForm'));

        // Updating non-sensitive informations in our database
        var firstName = form.get('firstName');  // Saving input in variable
        var lastName = form.get('lastName');  // Saving input in variable
        UsersInformations.update(userInformationsID, { $set: {
            firstName: firstName,
            lastName: lastName,
        }});

        // Username update
        var username = form.get('username');  // Saving input in variable
        if(Meteor.user().username !== username){
            // Changing username with server method :
            callbacksPending++;  // Starting a call with a callback function
            Meteor.call('changeUsername', {newUsername: username}, function(error){
                if(error){
                    // There was an error while changing the username
                    formErrors++;
                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Set the error message with given error value
                } else{
                    // Username was changed successfully, updating value in our database
                    UsersInformations.update(userInformationsID, { $set: {
                        username: username
                    }});
                }
                callbacksPending--;  // End of callback function
            });
        }

        if(document.getElementById('advancedEdition').style.display !== 'none'){
            // Advanced edition is enabled
            var oldPassword = form.get('oldPassword');  // Saving input in variable
            var newPassword = form.get('newPassword');  // Saving input in variable
            var confirmNewPassword = form.get('confirmNewPassword');  // Saving input in variable
            if(!(areValidPasswords(newPassword, confirmNewPassword, minLength=6, maxLength=100, forbiddenChars=[' ']))){
                // Error in passwords fields
                formErrors++;
                // Adding a red border to those fields
                document.getElementById('newPassword').classList.add("is-danger");
                document.getElementById('confirmNewPassword').classList.add("is-danger");
            } else{
                // No error
                callbacksPending++;  // Starting a call with a callback function
                Accounts.changePassword(oldPassword, newPassword, function(error){
                    if(error){
                        formErrors++;
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});  // Set the error message with given error reason
                    }
                    callbacksPending--;  // End of callback function
                });
            }
        }

        var files = document.querySelector('input#profilePictureFile').files;  // Catching profile picture file in file input
        if(files.length > 0){
            // There's an uploaded file, user wants to update it's profile picture
            if(checkFileInput(files=files, minLength=1, maxLength=1, type='image', maxMBSize=5)){
                callbacksPending++;  // Starting a call with a callback function
                Images.insert(files[0], function (error, fileObj){
                    if(!error){
                        // Image was successfully inserted, linking it with user's informations
                        callbacksPending++;  // Starting a call with a callback function
                        UsersInformations.update(userInformationsID, { $set: {
                            profilePictureID: fileObj._id
                        }}, function(error, result){
                                if(!error){
                                    // Image was successfully linked, we can now remove the old profile picture
                                    Images.remove(currentProfilePictureID);
                                } else{
                                    // There was an error while linking the image with user's informations
                                    formErrors++;
                                    Images.remove(fileObj._id);  // Removing the new picture
                                }
                                callbacksPending--;  // End of callback function
                            });
                    } else{
                        // There was an error while inserting the file in Images db
                        formErrors++;
                    }
                    callbacksPending--;  // End of callback function
                });
            } else{
                // File doesn't match all criteria
                formErrors++;
            }
        }

        // Waiting for all callbacks to complete (to see if an error is raised)
        var intervalID = setInterval(function(){
            if(callbacksPending === 0 && formErrors === 0){
                // All callbacks were completed without any error, displaying a success message
                Session.set('message', {type: "header", headerContent: "Votre profil a été modifié avec succès !", style:"is-success"} );
                Session.set('userPage', '');
                clearInterval(intervalID);  // This interval is not required anymore, removing it
            }
        }, 200);
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
