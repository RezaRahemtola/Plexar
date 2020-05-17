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


Template.editProductModeration.onRendered(function(){
    // Filling fields
    const originalProduct = Session.get('editProductModeration').originalProduct;

    // Name
    const originalName = document.querySelector('input#originalName');
    const originalNameCharDisplay = document.querySelector('span#originalNameCharCounter');
    originalName.value = originalProduct.name;
    Meteor.call('getRuleValue', {rulePath: 'Rules.product.name'}, function(error, result){
        if(error){
            // There is an error
            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
        } else{
            // Rule retrived successfully, setting input min and max length
            originalName.minLength = result.minLength;
            originalName.maxLength = result.maxLength;
            // Displaying char counter
            originalNameCharDisplay.innerText = originalName.value.length+" / "+originalName.maxLength;
        }
    });

    // Description
    const originalDescription = document.querySelector('textarea#originalDescription');
    const originalDescriptionCharDisplay = document.querySelector('span#originalDescriptionCharCounter');
    originalDescription.value = originalProduct.description;

    Meteor.call('getRuleValue', {rulePath: 'Rules.product.description'}, function(error, result){
        if(error){
            // There is an error
            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
        } else{
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

    // Cover image
    const originalCoverImageDisplay = document.querySelector('img#originalCoverImage');
    const originalCoverImageId = originalProduct.images[0];
    const originalCoverImageUrl = Images.findOne({_id: originalCoverImageId}).url();
    originalCoverImageDisplay.src = originalCoverImageUrl;
});

Template.editProductModeration.helpers({
    nameDifference: function(){
        const originalProduct = Session.get('editProductModeration').originalProduct;
        const editedProduct = Session.get('editProductModeration').editedProduct;
        if(originalProduct.name !== editedProduct.name){
            return true;
        }
        return false;
    },
    displayEditedName: function(){
        const editedProduct = Session.get('editProductModeration').editedProduct;

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
        return [editedProduct.name];
    },
    descriptionDifference: function(){
        const originalProduct = Session.get('editProductModeration').originalProduct;
        const editedProduct = Session.get('editProductModeration').editedProduct;
        if(originalProduct.description !== editedProduct.description){
            return true;
        }
        return false;
    },
    displayEditedDescription: function(){
        const editedProduct = Session.get('editProductModeration').editedProduct;
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

        return [editedProduct.description];
    },
    coverImageDifference: function(){
        const originalCoverImage = Session.get('editProductModeration').originalProduct.images[0];
        const editedCoverImage = Session.get('editProductModeration').editedProduct.images[0];
        if(originalCoverImage !== editedCoverImage){
            return true;
        }
        return false;
    },
    displayEditedCoverImage: function(){
        const editedCoverImage = Session.get('editProductModeration').editedProduct.images[0];
        const editedCoverImageUrl = Images.findOne({_id: editedCoverImage}).url();
        return [editedCoverImageUrl];
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
        // Comparing elements to see if there's any difference to display
        const areElementsDifferent = (originalImages.toString() !== editedImages.toString());
        return areElementsDifferent;
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
        // Comparing elements (return a boolean)
        const areElementsDifferent = (originalCategories.toString() !== editedCategories.toString());
        return areElementsDifferent;
    },
    displayEditedCategories: function(){
        return Session.get('editProductModeration').editedProduct.categories;
    },
    displayWebsite: function(){
        return [Session.get('editProductModeration').originalProduct.website];
    },
    websiteDifference: function(){
        // Catching websites
        const originalWebsite = Session.get('editProductModeration').originalProduct.website;
        const editedWebsite = Session.get('editProductModeration').editedProduct.website;
        // Comparing elements (return a boolean)
        const areElementsDifferent = (originalWebsite !== editedWebsite);
        return areElementsDifferent;
    },
    displayEditedWebsite: function(){
        return [Session.get('editProductModeration').editedProduct.website]
    }
});


Template.editProductModeration.events({
    'click #rejectModifications'(event){
        event.preventDefault();
        // Catching the moderationId
        const moderationId = Session.get('editProductModeration').moderationId;
        Meteor.call('moderationRejected', {moderationId: moderationId}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                var navigation = Session.get('navigation');  // Catching navigation history
                navigation.push(Session.get('page'));  // Adding the current page
                Session.set('navigation', navigation);  // Updating the value
                Session.set('page', 'collectiveModeration');
            }
        });
    },
    'click #approveModifications'(event){
        event.preventDefault();
        // Catching the moderationId
        const moderationId = Session.get('editProductModeration').moderationId;

        Meteor.call('moderationAccepted', {moderationId: moderationId}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                var navigation = Session.get('navigation');  // Catching navigation history
                navigation.push(Session.get('page'));  // Adding the current page
                Session.set('navigation', navigation);  // Updating the value
                Session.set('page', 'collectiveModeration');
            }
        });
    }
});


Template.editProductModeration.onDestroyed(function(){
    // Reinitializing Session variable
    Session.set('editProductModeration', null);
});