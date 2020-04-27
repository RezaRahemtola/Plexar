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


Meteor.methods({
    'changeUsername'({newUsername}){
        Accounts.setUsername(Meteor.userId(), newUsername);
    },
    'checkIfUsernameIsTaken'({username}){
        if(Meteor.user()){
            // If user is logged in, check if username exists and if it's different than current user's
            return (Meteor.users.findOne({username: username}) && username !== Meteor.user().username) ? true : false;
        } else{
            // Only check if username exists
            return (Meteor.users.findOne({username: username})) ? true : false;
        }
    },
    'checkIfEmailIsTaken'({email}){
        return (Accounts.findUserByEmail(email)) ? true : false;
    },
    'sendVerificationEmail'(){
        Accounts.sendVerificationEmail(Meteor.userId());
    },
    'createNewUser'({username, email, newsletterIsChecked}){
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
        // User was successfully created
        return true;
    },
    'displayContributions'(){
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

            Meteor.call('findOneProductById', {productId: doc.elementId}, function(error, result){
                if(!error){
                    var elementName = result.name;
                    if(!Moderation.findOne({_id: doc.moderationId})){
                        // The contribution isn't under moderation, setting the corresponding status
                        var status = 'Validé';
                        var statusStyle = 'is-success';
                    } else{
                        // Contribution is under moderation, setting the corresponding status
                        var status = 'En attente de validation';
                        var statusStyle = 'is-warning';
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
                }
            });
        });
        return userContributions;
    }
});
