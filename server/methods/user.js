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
    'userIsAdmin'(){
        // Checking if user is admin :
        if(!Meteor.userId()){
            // User isn't logged in, so he's not admin
            return false;
        } else{
            // Catching user email address :
            const userEmail = Meteor.user().emails[0].address;
            if(!Meteor.settings.admin.list.includes(userEmail)){
                // User isn't in the admin list
                return false;
            } else{
                // User is in the admin list
                return true;
            }
        }
    },
    'hasProfilePicture'(){
        if(Meteor.userId() && UsersInformations.findOne({userId: Meteor.userId()}) && UsersInformations.findOne({userId: Meteor.userId()}).profilePicture !== null){
            // User is logged in and has a profile picture, return the profile picture id
            return UsersInformations.findOne({userId: Meteor.userId()}).profilePicture;
        } else{
            // No profile picture
            return false;
        }
    },
    'getUserPoints'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // Catching user's accepted contributions
            const acceptedUserContributions = Contributions.find({userId: Meteor.userId(), status: 'accepted'});
            // Initializing points
            var userPoints = 0;

            for(var contribution of acceptedUserContributions){
                // For each accepted contribution, we add the corresponding points
                userPoints += contribution.points;
            }

            // Now we catch daily votes in collective moderation and the points it should give
            const userDailyVotes = CollectiveModeration.findOne({userId: Meteor.userId()}).dailyVotes;
            const collectiveModerationPoints = Rules.points.collectiveModerationVote;

            for(dailyVotes of Object.values(userDailyVotes)){
                // For each day we add the number of votes this day multiplied by the number of points it should give
                userPoints += dailyVotes * collectiveModerationPoints;
            }

            // Now let's update the points in the database
            const userInformationsId = UsersInformations.findOne({userId: Meteor.userId()});
            UsersInformations.update(userInformationsId, { $set: { points: userPoints } }, function(error, result){
                if(error){
                    // There was an error
                    throw new Meteor.Error('pointsUpdateError', "Une erreur est survenue lors de la mise à jour de vos points, veuillez réessayer.")
                }
            });
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

            // Catching the possibles levels
            const levels = Rules.levels;

            var nextLevelIndex = 0;  // For the moment we don't know the index of the next level
            for(const [index, level] of levels.entries()){
                // For each level checking if it's the user's one
                if(level.name === userLevelName){
                    // This level is the user's one
                    nextLevelIndex = index + 1;  // The indext of the next level is this one + 1
                    break;
                }
            }
            // The points left until next level correspond to the points needed for next level less current points
            return levels[nextLevelIndex].pointsNeeded - userPoints;
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

            // Catching the possibles levels
            const levels = Rules.levels;

            var nextLevelIndex = 0;  // For the moment we don't know the index of the next level
            var userLevel = {};  // For the moment we don't know the propoerties of the current level
            for(const [index, level] of levels.entries()){
                // For each level checking if it's the user's one
                if(level.name === userLevelName){
                    // This level is the user's one
                    userLevel = level;  // Saving this level as the user's one
                    nextLevelIndex = index + 1;  // The indext of the next level is this one + 1
                    break;
                }
            }
            // The maximum of the progress corresponds to the points needed of the next level less the same property of the current level
            const progressMaximum = levels[nextLevelIndex].pointsNeeded - userLevel.pointsNeeded;
            // The value of the progress is the user's points less the points needed of the current level
            const progressValue = userPoints - userLevel.pointsNeeded;

            // Returning it in an object
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
            // Catching the possibles levels
            const levels = Rules.levels;
            var currentLevel = userInformations.level;
            for(var level of levels){
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
            UsersInformations.update(userInformations._id, { $set: { level: currentLevel } }, function(error, result){
                if(error){
                    // There was an error wgile updating the level
                    throw new Meteor.Error('levelUpdateError', "Une erreur est survenue lors de la mise à jour de votre niveau, veuillez réessayer.")
                }
            });
            return currentLevel;
        }
    },
    'getBestContributors'(){

        // Returning 5 users sorted by points in descending order
        const bestContributors = UsersInformations.find({}, {sort: { points: -1 }, limit: 10});
        var contributorsToReturn = [];  // Creating an array in which we'll add informations we need to return
        var rank = 1;  // Rank variable to return
        for(var contributor of bestContributors){
            if(contributor.profilePicture === null){
                // User doesn't have a profile picture, returning the default one
                var profilePicture = Rules.user.profilePicture.defaultUrl;
            } else{
                // User has a profile picture, finding the url in the Images database
                var profilePicture = Images.findOne({_id: contributor.profilePicture}).url();
            }
            contributorsToReturn.push({
                username: contributor.username,
                points: contributor.points,
                profilePicture: profilePicture,
                rank: rank
            });
            rank++;  // Incrementing the rank for the next contributor
        }
        return contributorsToReturn;
    },
    'getUserRank'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, catching the contributors sorted by points in descending order
            const contributors = UsersInformations.find({}, {sort: { points: -1 }});
            var userRank = 1;
            for(var contributor of contributors){
                // Checking if this contributor is the user
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
            // User is logged in
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

            // Updating non-sensitive informations in our database
            UsersInformations.update(userInformations._id, { $set: {
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
                        UsersInformations.update(userInformations._id, { $set: { username: username } } );
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
