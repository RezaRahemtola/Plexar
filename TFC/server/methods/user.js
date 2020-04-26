// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
// Importing databases


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
    }
});
