// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Database import
import { Images } from '../../databases/images.js';

// HTML import
import './informations.html';


FlowRouter.route('/user/informations', {
    name: 'userInformations',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'userProfile', currentUserPage: 'informations'});
    }
});


Template.informations.onRendered(function(){

    $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
    $("li#informations").addClass("is-active");  // Set the current tab as the active one

    // Initializing Session variable
    Session.set('currentProfilePicture', Session.get('defaultProfilePicture'));

    Meteor.call('getUserInformations', function(error, userInformations){
        if(error){
            // There was an error while catching user's informations
            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
        } else{
            // Filling the fields
            document.getElementById('username').value = Meteor.user().username;
            document.getElementById('email').value = Meteor.user().emails[0].address;
            document.getElementById('firstName').value = userInformations.firstName;
            document.getElementById('lastName').value = userInformations.lastName;
            document.getElementById('newsletter').checked = userInformations.newsletter;

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
                    Session.set('currentProfilePicture', Session.get('defaultProfilePicture'));
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

                    Meteor.call('checkProfilePictureInput', {files: serverFiles}, function(error, result){
                        if(error){
                            // There was an error
                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                        } else{
                            // File input is correct
                            Meteor.call('getUserInformations', function(error, result){
                                if(error){
                                    // There was an error
                                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                                } else{
                                    // Catching profile picture
                                    const profilePicture = result.profilePicture;
                                    if(Session.get('currentProfilePicture') !== Session.get('defaultProfilePicture') && Session.get('currentProfilePicture') !== profilePicture){
                                        // Current picture was not the default and not the real profile picture, we can delete it
                                        const imageToRemove = Session.get('currentProfilePicture');
                                        // Reset temporarily the image, else the helper will search for the url of a removed image
                                        Session.set('currentProfilePicture', Session.get('defaultProfilePicture'));
                                        Meteor.call('removeImage', {imageId: imageToRemove}, function(error, result){
                                            if(error){
                                                // There was an error
                                                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                                            }
                                        });
                                    }

                                    const upload = Images.insert({
                                        file: fileInput.files[0],
                                        streams: 'dynamic',
                                        chunkSize: 'dynamic'
                                    });
                                    upload.on('end', function(error, fileObj){
                                        if(error){
                                            // There was an error while inserting the image
                                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                                        } else if(fileObj){
                                            // Image was successfully inserted
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
        if(Session.get('currentProfilePicture') !== undefined && Session.get('currentProfilePicture') !== Session.get('defaultProfilePicture')){
            // Selected image is set and isn't the default one, checking if it's still in the database
            if(Images.findOne({_id: Session.get('currentProfilePicture')})){
                // Image is still in the database, we can catch and return it's url
                return Images.findOne({_id: Session.get('currentProfilePicture')}).link();
            }
        } else{
            // Selected image is the default one, returning it
            return Session.get('currentProfilePicture');
        }
    }
});


Template.informations.events({
    'click button[type="submit"]'(event){
        event.preventDefault();

        // Catching the form element and saving inputs in variables
        const form = new FormData(document.getElementById('editProfileForm'));
        const firstName = form.get('firstName');
        const lastName = form.get('lastName');
        const newsletter = document.querySelector('input#newsletter').checked;
        const username = form.get('username');

        // Password & profile picture weren't updated yet
        var passwordCompleted = false;
        var profilePictureCompleted = false;

        Meteor.call('changeUserInformations', {firstName: firstName, lastName: lastName, newsletter: newsletter, username: username}, function(error, result){
            if(error){
                // There was an error
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
                    Meteor.call('checkPasswordsInput', {password: newPassword, confirmPassword: confirmNewPassword}, function(error, result){
                        if(error){
                            // There is an error in password fields
                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                        } else{
                            // New passwords match all criteria, changing the current password to the new one
                            Accounts.changePassword(oldPassword, newPassword, function(error){
                                if(error){
                                    // There was an error while changing the password
                                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});  // Set the error message with given error reason
                                } else{
                                    // Password changed successfully
                                    passwordCompleted = true;
                                }
                            });
                        }
                    });
                } else{
                    // Password fields weren't filled, we're done with it
                    passwordCompleted = true;
                }

                // Updating profile picture
                const selectedProfilePicture = Session.get('currentProfilePicture');  // Catching id of the wanted picture
                Meteor.call('getUserInformations', function(error, result){
                    if(error){
                        // There was an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    } else{
                        // Catching profile picture
                        const profilePicture = result.profilePicture;
                        if(selectedProfilePicture !== Session.get('defaultProfilePicture') && selectedProfilePicture !== profilePicture){
                            // Selected picture isn't the default and isn't the current profile picture, we change the value
                            Meteor.call('changeProfilePictureInUserInformations', {imageId: selectedProfilePicture}, function(error, result){
                                if(error){
                                    // There was an error
                                    formErrors++;
                                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"});  // Set the error message with given error reason
                                } else{
                                    // Profile picture was successfully changed, calling the body helepr to refesh the display
                                    Template.main.__helpers.get('displayProfilePicture').call();
                                    profilePictureCompleted = true;
                                }
                            });
                        } else{
                            // We don't need to update the profile picture
                            profilePictureCompleted = true;
                        }
                    }
                });
            }
        });


        // Waiting for all concurrent callbacks to complete
        const intervalId = setInterval(function(){
            if(passwordCompleted && profilePictureCompleted){
                // All callbacks were completed without any error, displaying a success message and sending the user to home page
                Session.set('message', {type: "header", headerContent: "Votre profil a été modifié avec succès !", style:"is-success"} );
                FlowRouter.go('/');
                clearInterval(intervalId);  // This interval is not required anymore, removing it
            }
        }, 200);
    }
});


Template.informations.onDestroyed(function(){
    // Checking if there's unused images to remove them

    Meteor.call('hasProfilePicture', function(error, result){
        if(error){
            // There was an error
            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
        } else if(result){
            // The current user has a profile picture, imageId was returned
            const profilePictureId = result  // Saving the result
            const displayedProfilePictureId = Session.get('currentProfilePicture');  // Catching the displayed profile picture

            if(displayedProfilePictureId !== profilePictureId){
                // The profile picture displayed in the form isn't the one in the database, we can safely delete it
                Meteor.call('removeImage', {imageId: displayedProfilePictureId}, function(error, result){
                    if(error){
                        // There was an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    }
                });
            }
        } else{
            // Current user doesn't have a profile picture
            const displayedProfilePictureId = Session.get('currentProfilePicture');  // Catching the displayed profile picture

            if(displayedProfilePictureId !== Session.get('defaultProfilePicture')){
                // Their is a picture uploaded in the form, we can delete it
                Meteor.call('removeImage', {imageId: displayedProfilePictureId}, function(error, result){
                    if(error){
                        // There was an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    }
                });
            }
        }
    });
});
