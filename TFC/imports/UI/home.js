// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './home.html';

// Database imports
import { Products } from '../databases/products.js';
import { UsersInformations } from '../databases/usersInformations.js';
import { Images } from '../databases/images.js';


Template.home.helpers({
    productsCounter(){
        return Products.find().count().toLocaleString();  // toLocaleString() make a space where needed (1000 will be 1 000)
    }
});

Template.home.events({
    'submit form#searchForm'(event){
        event.preventDefault();
        var search = Session.get('search');
        search.query = document.getElementById("searchBox").value
        Session.set('search', search);  // Storing search input value in a variable
        Session.set('page', 'searchResults');  // Sending the user to the search results page
    }
});
