// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

import { Products } from '../../imports/databases/products.js';
import { Moderation } from '../../imports/databases/moderation.js';
import { Rules } from '../rules.js';

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
        var result = Products.find({$text: { $search: text}}).fetch();  // Return the matching products that are not under moderation
        var productsID = [];  // To save server resources we will only return products IDs
        for (var product of result){
            // For each product we add its ID to the array
            if(!Moderation.findOne({elementId: product._id})){
                // The product is not under moderation
                productsID.push(product._id);
            }
        }
        return productsID  // return array of productsID
    },
    'sendVerificationEmail'(){
        Accounts.sendVerificationEmail(Meteor.userId());
    },
    'getRuleValue'({rulePath}){
        if(eval(rulePath) !== undefined && rulePath.includes("Rules.")){
            // Path is valid, return the corresponding getRuleValue
            return eval(rulePath);
        } else{
            // Path is invalid, throwing an error
            throw new Meteor.Error("invalid-rule", "The rule ''"+rulePath+"' doesn't exist.");
        }
    }
});
