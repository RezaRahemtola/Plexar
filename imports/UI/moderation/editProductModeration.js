// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Database import
import { Images } from '../../databases/images.js';

// HTML import
import './editProductModeration.html';

// Initializing Session variables
Session.set('editProductModeration', null);


FlowRouter.route('/collectiveModeration/editedProduct/:_id', {
    name: 'collectiveModerationEditedProduct',
    action(params, queryParams){
        // Render a template using Blaze
        BlazeLayout.render('main', {currentPage: 'editProductModeration'});
        // Scrolling the window back to the top
        window.scrollTo(0, 0);
    }
});


Template.editProductModeration.onRendered(function(){
    // Filling fields
    const originalProduct = Session.get('editProductModeration').originalProduct;

    // Name
    const originalName = document.querySelector('input#originalName');
    const originalNameCharDisplay = document.querySelector('span#originalNameCharCounter');
    originalName.value = originalProduct.name;
    Meteor.call('getProductNameRules', function(error, result){
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

    Meteor.call('getProductDescriptionRules', function(error, result){
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
    const originalCoverImageLink = Images.findOne({_id: originalCoverImageId}).link();
    originalCoverImageDisplay.src = originalCoverImageLink;
});

Template.editProductModeration.helpers({
    nameDifference: function(){
        // Check if the name is different in original & edited product and return a boolean
        const originalProduct = Session.get('editProductModeration').originalProduct;
        const editedProduct = Session.get('editProductModeration').editedProduct;
        return (originalProduct.name !== editedProduct.name);
    },
    displayEditedName: function(){
        const editedProduct = Session.get('editProductModeration').editedProduct;

        Meteor.call('getProductNameRules', function(error, result){
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
        return editedProduct.name;
    },
    descriptionDifference: function(){
        // Check if the description is different in original & edited product and return a boolean
        const originalProduct = Session.get('editProductModeration').originalProduct;
        const editedProduct = Session.get('editProductModeration').editedProduct;
        return (originalProduct.description !== editedProduct.description);
    },
    displayEditedDescription: function(){
        const editedProduct = Session.get('editProductModeration').editedProduct;
        Meteor.call('getProductDescriptionRules', function(error, result){
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

        return editedProduct.description;
    },
    coverImageDifference: function(){
        // Check if the cover image is different in original & edited product and return a boolean
        const originalCoverImage = Session.get('editProductModeration').originalProduct.images[0];
        const editedCoverImage = Session.get('editProductModeration').editedProduct.images[0];
        return (originalCoverImage !== editedCoverImage);
    },
    displayEditedCoverImage: function(){
        const editedCoverImage = Session.get('editProductModeration').editedProduct.images[0];
        return Images.findOne({_id: editedCoverImage}).link();
    },
    displayOtherImages: function(){
        // Catching the original product's images
        const originalImages = Session.get('editProductModeration').originalProduct.images;
        // Removing the first image (cover image)
        originalImages.splice(0, 1);
        var originalImagesUrl = [];
        for(var imageId of originalImages){
            // For each image id, we add it to the images array
            originalImagesUrl.push(Images.findOne({_id: imageId}).link());
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
            editedImagesUrl.push(Images.findOne({_id: imageId}).link());
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
        return Session.get('editProductModeration').originalProduct.website;
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
        return Session.get('editProductModeration').editedProduct.website;
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
                FlowRouter.go('/collectiveModeration');  // Switching to moderation page
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
                FlowRouter.go('/collectiveModeration');  // Switching to collective moderation page
            }
        });
    }
});


Template.editProductModeration.onDestroyed(function(){
    // Reinitializing Session variable
    Session.set('editProductModeration', null);
});
