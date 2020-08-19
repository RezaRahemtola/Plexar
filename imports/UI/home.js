// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

// HTML import
import './home.html';

// Initializing Session variable
Session.set('bestProducts', []);  // We don't know which products are the most popular for the moment


Template.home.helpers({
    productsCounter: function(){
        Meteor.call('productsCounter', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Number of product was successfully returned, saving it a Session variable
                Session.set('productsCounter', result);
            }
        });
        return Session.get('productsCounter');
    },
    displayBestProducts: function(){
        Meteor.call('getBestProducts', function(error, bestProducts){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(bestProducts){
                // Array of 3 best products was returned, saving it in a Session variable
                Session.set('bestProducts', bestProducts);
            }
        });
        return Session.get('bestProducts');
    }
});


Template.home.events({
    'submit form#searchForm'(event){
        event.preventDefault();
        // Catching the search object
        var search = Session.get('search');
        // Updating the query with the given text input
        search.query = document.getElementById("searchBox").value;
        // Saving the search in a Session variable
        Session.set('search', search);
        FlowRouter.go('/search')  // Sending the user to the search results page
    }
});
