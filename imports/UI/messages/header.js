// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './header.html';


Template.header.helpers({
    messageToDisplay: function(){
        return Session.get('message');
    }
});
