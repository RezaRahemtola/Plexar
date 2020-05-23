// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './home.html';


Template.home.onRendered(function(){
    // Scrolling the window back to the top
    window.scrollTo(0, 0);
});


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
        // Switching page
        var navigation = Session.get('navigation');  // Catching navigation history
        navigation.push(Session.get('page'));  // Adding the current page
        Session.set('navigation', navigation);  // Updating the value
        Session.set('page', 'searchResults');  // Sending the user to the search results page
    }
});
