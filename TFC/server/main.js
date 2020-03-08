import { Meteor } from 'meteor/meteor';

// Importing databases
import '../imports/bdd/products.js';
import '../imports/bdd/usersInformations.js';
import '../imports/bdd/favorites.js';
import '../imports/bdd/shops.js';

import { Products } from '../imports/bdd/products.js';
import { Shops } from '../imports/bdd/shops.js';

Meteor.startup(() => {
  // code to run on server at startup
  Products.rawCollection().createIndex({ name: "text", description: "text" });
  Shops.rawCollection().createIndex({ name: "text", description: "text" });
});

Meteor.methods({
    'changeUsername'({userId, newUsername}){
        Accounts.setUsername(userId, newUsername)
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
