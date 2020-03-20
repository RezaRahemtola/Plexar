// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database imports
import { UsersInformations } from '../../bdd/usersInformations.js';
import { Favorites } from '../../bdd/favorites.js';

// HTML import
import './register.html';

// Functions import
import '../functions/checkInputs.js';


Template.register.onRendered(function(){

    // Live username verification
    const usernameInput = document.querySelector('input#username');  // Saving input in a variable
    usernameInput.oninput = () => {
        // When value of the input change, call a server method
        Meteor.call('checkIfUsernameIsTaken', {username: usernameInput.value}, function(error, result){
            if(result){
                // Username already exist
                document.querySelector('input#username').classList.remove("is-success");
                document.querySelector('input#username').classList.add("is-danger");
            } else{
                // Username doesn't exists
                document.querySelector('input#username').classList.remove("is-danger");
                document.querySelector('input#username').classList.add("is-success");
            }
        });
    }
});


Template.register.events({
    'click #submitForm'(event){
        event.preventDefault();
        event.target.classList.add("is-loading");  // Add a loading effect to the button
        var form = new FormData(document.getElementById('register'));
        var username = form.get('username');
        var email = form.get('email');
        var password = form.get('password');
        var confirmPassword = form.get('confirmPassword');

        if(!(areValidPasswords(password, confirmPassword, minLength=6, maxLength=100, forbiddenChars=[' ']))){
            // Error in passwords fields
            document.getElementById('password').classList.add("is-danger");
            document.getElementById('confirmPassword').classList.add("is-danger");
            event.target.classList.remove("is-loading");  // Remove the loading effect of the button
        } else{
            // Creating the new user
            Accounts.createUser({
                username: username,
                email: email,
                password: password
            }, function(error){
                    if(error){
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"}); // Output error if registration fails
                        event.target.classList.remove("is-loading");  // Remove the loading effect of the button
                    } else{
                        Session.set('message', {type:"header", headerContent:"Votre compte a bien été créé", style:"is-success"});
                        // Inserting informations in the database
                        UsersInformations.insert({
                            userID: Meteor.userId(),
                            username: username,
                            email: email,
                            firstName: "",
                            lastName: "",
                            profilePictureID: null,
                            upvotes: [],
                            downvotes: []
                        });
                        // Creating empty favorites of the new user
                        Favorites.insert({
                            userId: Meteor.userId(),
                            products: [],
                            shops: []
                        });
                        Session.set('userPage', '');  // Send the new user to default userprofile page
                    }

                }
            );
        }
    }
});
