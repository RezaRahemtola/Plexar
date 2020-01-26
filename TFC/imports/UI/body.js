// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './body.html';

// JS Imports
import './home.js';
import './manageProduit.js';
import './userprofile.js';

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
    'click #userprofile' (event){
        Session.set('page', 'userprofile');
    },
    'click #manageProduit' (event){
        Session.set('page', 'manageProduit');
    }
});
