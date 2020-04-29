// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database import
import { Images } from '../../databases/images.js';

// HTML import
import './informations.html';

// CSS import
import '../css/form.css';


Template.informations.onRendered(function(){  // When the template is rendered on the screen

    Meteor.call('getUserInformations', function(error, result){
        if(error){
            // There was an error
            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
        } else{
            // Catching the result to auto fill fields
            const userInformations = result;
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
        }
    });
});


Template.informations.events({
    'click button[type="submit"]'(event){
        event.preventDefault();
        var formErrors = 0;  // No error for the moment
        var callbacksPending = 0;  // No callback is pending for the moment

        // Catching the form element and saving inputs in variables
        const form = new FormData(document.getElementById('editProfileForm'));
        const firstName = form.get('firstName');
        const lastName = form.get('lastName');
        const newsletter = document.querySelector('input#newsletter').checked;
        const username = form.get('username');

        callbacksPending++;  // Starting a call with a callback function
        Meteor.call('changeUserInformations', {firstName: firstName, lastName: lastName, newsletter: newsletter, username: username}, function(error, result){
            if(error){
                // There was an error
                formErrors++;
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Name, newsletter and username updated successfully

                // Catching password fields
                const oldPassword = form.get('oldPassword');
                const newPassword = form.get('newPassword');
                const confirmNewPassword = form.get('confirmNewPassword');
                // Checking if user has filled change password fields
                if(oldPassword.length > 0 && newPassword.length > 0 && confirmNewPassword.length > 0){
                    // Password fields were filled
                    callbacksPending++;  // Starting a call with a callback function
                    Meteor.call('checkPasswordsInput', {password: newPassword, confirmPassword: confirmNewPassword}, function(error, result){
                        if(error){
                            // There is an error in password fields
                            formErrors++;
                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                            $('input#newPassword, input#confirmNewPassword').addClass("is-danger");  // Adding a red border to those fields
                        } else{
                            // New passwords match all criteria, changing the current password to the new one
                            callbacksPending++;  // Starting a call with a callback function
                            Accounts.changePassword(oldPassword, newPassword, function(error){
                                if(error){
                                    // There was an error while changing the password
                                    formErrors++;
                                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});  // Set the error message with given error reason
                                }
                                callbacksPending--;  // End of callback function
                            });
                        }
                        callbacksPending--;  // End of callback function
                    });
                }

                // Catching profile picture file in file input
                const files = document.querySelector('input#profilePictureFile').files;
                if(files.length > 0){
                    // There is at least one uploaded file, user wants to update it's profile picture, transform it to pass it to the server (File object can't be pass)
                    var serverFiles = [];
                    for(file of files){
                        // Create a new object with informations that server needs for verification
                        serverFiles.push({size: file.size, type: file.type});
                    }
                    callbacksPending++;  // Starting a call with a callback function
                    Meteor.call('checkProfilePictureInput', {files: serverFiles}, function(error, result){
                        if(error){
                            // There is an error
                            formErrors++;  // File doesn't match all criteria
                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                        } else{
                            // File input is correct, inserting it to the db
                            callbacksPending++;  // Starting a call with a callback function
                            Images.insert(files[0], function(error, fileObj){
                                if(error){
                                    // There was an error while inserting the file in Images db
                                    formErrors++;
                                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});  // Set the error message with given error reason
                                } else{
                                    // Image was successfully inserted, linking it with user's informations
                                    callbacksPending++;  // Starting a call with a callback function
                                    Meteor.call('changeProfilePictureInUserInformations', {imageId: fileObj._id}, function(error, result){
                                        if(error){
                                            // There was an error
                                            formErrors++;
                                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});  // Set the error message with given error reason
                                        }
                                        callbacksPending--;  // End of callback function
                                    });
                                }
                                callbacksPending--;  // End of callback function
                            });
                        }
                        callbacksPending--;  // End of callback function
                    });
                }
            }
            callbacksPending--;  // End of callback function
        });


        // Waiting for all callbacks to complete (to see if an error is raised)
        var intervalId = setInterval(function(){
            if(callbacksPending === 0 && formErrors === 0){
                // All callbacks were completed without any error, displaying a success message
                Session.set('message', {type: "header", headerContent: "Votre profil a été modifié avec succès !", style:"is-success"} );
                Session.set('page', 'home');
                clearInterval(intervalId);  // This interval is not required anymore, removing it
            }
        }, 200);
    }
});
