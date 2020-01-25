// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './body.html';

// JS Imports
import './utilisateur.js';
import './home.js';

//Imports pour les bases de données
import { Produits } from '../bdd/produits.js';

Session.set('page', 'home');

Template.body.helpers({
    currentPage: function(page){
    return Session.get('page');
  }
});

Template.body.events({
  'click #home' (event){
    Session.set('page', 'home');
  },
  'click #utilisateur' (event){
    Session.set('page', 'utilisateur');
  }
});
