// Useful imports
import { Meteor } from 'meteor/meteor';

// Importing databases
import '../imports/bdd/products.js';
import '../imports/bdd/usersInformations.js';
import '../imports/bdd/favorites.js';
import '../imports/bdd/shops.js';
import '../imports/bdd/images.js';

import { Products } from '../imports/bdd/products.js';
import { Shops } from '../imports/bdd/shops.js';

Meteor.startup(() => {
    // code to run on server at startup
    Products.rawCollection().createIndex({ name: "text", description: "text" });  // Creating text index to enable search in those fields of the db
    Shops.rawCollection().createIndex({ name: "text", description: "text" });  // Creating text index to enable search in those fields of the db
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
    'searchForShops'({text}){
        var result = Shops.find({$text: { $search: text}}).fetch();  // Return the matching products
        var shopsID = [];  // To save server resources we will only return products IDs
        for (shop of result){
            // For each product we add its ID to the array
            shopsID.push(shop._id);
        }
        return shopsID  // return array of productsID
    }
});
