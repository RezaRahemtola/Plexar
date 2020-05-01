// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

// Importing databases
import { Rules } from '../rules.js';
import { UsersInformations } from '../../imports/databases/usersInformations.js';
import { Favorites } from '../../imports/databases/favorites.js';
import { Contributions } from '../../imports/databases/contributions.js';
import { Moderation } from '../../imports/databases/moderation.js';
import { Products } from '../../imports/databases/products.js';
import { Images } from '../../imports/databases/images.js';


Meteor.methods({
    'hasProfilePicture'(){
        if(Meteor.userId() && UsersInformations.findOne({userId: Meteor.userId()}) && UsersInformations.findOne({userId: Meteor.userId()}).profilePicture !== null){
            // User is logged in and has a profile picture, return the profile picture id
            return UsersInformations.findOne({userId: Meteor.userId()}).profilePicture;
        } else{
            // No profile picture
            return false;
        }
    },
    'changeUsername'({newUsername}){
        // Type check to prevent malicious calls
        check(newUsername, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            Accounts.setUsername(Meteor.userId(), newUsername);
        }
    },
    'checkIfUsernameIsTaken'({username}){
        // Type check to prevent malicious calls
        check(username, String);

        if(Meteor.user()){
            // If user is logged in, check if username exists and if it's different than current user's
            return (Meteor.users.findOne({username: username}) && username !== Meteor.user().username) ? true : false;
        } else{
            // Only check if username exists
            return (Meteor.users.findOne({username: username})) ? true : false;
        }
    },
    'checkIfEmailIsTaken'({email}){
        // Type check to prevent malicious calls
        check(email, String);

        return (Accounts.findUserByEmail(email)) ? true : false;
    },
    'sendVerificationEmail'(){
        Accounts.sendVerificationEmail(Meteor.userId());
    },
    'createNewUser'({username, email, newsletterIsChecked}){
        // Type check to prevent malicious calls
        check(username, String);
        check(email, String);
        check(newsletterIsChecked, Boolean);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // Inserting informations in the database
            UsersInformations.insert({
                userId: Meteor.userId(),
                username: username,
                email: email,
                firstName: "",
                lastName: "",
                profilePicture: null,
                votes: {},
                newsletter: newsletterIsChecked
            });
            // Creating empty favorites of the new user
            Favorites.insert({
                userId: Meteor.userId(),
                products: []
            });
            // User was successfully created
            return true;
        }
    },
    'displayContributions'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            var contributionsCursor = Contributions.find({userId: Meteor.userId()}, {sort: { createdAt: -1 }});  // Return user's contributions sorted by date (most recent first)
            var userContributions = [];  // Creating an array to push the formatted contributions
            contributionsCursor.forEach(function(doc){
                console.log(doc)
                // Browsing the documents
                var createdAtFormatted = new Date(doc.createdAt);  // Converting the creation date to a classic format
                var year = createdAtFormatted.getFullYear();  // Catching the year
                var month = createdAtFormatted.getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                var date = createdAtFormatted.getDate();  // Catching the date
                if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                if(month < 10){ month = '0' + month; }
                createdAtFormatted = date+ '/' +month+ '/' +year;  // Updating the document with the new creation date
                const elementName = Products.findOne({_id: doc.elementId}).name;
                // Catching the moderation status
                if(doc.status === 'pending'){
                    // Contribution is under moderation, setting the corresponding status
                    var status = 'En attente de validation';
                    var statusStyle = 'is-warning';
                } else if(doc.status === 'accepted'){
                    // The contribution has been accepted, setting the corresponding status
                    var status = 'Validée';
                    var statusStyle = 'is-success';
                } else if(doc.status === 'rejected'){
                    // The contribution has been rejected, setting the corresponding status
                    var status = 'Rejetée';
                    var statusStyle = 'is-danger';
                }
                // Pushing the new document to the array
               userContributions.push({type: doc.type,
                                       date: createdAtFormatted,
                                       elementId: doc.elementId,
                                       elementName: elementName,
                                       status: status,
                                       statusStyle: statusStyle,
                                       points: doc.points
               });
            });
            return userContributions;
        }
    },
    'displayFavoriteProducts'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            var favoriteProductsId = Favorites.findOne({userId: Meteor.userId()}).products;  // Return an array with IDs of the products database
            const favoriteId = Favorites.findOne({userId: Meteor.userId()})._id;  // Getting line ID (needed to modify data)
            var favoriteProducts = [];  // Creating an empty array of the products
            for(var productId of favoriteProductsId){
                // Filling the array with the products
                if(Products.findOne({_id : productId}) === undefined){
                    // This product is in favorites but doesn't exist in the products db (maybe deleted), we remove it from favorites
                    favoriteProductsId.pop(productId);  // Removing the product from the array
                    // Updating the database with the modified array
                    Favorites.update(favoriteId, { $set: { products: favoriteProductsId } } );
                } else{
                    // Product exists, adding it to the array
                    favoriteProducts.push(Products.findOne({_id : productId}));
                }
            }
            return favoriteProducts;  // Returning the array of products to display
        }
    },
    'getUserInformations'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            return UsersInformations.findOne({userId: Meteor.userId()});
        }
    },
    'changeUserInformations'({firstName, lastName, newsletter, username}){
        // Type check to prevent malicious calls
        check(firstName, String);
        check(lastName, String);
        check(newsletter, Boolean);
        check(username, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // Catching current user's informations
            const userInformations = UsersInformations.findOne({userId: Meteor.userId()});
            var callbacksPending = 0;  // No callback is pending for the moment

            // Updating non-sensitive informations in our database
            UsersInformations.update(userInformations._id, { $set: {
                firstName: firstName,
                lastName: lastName,
                newsletter: newsletter
            }});

            // Checking if username is different to update it
            if(Meteor.user().username !== username){
                // Username is different than the current one, changing it
                callbacksPending++;  // Starting a call with a callback function
                Meteor.call('changeUsername', {newUsername: username}, function(error, result){
                    if(error){
                        // There was an error while changing the username
                        console.log(error);
                        throw new Meteor.Error(error.error, error.reason);
                    } else{
                        // Username was changed successfully, updating value in our database
                        UsersInformations.update(userInformations._id, { $set: { username: username } } );
                    }
                    callbacksPending--;  // End of callback function
                });
            }

            return true;
        }
    },
    'changeProfilePictureInUserInformations'({imageId}){
        // Type check to prevent malicious calls
        check(imageId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // Catching current user's informations
            const userInformations = UsersInformations.findOne({userId: Meteor.userId()});
            const currentProfilePicture = userInformations.profilePicture;
            UsersInformations.update(userInformations._id, { $set: { profilePicture: imageId }}, function(error, result){
                    if(error){
                        // There was an error while linking the image with user's informations
                        Images.remove(imageId);  // Removing the new picture
                        throw new Meteor.Error('linkingProfilePictureWithUserInfoFailed', "Le changement de l'image de profil a échoué, veuillez réessayer.");
                    } else{
                        // Image was successfully linked, we can now remove the old profile picture
                        Images.remove(currentProfilePicture);
                    }
                });
        }
    }
});
