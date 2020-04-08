// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database imports
import { UsersInformations } from '../../databases/usersInformations.js';
import { Favorites } from '../../databases/favorites.js';

// HTML import
import './register.html';

// CSS import
import '../css/form.css';

// Functions import
import '../functions/checkInputs.js';


Template.register.onRendered(function(){

    // Live username verification
    const usernameInput = document.querySelector('input#username');  // Saving input in a variable
    usernameInput.oninput = function(){
        // When value of the input change, call a server method
        Meteor.call('checkIfUsernameIsTaken', {username: usernameInput.value}, function(error, result){
            if(result){
                // Username already exist
                $('input#username').addClass("is-danger");
                document.querySelector('#usernameField p.help.is-danger').textContent = "Ce nom d'utilisateur n'est pas disponible";  // Adding a danger help message
            } else{
                // Username doesn't exists
                $('input#username').removeClass("is-danger");
                document.querySelector('#usernameField p.help.is-danger').textContent = "";  // Removing danger help message
            }
        });
    }

    // Live email validation
    const emailInput = document.querySelector('input#email');
    emailInput.onchange = function(){
        if(checkEmailInput(emailInput.value)){
            // Value looks like a valid email adress, checking if it's already taken
            Meteor.call('checkIfEmailIsTaken', {email: emailInput.value}, function(error, result){
                if(result){
                    // Email is already used by someone
                    $('input#email').addClass("is-danger");
                    document.querySelector('#emailField p.help.is-danger').textContent = "Cette adresse email est déjà utilisée par un autre compte";  // Adding a danger help message
                } else{
                    // Email isn't in our database
                    $('input#email').removeClass("is-danger");
                    document.querySelector('#emailField p.help.is-danger').textContent = "";  // Removing danger help message
                }
            });
        } else{
            // Value isn't a valid email adress
            $('input#email').addClass("is-danger");
            document.querySelector('#emailField p.help.is-danger').textContent = "Veuillez entrer une adresse email valide";  // Adding a danger help message
        }
    }
});


Template.register.helpers({ 
    messageToDisplay: function(){
        var message = Session.get('message');
        if(message !== null){
            // There is a message to display
            return message.type;  // Return the message to display
        }
    }
});


Template.register.events({
    'click #registerSubmit'(event){
        event.preventDefault();
        $(event.target).addClass("is-loading");  // Add a loading effect to the button
        var form = new FormData(document.getElementById('registerForm'));
        const username = form.get('username');
        const email = form.get('email');
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if(!(checkPasswordsInput(password, confirmPassword, minLength=6, maxLength=100, forbiddenChars=[' ']))){
            // Error in passwords fields
            $('#password, #confirmPassword').addClass("is-danger");
            $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
        } else{
            var newsletter = $('input[name="newsletter"]').is(':checked');
            // Creating the new user
            Accounts.createUser({
                username: username,
                email: email,
                password: password
            }, function(error){
                    if(error){
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"}); // Output error if registration fails
                        $(event.target).removeClass("is-loading");  // Remove the loading effect of the button
                    } else{
                        var newsletterIsChecked = document.getElementById('newsletter').checked;
                        // Inserting informations in the database
                        UsersInformations.insert({
                            userID: Meteor.userId(),
                            username: username,
                            email: email,
                            firstName: "",
                            lastName: "",
                            profilePictureID: null,
                            upvotes: [],
                            downvotes: [],
                            newsletter: newsletterIsChecked
                        });
                        // Creating empty favorites of the new user
                        Favorites.insert({
                            userId: Meteor.userId(),
                            products: []
                        });
                        Session.set('message', {type:"header", headerContent:"Votre compte a bien été créé", style:"is-success"});  // Display a success message
                        Session.set('modal', null);  // Remove the modal
                    }

                }
            );
        }
    }
});
