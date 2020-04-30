// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Rules } from '../rules.js';


Meteor.methods({
    'checkPasswordsInput'({password, confirmPassword}){
        /**
         * Check if a password match all criteria and match it's confirmation
         *
         *  @param  {string}         password   Content of the password input
         *  @param  {string}  confirmPassword   Content of the password confirmation input
         *
         *  @return {boolean}  true if password matched all criteria, else false
         */

        // Type check to prevent malicious calls
        check(password, String);
        check(confirmPassword, String);

        const passwordRules = Rules.user.password;  // Catching password rules
        if(password.length >= passwordRules.minLength && password.length <= passwordRules.maxLength){
            // Password length is correct
            for(var char of passwordRules.forbiddenChars){
                // Checking that the char isn't in the password
                if(password.includes(char)){
                    // A forbidden char is in the password, throwing an error handled in client side
                    throw new Meteor.Error('forbiddenChar', 'Le mot de passe ne peut pas contenir "'+char+'".');
               }
            }
            if(password !== confirmPassword){
                // Passwords don't match, throwing an error handled in client side
                throw new Meteor.Error('differentPasswords', "Les mots de passe ne correspondent pas");
            } else{
                // Password match all criteria
                return true;
            }
        }
        // Password length isn't correct, throwing an error handled in client side
        throw new Meteor.Error('differentPasswords', "La taille du mot de passe n'est pas correcte.");
    },
    'checkEmailInput'({email}){
        /**
         * Check if a text match all criteria
         *
         *  @param  {string}  email   Content of the email input
         *
         *  @return {boolean}  true if the text matched all criteria, else false
         */

        // Type check to prevent malicious calls
        check(email, String);

        // Regex expression to check email from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
        const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(regex.test(email)){
            return true;
        }
        throw new Meteor.Error('invalidEmail');
    },
    'checkProductCoverImageInput'({files}){
        const coverImageRules = Rules.product.coverImage;  // Catching the rules
        if(files.length >= coverImageRules.minLength && files.length <= coverImageRules.maxLength){
            // Number of files is ok, checking for each file if the size is correct
            const maxSize = coverImageRules.maxMbSize*1000000;  // File size is in bytes, converting maxSize (1 MegaByte = 1 000 000 bytes)
            for(var file of files){
                if(file.size > maxSize){
                    // One of the file is too big, throwing an error to handle in client side
                    throw new Meteor.Error('fileTooBig', "La taille maximale autorisée par fichier est de "+coverImageRules.maxMbSize+" MB.");
                }
                if(!file.type.includes('image')){
                    // File is not an image
                    throw new Meteor.Error('incorrectType', "Ce type de fichier n'est pas autorisé.");
                }
            }
            // Files match all criteria
            return true;
        }
        // Number of files is not correct, displaying custom error messages
        if(files.length < coverImageRules.minLength){
            if(coverImageRules.minLength === 1){
                throw new Meteor.Error('filesNumberError', "Veuillez sélectionner au moins 1 fichier.");
            } else{
                throw new Meteor.Error('filesNumberError', "Veuillez sélectionner au moins "+coverImageRules.minLength+" fichiers.");
            }
        } else if(files.length > coverImageRules.maxLength){
            if(coverImageRules.maxLength === 1){
                throw new Meteor.Error('filesNumberError', "Vous ne pouvez pas sélectionner plus d'1 fichier.");
            } else{
                throw new Meteor.Error('filesNumberError', "Vous ne pouvez pas sélectionner plus de "+coverImageRules.maxLength+" fichiers.");
            }
        }
    },
    'checkProductOtherImagesInput'({files, numberOfUploadedImages}){

        // Type check to prevent malicious calls
        check(numberOfUploadedImages, Number);

        const otherImagesRules = Rules.product.otherImages;  // Catching the rules
        const maxFilesLength = otherImagesRules.maxLength - numberOfUploadedImages;
        if(files.length >= otherImagesRules.minLength && files.length <= maxFilesLength){
            // Number of files is ok, checking for each file if the size is correct
            var maxSize = otherImagesRules.maxMbSize*1000000;  // File size is in bytes, converting maxSize (1 MegaByte = 1 000 000 bytes)
            for(var file of files){
                if(file.size > maxSize){
                    // One of the file is too big
                    throw new Meteor.Error('fileTooBig', "La taille maximale autorisée par fichier est de "+otherImagesRules.maxMbSize+" MB.");
                }
                if(!file.type.includes('image')){
                    // File is not an image
                    throw new Meteor.Error('incorrectType', "Ce type de fichier n'est pas autorisé.");
                }
            }
            // Files match all criteria
            return true;
        }
        // Number of files is not correct, displaying custom error messages
        if(files.length < otherImagesRules.minLength){
            if(otherImagesRules.minLength === 1){
                throw new Meteor.Error('filesNumberError', "Veuillez sélectionner au moins 1 fichier.");
            } else{
                throw new Meteor.Error('filesNumberError', "Veuillez sélectionner au moins "+otherImageRules.minLength+" fichiers.");
            }
        } else if(files.length > maxFilesLength){
            console.log(files.length);
            if(maxFilesLength === 1){
                throw new Meteor.Error('filesNumberError', "Vous ne pouvez pas sélectionner plus d'1 fichier.");
            } else{
                throw new Meteor.Error('filesNumberError', "Vous ne pouvez pas sélectionner plus de "+maxFilesLength+" fichiers.");
            }
        }
    },
    'checkProfilePictureInput'({files}){
        const profilePictureRules = Rules.user.profilePicture;  // Catching the rules
        if(files.length >= profilePictureRules.minLength && files.length <= profilePictureRules.maxLength){
            // Number of files is ok, checking for each file if the size is correct
            const maxSize = profilePictureRules.maxMbSize*1000000;  // File size is in bytes, converting maxSize (1 MegaByte = 1 000 000 bytes)
            for(var file of files){
                if(file.size > maxSize){
                    // One of the file is too big, throwing an error to handle in client side
                    throw new Meteor.Error('fileTooBig', "La taille maximale autorisée par fichier est de "+profilePictureRules.maxMbSize+" MB.");
                }
                if(!file.type.includes('image')){
                    // File is not an image
                    throw new Meteor.Error('incorrectType', "Ce type de fichier n'est pas autorisé.");
                }
            }
            // Files match all criteria
            return true;
        }
        // Number of files is not correct, displaying custom error messages
        if(files.length < profilePictureRules.minLength){
            if(profilePictureRules.minLength === 1){
                throw new Meteor.Error('filesNumberError', "Veuillez sélectionner au moins 1 fichier.");
            } else{
                throw new Meteor.Error('filesNumberError', "Veuillez sélectionner au moins "+profilePictureRules.minLength+" fichiers.");
            }
        } else if(files.length > profilePictureRules.maxLength){
            if(profilePictureRules.maxLength === 1){
                throw new Meteor.Error('filesNumberError', "Vous ne pouvez pas sélectionner plus d'1 fichier.");
            } else{
                throw new Meteor.Error('filesNumberError', "Vous ne pouvez pas sélectionner plus de "+profilePictureRules.maxLength+" fichiers.");
            }
        }
    },
    'autoExpand'({field}){

        // Type check to prevent malicious calls
        check(field, Object);

        if(field.value.length === 0){
            // If the field is empty, reset the style height to min-height
             var newHeight = 3 + 'rem';
        } else{
            // Calculate the height based on the scroll height
            var newHeight = field.scrollHeight + 'px';
        }
        return newHeight;
    }
});
