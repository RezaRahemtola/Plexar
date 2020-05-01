// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { Rules } from '../rules.js';

Meteor.methods({
    'getRuleValue'({rulePath}){
        // Type check to prevent malicious calls
        check(rulePath, String);

        if(eval(rulePath) !== undefined && rulePath.includes("Rules.")){
            // Path is valid, return the corresponding getRuleValue
            return eval(rulePath);
        } else{
            // Path is invalid, throwing an error
            throw new Meteor.Error("invalid-rule", "The rule ''"+rulePath+"' doesn't exist.");
        }
    },
    'productsCounter'(){
        return Products.find().count().toLocaleString();  // toLocaleString() make a space where needed (1000 will be 1 000)
    },
    'getCategories'(){
        return Rules.product.categories;
    }
});
