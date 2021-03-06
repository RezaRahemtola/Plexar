// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './profile.html';


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
        Meteor.call('userIsAdmin', function(error, isAdmin){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else if(typeof(isAdmin) === 'boolean'){
                // Method successfully executed, saving the result
                Session.set('userIsAdmin', isAdmin);
            }
        });
        return Session.get('userIsAdmin');
    }
});
