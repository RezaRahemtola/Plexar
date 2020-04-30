// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { Moderation } from '../../imports/databases/moderation.js';


Meteor.methods({
    'searchForProducts'({text}){
        // Type check to prevent malicious calls
        check(text, String);

        const matchingProducts = Products.find({$text: { $search: text}}).fetch();  // Return the products that match the search query
        var productsToReturn = [];  // Creating a list in which we will push the products
        for(var product of matchingProducts){
            // For each product we add it to the array if it's not under moderation
            if(!Moderation.findOne({elementId: product._id})){
                productsToReturn.push(product);
            }
        }
        return productsToReturn;  // Returns array of products
    }
});
