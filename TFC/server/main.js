import { Meteor } from 'meteor/meteor';

// Importing databases
import '../imports/bdd/produits.js';
import '../imports/bdd/utilisateurs.js';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    'changeUsername'({userId, newUsername}){
        Accounts.setUsername(userId, newUsername)
    }
});
