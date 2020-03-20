// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './header.html';

Template.header.helpers({
    style: function(){
        // Get the message and return it's style (the class to apply)
        var message = Session.get('message');
        return message.style;
    },
    headerContent: function(){
        // Get the message and return the text to display in header
        var message = Session.get('message');
        return message.headerContent;
    },
    messageToDisplay: function(){
        if(Session.get('message') !== null){
            return true;
        }
        return false;
    }
});
