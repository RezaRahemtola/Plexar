// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Images } from '../../databases/images.js';

// HTML import
import './editProductModeration.html';

// CSS import
import '../css/form.css';

// Initializing Session variables
Session.set('editProductModeration', null);


Template.editProductModeration.helpers({
    displayName: function(){
        Meteor.call('getRuleValue', {rulePath: 'Rules.product.name'}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Defining original name constants
                const originalName = document.querySelector('input#originalName');
                const originalNameCharDisplay = document.querySelector('span#originalNameCharCounter');
                // Setting input min and max length
                originalName.minLength = result.minLength;
                originalName.maxLength = result.maxLength;
                // Displaying char counter
                originalNameCharDisplay.innerText = originalName.value.length+" / "+originalName.maxLength;
            }
        });
        // Catching names and returning them (in an array to use each)
        const originalProductName = Session.get('editProductModeration').originalProduct.name;
        const editedProductName = Session.get('editProductModeration').editedProduct.name;
        return [ {originalProductName: originalProductName, editedProductName: editedProductName } ];
    },
    nameDifference: function(){
        const originalProduct = Session.get('editProductModeration').originalProduct;
        const editedProduct = Session.get('editProductModeration').editedProduct;
        if(originalProduct.name !== editedProduct.name){
            Meteor.call('getRuleValue', {rulePath: 'Rules.product.name'}, function(error, result){
                if(error){
                    // There is an error
                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                } else{
                    // Defining edited name constants
                    const editedName = document.querySelector('input#editedName');
                    const editedNameCharDisplay = document.querySelector('span#editedNameCharCounter');
                    // Setting input min and max length
                    editedName.minLength = result.minLength;
                    editedName.maxLength = result.maxLength;
                    // Displaying char counter
                    editedNameCharDisplay.innerText = editedName.value.length+" / "+editedName.maxLength;
                }
            });
            return true;
        }
        return false;
    },
    displayDescription: function(){
        Meteor.call('getRuleValue', {rulePath: 'Rules.product.description'}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Defining product description constants
                const originalDescription = document.querySelector('textarea#originalDescription');
                const originalDescriptionCharDisplay = document.querySelector('span#originalDescriptionCharCounter');
                // Auto expand the field to display the text correctly
                // Sending mandatory informations only to preserve server resources
                fieldForServer = {value: originalDescription.value, scrollHeight: originalDescription.scrollHeight};
                Meteor.call('autoExpand', {field:fieldForServer}, function(error, result){
                    if(error){
                        // There is an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    } else if(result){
                        originalDescription.style.height = result;  // Result is the height to apply to the field
                    }
                });
                // Setting input min and max length
                originalDescription.minLength = result.minLength;
                originalDescription.maxLength = result.maxLength;
                // Displaying char counter and creating an event listener
                originalDescriptionCharDisplay.innerText = originalDescription.value.length+" / "+originalDescription.maxLength;
            }
        });
        // Catching descrptions and returning them (in an array to use each)
        const originalProductDescription = Session.get('editProductModeration').originalProduct.description;
        const editedProductDescription = Session.get('editProductModeration').editedProduct.description;
        return [ {originalProductDescription: originalProductDescription, editedProductDescription: editedProductDescription } ];
    },
    descriptionDifference: function(){
        const originalProduct = Session.get('editProductModeration').originalProduct;
        const editedProduct = Session.get('editProductModeration').editedProduct;
        if(originalProduct.description !== editedProduct.description){
            Meteor.call('getRuleValue', {rulePath: 'Rules.product.description'}, function(error, result){
                if(error){
                    // There is an error
                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                } else{
                    // Defining product description constants
                    const editedDescription = document.querySelector('textarea#editedDescription');
                    const editedDescriptionCharDisplay = document.querySelector('span#editedDescriptionCharCounter');
                    // Auto expand the field to display the text correctly
                    // Sending mandatory informations only to preserve server resources
                    fieldForServer = {value: editedDescription.value, scrollHeight: editedDescription.scrollHeight};
                    Meteor.call('autoExpand', {field:fieldForServer}, function(error, result){
                        if(!error && result){
                            editedDescription.style.height = result;  // Result is the height to apply to the field
                        }
                    });
                    // Setting input min and max length
                    editedDescription.minLength = result.minLength;
                    editedDescription.maxLength = result.maxLength;
                    // Displaying char counter and creating an event listener
                    editedDescriptionCharDisplay.innerText = editedDescription.value.length+" / "+editedDescription.maxLength;
                }
            });
            return true;
        }
        return false;
    },
    displayCoverImage: function(){
        const originalCoverImage = Session.get('editProductModeration').originalProduct.images[0];
        const editedCoverImage = Session.get('editProductModeration').editedProduct.images[0];
        const originalCoverImageUrl = Images.findOne({_id: originalCoverImage}).url();
        const editedCoverImageUrl = Images.findOne({_id: editedCoverImage}).url();
        return [ { originalCoverImageUrl: originalCoverImageUrl, editedCoverImageUrl: editedCoverImageUrl} ]
    },
    coverImageDifference: function(){
        const originalCoverImage = Session.get('editProductModeration').originalProduct.images[0];
        const editedCoverImage = Session.get('editProductModeration').editedProduct.images[0];
        if(originalCoverImage !== editedCoverImage){
            return true;
        }
        return false;
    },
    displayOtherImages: function(){
        // Catching the original product's images
        const originalImages = Session.get('editProductModeration').originalProduct.images;
        // Removing the first image (cover image)
        originalImages.splice(0, 1);
        var originalImagesUrl = [];
        for(var imageId of originalImages){
            // For each image id, we add it to the images array
            originalImagesUrl.push(Images.findOne({_id: imageId}).url());
        }
        return originalImagesUrl;
    },
    otherImagesDifference: function(){
        // Catching images
        const originalImages = Session.get('editProductModeration').originalProduct.images;
        const editedImages = Session.get('editProductModeration').editedProduct.images;
        // Removing the first image (cover image)
        originalImages.splice(0, 1);
        editedImages.splice(0, 1);
        // Comparing length (return a boolean)
        const isLengthDifferent = (originalImages.length !== editedImages.length);
        // Comparing elements (return a boolean)
        const areElementsDifferent = originalImages.every(function(element, index){
            return element !== editedImages[index];
        });
        return isLengthDifferent && areElementsDifferent;
    },
    displayEditedOtherImages: function(){
        // Catching the edited product's images
        const editedImages = Session.get('editProductModeration').editedProduct.images;
        // Removing the first image (cover image)
        editedImages.splice(0, 1);
        var editedImagesUrl = [];
        for(var imageId of editedImages){
            // For each image id, we add it to the images array
            editedImagesUrl.push(Images.findOne({_id: imageId}).url());
        }
        return editedImagesUrl;
    },
    displayCategories: function(){
        // Catching original product's categories
        return Session.get('editProductModeration').originalProduct.categories;
    },
    categoriesDifference: function(){
        // Catching categories
        const originalCategories = Session.get('editProductModeration').originalProduct.categories;
        const editedCategories = Session.get('editProductModeration').editedProduct.categories;
        // Comparing length (return a boolean)
        const isLengthDifferent = (originalCategories.length !== editedCategories.length);
        // Comparing elements (return a boolean)
        const areElementsDifferent = originalCategories.every(function(element, index){
            return element !== editedCategories[index];
        });
        return isLengthDifferent && areElementsDifferent;
    },
    displayEditedCategories: function(){
        return Session.get('editProductModeration').editedProduct.categories;
    }
});


Template.editProductModeration.events({
    'click #rejectModifications'(event){
        event.preventDefault();
        const editedProductId = Session.get('editProductModeration').editedProduct._id;
        Meteor.call('rejectEditModeration', {editedProductId: editedProductId}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                Session.set('page', 'moderation');
            }
        });
    }
});


Template.editProductModeration.onDestroyed(function(){
    // Reinitializing Session variable
    Session.set('editProductModeration', null);
});
