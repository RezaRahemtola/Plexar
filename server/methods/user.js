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
import { CollectiveModeration } from '../../imports/databases/collectiveModeration.js';


Meteor.methods({
    'getDefaultProfilePictureUrl'(){
        return Rules.user.profilePicture.defaultUrl;
    },
    'deleteUnverifiedUsers'(){
        var deletedUsers = 0;  // We haven't delete any user for the moment
        const currentTime = new Date();  // Catching the current time

        // Catching all the users with unverified email address
        Meteor.users.find({"emails.verified": false}).forEach(function(user){
            // For each user, checking if the account was created more than 30 days ago
            const timeElapsed = currentTime - user.createdAt;
            // The result is in milliseconds, converting it in days
            const daysElapsed = timeElapsed / 1000 / 60 / 60 / 24;
            if(daysElapsed >= 30){
                // Account was created more than a month ago without email verification, deleting the account
                UsersInformations.remove({userId: user._id});
                Favorites.remove({userId: user._id});
                CollectiveModeration.remove({userId: user._id});
                Meteor.users.remove({userId: user._id});
                // Incrementing the number of deleted users
                deletedUsers++;
            }
        });

        // Returning the number of deleted users
        return deletedUsers;
    },
    'userIsAdmin'(){
        // Checking if user is admin :
        if(!Meteor.userId()){
            // User isn't logged in, so he's not admin
            return false;
        } else{
            // Catching user email address :
            const userEmail = Meteor.user().emails[0].address;
            // Return true if the user is in the admin list, else return false
            return Meteor.settings.admin.list.includes(userEmail);
        }
    },
    'hasProfilePicture'(){
        if(Meteor.userId() && UsersInformations.findOne({userId: Meteor.userId()}) && UsersInformations.findOne({userId: Meteor.userId()}).profilePicture !== null){
            // User is logged in and has a profile picture, return the profile picture id
            return UsersInformations.findOne({userId: Meteor.userId()}).profilePicture;
        }
        // User isn't logged in or doesn't have a profile picture
        return false;
    },
    'updateAndGetUserPoints'(){
        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, initializing points
            var userPoints = 0;
            // Catching user's accepted contributions
            Contributions.find({userId: Meteor.userId(), status: 'accepted'}).forEach(function(contribution){
                // For each accepted contribution, we add the corresponding points
                userPoints += contribution.points;
            });

            // Now we catch daily votes in collective moderation
            const userDailyVotes = CollectiveModeration.findOne({userId: Meteor.userId()}).dailyVotes;

            for(dailyVotes of Object.values(userDailyVotes)){
                // For each day we add the number of votes this day multiplied by the number of points it should give
                userPoints += dailyVotes * Rules.points.collectiveModerationVote;
            }

            // Updating the points in the database
            UsersInformations.update({userId: Meteor.userId()}, { $set: { points: userPoints } }, function(error, result){
                if(error){
                    // There was an error while updating the points
                    throw new Meteor.Error('pointsUpdateError', "Une erreur est survenue lors de la mise à jour de vos points, veuillez réessayer.")
                }
            });

            // Sending the result to the client
            return userPoints;
        }
    },
    'getPointsLeftUntilNextLevel'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, catching his points and his level to find the next level
            const userLevelName = UsersInformations.findOne({userId: Meteor.userId()}).level;
            const userPoints = UsersInformations.findOne({userId: Meteor.userId()}).points;

            // Catching index of the current level
            const index = Rules.levels.findIndex(function(level){
                return level.name === userLevelName;
            });

            // The points left until next level correspond to the points needed for next level (that's why we add 1) less current points
            return Rules.levels[index+1].pointsNeeded - userPoints;
        }
    },
    'getLevelProgressInformations'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, catching his level and his points
            const userLevelName = UsersInformations.findOne({userId: Meteor.userId()}).level;
            const userPoints = UsersInformations.findOne({userId: Meteor.userId()}).points;

            // Catching index of the current level
            const index = Rules.levels.findIndex(function(level){
                return level.name === userLevelName;
            });
            const userLevel = Rules.levels[index];

            // The maximum of the progress corresponds to the points needed of the next level (that's why we add 1) less the same property of the current level
            const progressMaximum = Rules.levels[index+1].pointsNeeded - userLevel.pointsNeeded;
            // The value of the progress is the user's points less the points needed of the current level
            const progressValue = userPoints - userLevel.pointsNeeded;

            // Returning it to the client in an object
            return {progressMaximum: progressMaximum, progressValue: progressValue};
        }
    },
    'getUserLevel'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // Catching user's informations to calculate the level based on the points
            const userInformations = UsersInformations.findOne({userId: Meteor.userId()});
            var currentLevel = userInformations.level;
            // Catching the possibles levels
            for(var level of Rules.levels){
                // For each existing level, checking if the user has enough points to reach it
                if(userInformations.points >= level.pointsNeeded){
                    // User has enough points for this level, updating current level
                    currentLevel = level.name;
                } else{
                    // We've reached the level available for the user, ending the loop
                    break;
                }
            }

            // Updating the level in the database
            UsersInformations.update({userId: Meteor.userId()}, { $set: { level: currentLevel } }, function(error, result){
                if(error){
                    // There was an error wgile updating the level
                    throw new Meteor.Error('levelUpdateError', "Une erreur est survenue lors de la mise à jour de votre niveau, veuillez réessayer.")
                }
            });
            return currentLevel;
        }
    },
    'getLevelIcon'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // Catching user's level to find the corresponding image in the rules
            const userLevel = UsersInformations.findOne({userId: Meteor.userId()}).level;
            // Catching the possibles levels
            const levels = Rules.levels;
            for(var level of levels){
                // For each existing level, checking if it's the user's one
                if(userLevel === level.name){
                    // This is the current level of the user, returning the corresponding icon
                    return level.icon;
                }
            }
        }
    },
    'getBestContributors'(){

        var bestContributors = [];  // Creating an array in which we'll add informations we need to return
        // Returning 10 users sorted by points in descending order
        UsersInformations.find({}, {sort: { points: -1 }, limit: 10}).forEach(function(contributor, index){
            // Catching user's profile picture (default one or one in the images database)
            const profilePicture = (contributor.profilePicture === null) ? Rules.user.profilePicture.defaultUrl : Images.findOne({_id: contributor.profilePicture}).link();

            bestContributors.push({
                username: contributor.username,
                points: contributor.points,
                profilePicture: profilePicture,
                rank: index+1  // Index starts at 0, so we need to add 1 to have a correct rank
            });
        });

        return bestContributors;
    },
    'getUserRank'(){

        if(!Meteor.userId()){
            // User isn't logged in, so he doesn't have a rank
            return 0;
        } else{
            // User is logged in, catching the contributors sorted by points in descending order
            const contributors = UsersInformations.find({}, {sort: { points: -1 }});
            var userRank = 1;
            for(var contributor of contributors){
                if(contributor.userId !== Meteor.userId()){
                    // This contributor isn't the current user, incrementing the rank
                    userRank++;
                } else{
                    // This contributor is the current user, returning the rank
                    return userRank;
                }
            }
        }
    },
    'changeUsername'({newUsername}){
        // Type check to prevent malicious calls
        check(newUsername, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, we can change his username
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
        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, checking if his email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // Email isn't verified, sending the verification email
                Accounts.sendVerificationEmail(Meteor.userId());
            } else{
                // Email is verified, throwing an error
                throw new Meteor.Error('emailAlreadyVerified', 'Votre adresse email est déjà validée.');
            }
        }
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
                dailyContributions: {},
                newsletter: newsletterIsChecked,
                points: 0,
                level: "1"
            });

            // Creating empty favorites of the new user
            Favorites.insert({
                userId: Meteor.userId(),
                products: []
            });

            // Creating empty participations to collective moderation
            CollectiveModeration.insert({
                userId: Meteor.userId(),
                alreadyVoted: [],
                dailyVotes: {}
            });
            // User was successfully created, calling the method to delete old & unverified users
            Meteor.call('deleteUnverifiedUsers');

            return true;
        }
    },
    'displayContributions'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, creating an array to push the formatted contributions
            var userContributions = [];
            // Return user's contributions sorted by date (most recent first)
            Contributions.find({userId: Meteor.userId()}, {sort: { createdAt: -1 }}).forEach(function(doc){
                // Browsing the documents
                var createdAtFormatted = new Date(doc.createdAt);  // Converting the creation date to a classic format
                var year = createdAtFormatted.getFullYear();  // Catching the year
                var month = createdAtFormatted.getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                var date = createdAtFormatted.getDate();  // Catching the date
                if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                if(month < 10){ month = '0' + month; }
                createdAtFormatted = date+ '/' +month+ '/' +year;  // Updating the document with the new creation date

                if(Products.findOne({_id: doc.elementId})){
                    // Product exists
                    var elementName = Products.findOne({_id: doc.elementId}).name;
                } else{
                    // Product doesn't exist anymore
                    var elementName = "Produit supprimé";
                }

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
            // User is logged in, catching favorites informations
            var favoriteProductsId = Favorites.findOne({userId: Meteor.userId()}).products;  // Return an array with IDs of the products database
            var favoriteProducts = [];  // Creating an empty array of the products
            for(var productId of favoriteProductsId){
                // Filling the array with the products
                if(Products.findOne({_id : productId}) === undefined){
                    // This product is in favorites but doesn't exist in the products db (maybe deleted), we remove it from favorites
                    favoriteProductsId.pop(productId);  // Removing the product from the array
                    // Updating the database with the modified array
                    Favorites.update({userId: Meteor.userId()}, { $set: { products: favoriteProductsId } } );
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
            // User is logged in, returning his informations
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
            // User is logged in, updating non-sensitive informations in our database
            UsersInformations.update({userId: Meteor.userId()}, { $set: {
                firstName: firstName,
                lastName: lastName,
                newsletter: newsletter
            }});

            // Checking if username is different to update it
            if(Meteor.user().username !== username){
                // Username is different than the current one, changing it
                Meteor.call('changeUsername', {newUsername: username}, function(error, result){
                    if(error){
                        // There was an error while changing the username
                        throw new Meteor.Error(error.error, error.reason);
                    } else{
                        // Username was changed successfully, updating value in our database
                        UsersInformations.update({userId: Meteor.userId()}, { $set: { username: username } } );
                    }
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
            // Catching current user's profile picture
            const currentProfilePicture = UsersInformations.findOne({userId: Meteor.userId()}).profilePicture;
            // Updating the database
            UsersInformations.update({userId: Meteor.userId()}, { $set: { profilePicture: imageId }},
                function(error, result){
                    if(error){
                        // There was an error while linking the image with user's informations
                        Images.remove({_id: imageId});  // Removing the new picture
                        throw new Meteor.Error('linkingProfilePictureWithUserInfoFailed', "Le changement de l'image de profil a échoué, veuillez réessayer.");
                    } else{
                        // Image was successfully linked, we can now remove the old profile picture
                        Images.remove({_id: currentProfilePicture});
                    }
                }
            );
        }
    }
});
