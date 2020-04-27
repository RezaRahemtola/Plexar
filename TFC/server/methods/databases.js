// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';

Meteor.methods({
    'findOneProductById'({productId}){
        return Products.findOne({_id : productId});
    }
});
