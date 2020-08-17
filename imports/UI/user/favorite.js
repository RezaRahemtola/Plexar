// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML imports
import './favorite.html';

// Initializing Session variables
Session.set('favoriteProducts', []);


FlowRouter.route('/user/favorite', {
    name: 'userFavorite',
    action(){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'userProfile', currentUserPage: 'favorite'});
    }
});


Template.favorite.onRendered(function(){
    $("li.is-active").removeClass("is-active");  // Remove class from the older active tab
    $("li#favorite").addClass("is-active");  // Set the current tab as the active one
});


Template.favorite.helpers({
    displayFavoriteProducts: function(){
        Meteor.call('displayFavoriteProducts', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                Session.set('favoriteProducts', result);
            }
        });
        return Session.get('favoriteProducts');
    }
});
