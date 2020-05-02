// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './home.html';


Template.home.helpers({
    productsCounter: function(){
        Meteor.call('productsCounter', function(error, result){
            if(!error){
                Session.set('productsCounter', result);
            }
        });
        return Session.get('productsCounter');
    }
});


Template.home.events({
    'submit form#searchForm'(event){
        event.preventDefault();
        var search = Session.get('search');
        search.query = document.getElementById("searchBox").value;
        Session.set('search', search);  // Storing search input value in a variable
        var navigation = Session.get('navigation');  // Catching navigation history
        navigation.push(Session.get('page'));  // Adding the current page
        Session.set('navigation', navigation);  // Updating the value
        Session.set('page', 'searchResults');  // Sending the user to the search results page
    }
});
