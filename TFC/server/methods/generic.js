// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

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
    },
    'creatingEmailSettings'(){

        // Defining default sending address
        Accounts.emailTemplates.from = "Plexar <evan.houssette@gmail.com>";

        // Enable verification email
        Accounts.config({
            sendVerificationEmail: true
        });

        // When an email verification link is clicked, verifyEmail with the given token
        Accounts.onEmailVerificationLink = function(token, done){
            Accounts.verifyEmail(token, function(error){
                if(error){
                    throw new Meteor.Error(error.error, error.reason);
                } else{
                    // Everything was successfully executed
                    done();
                }
            });
        };

        // Customizing templates :
        Accounts.emailTemplates.verifyEmail = {
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
                        <p>Si le bouton ci-dessus ne fonctionne pas, copiez ce lien dans votre navigateur : <a href="` + url + `">`+ url +`</a></p>`;
            }
        };
        Accounts.emailTemplates.resetPassword = {
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
                        <p>Si le bouton ci-dessus ne fonctionne pas, copiez ce lien dans votre navigateur : <a href="` + url + `">`+ url +`</a></p>
                        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>`;
            }
        };
    }
});
