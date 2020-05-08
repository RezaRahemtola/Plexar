// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './full.html';


Template.header.helpers({
    style: function(){
        return Session.get('message').style;
    },
    headerContent: function(){
        return Session.get('message').headerContent;
    },
    bodyContent: function(){
        return Session.get('message').bodyContent;
    },
    messageToDisplay: function(){
        return Session.get('message');
    }
});
