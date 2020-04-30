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

// Initializing Session variables
Session.set('currentProfilePicture', 'user.svg');

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

            Meteor.call('hasProfilePicture', function(error, result){
                if(error){
                    // There was an error
                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                } else if(result){
                    // The current user has a profile picture, imageId was returned
                    const profilePictureId = result;  // Catch the result
                    Session.set('currentProfilePicture', profilePictureId);
                } else{
                    // Current user doesn't have a profile picture, set it to the default one
                    Session.set('currentProfilePicture', 'user.svg');
                }
            });

            //Code to update file name from https://bulma.io/documentation/form/file/
            const fileInput = document.querySelector('input#profilePictureFile');  // Saving input in a variable
            fileInput.onchange = function(){
                if(fileInput.files.length > 0){
                    // There is at least one uploaded file, we transform them to pass it to the server (File object can't be pass)
                    var serverFiles = [];
                    for(file of fileInput.files){
                        serverFiles.push({size: file.size, type: file.type});
                    }

                    Meteor.call('checkProductCoverImageInput', {files: serverFiles}, function(error, result){
                        if(error){
                            // There is an error
                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                        } else{
                            // File input is correct
                            Meteor.call('getUserInformations', function(error, result){
                                if(error){
                                    // There is an error
                                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                                } else{
                                    // Catching profile picture
                                    const profilePicture = result.profilePicture;
                                    if(Session.get('currentProfilePicture') !== 'user.svg' && Session.get('currentProfilePicture') !== profilePicture){
                                        // Current picture was not the default and not the real profile picture, we can delete it
                                        const imageToRemove = Session.get('currentProfilePicture');
                                          // Reset temporarily the image, else the helper will search for the url of a removed image
                                        Session.set('currentProfilePicture', 'user.svg');
                                        Images.remove(Session.get('currentProfilePicture'));  // Remove the old image from the db
                                    }
                                    Images.insert(fileInput.files[0], function(error, fileObj){
                                        if(fileObj){
                                            Session.set('currentProfilePicture', fileObj._id);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    });
});


Template.informations.helpers({
    displayProfilePicture: function(){
        if(Session.get('currentProfilePicture') !== 'user.svg'){
            // Selected image isn't the default one, we can catch and return it's url
            const imageUrl = Images.findOne({_id: Session.get('currentProfilePicture')}).url();
            return imageUrl;
        } else{
            return 'user.svg';
        }

    }
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

                // Updating profile picture
                const selectedProfilePicture = Session.get('currentProfilePicture');  // Catching id of the wanted picture
                callbacksPending++;  // Starting a call with a callback function
                Meteor.call('getUserInformations', function(error, result){
                    if(error){
                        // There is an error
                        formErrors++;
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    } else{
                        // Catching profile picture
                        const profilePicture = result.profilePicture;
                        if(selectedProfilePicture !== 'user.svg' && selectedProfilePicture !== profilePicture){
                            // Selected picture isn't the default and isn't the current profile picture, we change the value
                            callbacksPending++;  // Starting a call with a callback function
                            Meteor.call('changeProfilePictureInUserInformations', {imageId: selectedProfilePicture}, function(error, result){
                                if(error){
                                    // There was an error
                                    formErrors++;
                                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});  // Set the error message with given error reason
                                } else{
                                    // Profile picture was successfully changed, calling the body helepr to refesh the display
                                    Template.body.__helpers.get('displayProfilePicture').call();
                                }
                                callbacksPending--;  // End of callback function
                            });
                        }
                        // TODO: sinon si l'user veut user.svg, faire un call pour delete la current profile picture
                    }
                    callbacksPending--;  // End of callback function
                });
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
