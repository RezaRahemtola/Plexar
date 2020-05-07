// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

// Importing databases
import '../imports/databases/_all.js';

// Importing methods
import './methods/_all.js';

import { Products } from '../imports/databases/products.js';


Meteor.startup(function(){
    // code to run on server at startup
    Products.rawCollection().createIndex({ name: "text", description: "text" });  // Creating text index to enable search in those fields of the db
    if(Meteor.settings && Meteor.settings.smtp){
        const { username, password, host, port, isSecure } = Meteor.settings.smtp;
        const scheme = isSecure ? 'smtps' : 'smtp';
        process.env.MAIL_URL = `${scheme}://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}`;
        
        Accounts.emailTemplates.from = "Plexar <evan.houssette@gmail.com>";

    }
    Accounts.config({
        sendVerificationEmail: true
    });
    Accounts.onEmailVerificationLink = function(token, done){
        Accounts.verifyEmail(token);
    };
});
