import { Meteor } from 'meteor/meteor';

// Importing databases
import '../imports/bdd/produits.js';
import '../imports/bdd/utilisateurs.js';
import '../imports/bdd/favoris.js';
import '../imports/bdd/magasins.js';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    'changeUsername'({userId, newUsername}){
        Accounts.setUsername(userId, newUsername)
    }
});
