// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing database
import { Rules } from '../rules.js';


Meteor.methods({
    'getProductRules'(){
        return Rules.product;
    },
    'getProductNameRules'(){
        return Rules.product.name;
    },
    'getProductDescriptionRules'(){
        return Rules.product.description;
    },
    'getCategories'(){
        // Return all the available categories
        return Rules.product.categories;
    },
    'sendContactMessage'({email, subject, message}){
        // Type check to prevent malicious calls
        check(email, String);
        check(subject, String);
        check(message, String);

        // TODO: length verifications

        Meteor.call('checkEmailInput', {email: email}, function(error, result){
            if(error){
                // Email is invalid, throwing an error
                throw new Meteor.Error('invalidEmailAddress', "Adresse email invalide.");
            } else{
                // Email address is valid
                const from = Rules.email.contactForm.sender;
                const to = Rules.email.contactForm.receiver;
                const emailSubject = "Formulaire de contact";

                // Creating the body content of the email
                const html = `<h3>Sujet: `+ subject +`</h3>
                              <h4>Adresse email : `+ email +`</h4>
                              <p>Message : `+ message +`</p>`;

                // Sending email using SendGrid (https://app.sendgrid.com/guide/integrate/langs/nodejs):

                // Using Twilio SendGrid's v3 Node.js Library (https://github.com/sendgrid/sendgrid-nodejs)
                const sendGrid = require('@sendgrid/mail');
                sendGrid.setApiKey(process.env.SENDGRID_CONTACT_API_KEY);
                sendGrid.send({to: to, from: from, subject: emailSubject, html: html});
            }
        });
    },
    'setAccountsSettings'(){

        Accounts.config({
            sendVerificationEmail: true, // Enable verification email
            loginExpirationInDays: null  // Disable login expiration
        });

        // Customizing templates :
        Accounts.emailTemplates.verifyEmail = {
            from(){
                // Defining sending address
                return Rules.email.verifyEmail.sender;
            },
            subject(){
                return "Activez votre compte";
            },
            html(user, url){
                return `<h3>Bonjour ${user.username},</h3>
                        <br/>
                        <p>Merci pour votre inscription, vous pouvez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous</p>
                        <a href="` + url + `">
                            Vérifier votre adresse e-mail
                        </a>
                        <br/>
                        <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur : <a href="` + url + `">`+ url +`</a></p>`;
            }
        };
        Accounts.emailTemplates.resetPassword = {
            from(){
                // Defining sending address
                return Rules.email.resetPassword.sender;
            },
            subject(){
                return "Réinitialiser votre mot passe";
            },
            html(user, url){
                return `<h3>Bonjour ${user.username},</h3>
                        <br/>
                        <p>Vous avez demandé à réinitialiser votre mot de passe, vous pouvez le faire en cliquant sur le bouton ci-dessous</p>
                        <a href="` + url + `">
                            Réinitialiser votre mot de passe
                        </a>
                        <br/>
                        <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur : <a href="` + url + `">`+ url +`</a></p>
                        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>`;
            }
        };
    }
});
