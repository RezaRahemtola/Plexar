// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML import
import './contributions.html';

// Database import
import { Contributions } from '../../databases/contributions.js';
import { Products } from '../../databases/products.js';
import { Moderation } from '../../databases/moderation.js';


Template.contributions.helpers({
    displayContribution: function(){
        var contributionsCursor = Contributions.find({userId: Meteor.userId()}, {sort: { createdAt: -1 }});  // Return user's contributions sorted by date (most recent first)
        var userContributions = [];  // Creating an array to push the formatted contributions
        contributionsCursor.forEach(function(doc){
            // Browsing the documents
            var createdAtFormatted = new Date(doc.createdAt);  // Converting the creation date to a classic format
            var year = createdAtFormatted.getFullYear();  // Catching the year
            var month = createdAtFormatted.getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
            var date = createdAtFormatted.getDate();  // Catching the date
            if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
            if(month < 10){ month = '0' + month; }
            createdAtFormatted = date+ '/' +month+ '/' +year;  // Updating the document with the new creation date

            var elementName = Products.findOne({_id: doc.elementId}).name;

            if(!Moderation.findOne({_id: doc.moderationId})){
                // The contribution isn't under moderation
                var status = 'Validé';
                var statusStyle = 'is-success';
            } else{
                // Contribution is under moderation
                var status = 'En attente de validation';
                var statusStyle = 'is-warning';
            }
            
             // Pushing the new document
            userContributions.push({type: doc.type,
                                    date: createdAtFormatted,
                                    elementId: doc.elementId,
                                    elementName: elementName,
                                    status: status,
                                    statusStyle: statusStyle
            });
        });
        return userContributions;
    }
});
