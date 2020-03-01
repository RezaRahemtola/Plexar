import { Meteor } from 'meteor/meteor';

// Importing databases
import '../imports/bdd/products.js';
import '../imports/bdd/usersInformations.js';
import '../imports/bdd/favorites.js';
import '../imports/bdd/shops.js';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    'changeUsername'({userId, newUsername}){
        Accounts.setUsername(userId, newUsername)
    }
});
