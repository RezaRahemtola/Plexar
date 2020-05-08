// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './header.html';


Template.header.helpers({
    style: function(){
        // Get the message and return it's style (the class to apply)
        return Session.get('message').style;
    },
    headerContent: function(){
        // Get the message and return the text to display in header
        return Session.get('message').headerContent;
    },
    messageToDisplay: function(){
        return Session.get('message');
    }
});
