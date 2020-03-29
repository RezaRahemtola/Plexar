// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { UsersInformations } from '../../databases/usersInformations.js';
import { Images } from '../../databases/images.js';

// HTML import
import './editProfile.html';

// CSS import
import '../css/form.css';

// Functions import
import '../functions/checkInputs.js';


Template.editProfile.onRendered(function(){  // When the template is rendered on the screen

    // Auto filling fields
    var userInformations = UsersInformations.findOne({userID: Meteor.userId()});
    document.getElementById('username').value = Meteor.user().username;
    document.getElementById('email').value = Meteor.user().emails[0].address;
    document.getElementById('firstName').value = userInformations.firstName;
    document.getElementById('lastName').value = userInformations.lastName;
    document.getElementById('newsletter').checked = userInformations.newsletter;

    // Live username verification
    const usernameInput = document.querySelector('input#username');  // Saving input in a variable
    usernameInput.oninput = function(){
        // When value of the input change, call a server method
        Meteor.call('checkIfUsernameIsTaken', {username: usernameInput.value}, function(error, result){
            if(result){
                // Username already exist
                $('input#username').addClass("is-danger");
            } else{
                // Username doesn't exists
                $('input#username').removeClass("is-danger");
            }
        });
    }

    //Code to update file name from https://bulma.io/documentation/form/file/
    const fileInput = document.querySelector('input#profilePictureFile');  // Saving input in a variable
    fileInput.onchange = function(){
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
        const userInformationsID = UsersInformations.findOne({userID: Meteor.userId()})._id;
        var currentProfilePictureID = UsersInformations.findOne({userID: Meteor.userId()}).profilePictureID;
        var formErrors = 0;  // No error for the moment
        var callbacksPending = 0;  // No callback is pending for the moment
        // Catching the form element and saving inputs in variables
        const form = new FormData(document.getElementById('editProfileForm'));

        // Updating non-sensitive informations in our database
        var newsletterIsChecked = document.querySelector('input#newsletter').checked;
        var firstName = form.get('firstName');  // Saving input in variable
        var lastName = form.get('lastName');  // Saving input in variable
        UsersInformations.update(userInformationsID, { $set: {
            firstName: firstName,
            lastName: lastName,
            newsletter: newsletterIsChecked
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

        var oldPassword = form.get('oldPassword');  // Saving input in variable
        if(oldPassword.length > 0){
            console.log(oldPassword);
            var newPassword = form.get('newPassword');  // Saving input in variable
            var confirmNewPassword = form.get('confirmNewPassword');  // Saving input in variable
            if(!(checkPasswordsInput(newPassword, confirmNewPassword, minLength=6, maxLength=100, forbiddenChars=[' ']))){
                // Error in passwords fields
                formErrors++;
                $('input#newPassword, input#confirmNewPassword').addClass("is-danger");  // Adding a red border to those fields
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
                Session.set('page', 'home');
                clearInterval(intervalID);  // This interval is not required anymore, removing it
            }
        }, 200);
    }
});
