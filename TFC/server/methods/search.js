// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { Moderation } from '../../imports/databases/moderation.js';


Meteor.methods({
    'searchForProducts'({text, categories}){
        // Type check to prevent malicious calls
        check(text, String);

        if(!Array.isArray(categories)){
            // Categories isn't an array
            throw new Meteor.Error('categoriesNotArray', 'Une erreur est survenue lors du filtrage par catégories, veuillez réessayer.');
        } else{
            if(categories.length > 0 && text === ""){
                // User wants to search by categories, returning the products that contains all the asked categories
                var matchingProducts = Products.find({categories: { $all: categories } }).fetch();
            } else if(categories.length > 0 && text !== ""){
                // User wants to search a text with categories filter, returning the products that contains the text and all the asked categories
                var matchingProducts = Products.find({$text: { $search: text}, categories: { $all: categories } }).fetch();
            } else{
                // No need to filter by categories, returning the products that match the search query
                var matchingProducts = Products.find({$text: { $search: text} }).fetch();
            }

            var productsToReturn = [];  // Creating a list in which we will push the products
            for(var product of matchingProducts){
                // For each product we add it to the array if it's not under moderation
                if(!Moderation.findOne({elementId: product._id})){
                    productsToReturn.push(product);
                } else{
                    // Catching the reason of the moderation
                    const moderationReason = Moderation.findOne({elementId: product._id}).reason;
                    if(moderationReason === 'editProduct' || moderationReason === 'duplicate' || moderationReason === 'offTopic'){
                        // Product is in moderation for a report or an edit suggestion, we can show it
                        productsToReturn.push(product);
                    }
                }
            }
            return productsToReturn;  // Returns array of products
        }
    }
});
