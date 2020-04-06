// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './contributions.html';

// Database import
import { Contributions } from '../../databases/contributions.js';


Template.contributions.helpers({
    displayContribution: function(){
        var contributionsCursor = Contributions.find({userId: Meteor.userId()}, {sort: { "content.createdAt": -1 }});  // Return user's contributions sorted by date (most recent first)
        var userContributions = [];  // Creating an array to push the formatted contributions
        contributionsCursor.forEach(function(doc){
            // Browsing the documents
            var createdAt = new Date(doc.content.createdAt);  // Converting the creation date to a classic format
            var year = createdAt.getFullYear();  // Catching the year
            var month = createdAt.getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
            var date = createdAt.getDate();  // Catching the date
            if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
            if(month < 10){ month = '0' + month; }
            doc.content.createdAt = date+ '/' +month+ '/' +year;  // Updating the document with the new creation date
            userContributions.push(doc);  // Pushing it to the contributions
        });
        return userContributions;
    }
});
