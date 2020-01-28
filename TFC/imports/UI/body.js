// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './body.html';

// JS Imports
import './home.js';
import './manageProduit.js';
import './userProfile.js';

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
    'click #userProfile' (event){
        Session.set('page', 'userProfile');
    },
    'click #manageProduit' (event){
        Session.set('page', 'manageProduit');
    }
});
