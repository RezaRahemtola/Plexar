// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './favorite.html';

// Initializing Session variables
Session.set('favoriteProducts', []);

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
    },
    noFavorite: function(){
        // Catching favorite results
        const favorite = Session.get('favoriteProducts');
        if(favorite.length > 0){
            // There is at least one favorite
            return false;
        } else{
            // User doesn't have any favorite for the moment
            return true;
        }
    }
});
