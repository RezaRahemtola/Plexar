// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

// Database imports
import { UsersInformations } from '../../bdd/usersInformations.js';
import { Favorites } from '../../bdd/favorites.js';

// HTML import
import './register.html';

// Form validation functions import
import './formValidation.js';


Template.register.onRendered(function(){
    Session.set('formErrorMessage', null);  // Reseting formErrorMessage
});


Template.register.helpers({
    formErrorMessage: function() {
        return Session.get('formErrorMessage');
  }
});


Template.register.events({
    'submit form'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('register'));
        var username = form.get('username');
        var email = form.get('email');
        var password = form.get('password');
        var confirmPassword = form.get('confirmPassword');

        if(!(areValidPasswords(password, confirmPassword))){
            // Error in passwords fields
            document.getElementById('password').classList.add("error");
            document.getElementById('confirmPassword').classList.add("error");
        } else{
            // Creating the new user
            Accounts.createUser({
                username: username,
                email: email,
                password: password
            }, function(error){
                    if(error){
                        Session.set('formErrorMessage', error.reason); // Output error if registration fails
                    } else{
                        // TODO: Define things to complete in UsersInformations (db collums order)
                        alert('Votre compte a bien été créé');

                        // Inserting informations in the database
                        UsersInformations.insert({
                            username: username,
                            email: email,
                            firstName: "",
                            lastName: ""
                        });

                        // Creating empty favorites of the new user
                        Favorites.insert({
                            user: Meteor.userId(),
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
