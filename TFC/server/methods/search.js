// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { Moderation } from '../../imports/databases/moderation.js';


Meteor.methods({
    'searchForProducts'({text}){
        var result = Products.find({$text: { $search: text}}).fetch();  // Return the matching products that are not under moderation
        var productsID = [];  // To save server resources we will only return products IDs
        for (var product of result){
            // For each product we add its ID to the array
            if(!Moderation.findOne({elementId: product._id})){
                // The product is not under moderation
                productsID.push(product._id);
            }
        }
        return productsID  // Returns array of productsID
    }
});
