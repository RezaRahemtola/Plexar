// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Rules } from '../rules.js';

Meteor.methods({
    'getRuleValue'({rulePath}){
        if(eval(rulePath) !== undefined && rulePath.includes("Rules.")){
            // Path is valid, return the corresponding getRuleValue
            return eval(rulePath);
        } else{
            // Path is invalid, throwing an error
            throw new Meteor.Error("invalid-rule", "The rule ''"+rulePath+"' doesn't exist.");
        }
    }
});
