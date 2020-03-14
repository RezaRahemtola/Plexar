// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './header.html';

Template.header.helpers({
    style: function(){
        var message = Session.get('message');
        return message.style
    },
    headerContent: function(){
        var message = Session.get('message');
        return message.headerContent
    }
});
