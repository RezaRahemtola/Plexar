// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';


// HTML import
import './userProfile.html';

// JS imports
import './contributions.js';
import './favorite.js';
import './informations.js';


FlowRouter.route('/user', {
    name: 'user',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'userProfile'});
    }
});


Template.userProfile.helpers({
    userIsAdmin: function(){
        // Checking is user is admin
        Meteor.call('userIsAdmin', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else if(result === true || result === false){
                // Method successfully executed, saving the result
                Session.set('userIsAdmin', result);
            }
        });
        return Session.get('userIsAdmin');
    }
});
