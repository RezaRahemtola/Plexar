// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './full.html';

Template.header.helpers({
    style: function(){
        var message = Session.get('message');
        return message.style
    },
    headerContent: function(){
        var message = Session.get('message');
        return message.headerContent
    },
    bodyContent: function(){
        var message = Session.set('message');
        return message.bodyContent
    },
    messageToDisplay: function(){
        if(Session.get('message') !== null){
            return true
        }
        return false
    }
});
