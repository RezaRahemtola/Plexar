// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

// Importing databases
import '../imports/databases/products.js';
import '../imports/databases/usersInformations.js';
import '../imports/databases/favorites.js';
import '../imports/databases/images.js';

import { Products } from '../imports/databases/products.js';

Meteor.startup(function(){
    // code to run on server at startup
    Products.rawCollection().createIndex({ name: "text", description: "text" });  // Creating text index to enable search in those fields of the db
    if (Meteor.settings && Meteor.settings.smtp){
        const { username, password, host, port, isSecure } = Meteor.settings.smtp;
        const scheme = isSecure ? 'smtps' : 'smtp';
        process.env.MAIL_URL = `${scheme}://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}`;
    }
    Accounts.config({
        sendVerificationEmail: true
    });
});

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
    'searchForProducts'({text}){
        var result = Products.find({$text: { $search: text}}).fetch();  // Return the matching products
        var productsID = [];  // To save server resources we will only return products IDs
        for (product of result){
            // For each product we add its ID to the array
            productsID.push(product._id);
        }
        return productsID  // return array of productsID
    },
    'sendVerificationEmail'(){
        Accounts.sendVerificationEmail(Meteor.userId());
    }
});

Accounts.onEmailVerificationLink = function(token, done){
    Accounts.verifyEmail(token);
};
