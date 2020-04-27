// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Products } from '../databases/products.js';
import { Images } from '../databases/images.js';
import { Contributions } from '../databases/contributions.js';
import { Moderation } from '../databases/moderation.js';
import { EditedProducts } from '../databases/editedProducts.js';

// HTML import
import './editProduct.html';

// CSS import
import './css/form.css';

Session.set('editedCoverImageId', null);
Session.set('editedOtherImagesId', []);

Template.editProduct.onRendered(function(){

    // Filling the fields with product's informations :

    // Catching product's informations
    var productId = Session.get('currentProductID');
    var product = Products.findOne({_id: productId});

    Meteor.call('getRuleValue', {rulePath: 'Rules.product'}, function(error, result){
        if(result){
            // The rule was returned succesfully, we apply it

            // Defining product name constants
            const productNameInput = document.querySelector('input#name');
            const nameCharDisplay = document.querySelector('span#nameCharCounter');
            productNameInput.value = product.name;  // Setting the input value with the current product name
            // Setting input min and max length
            productNameInput.minLength = result.name.minLength;
            productNameInput.maxLength = result.name.maxLength;
            // Displaying char counter and creating an event listener
            nameCharDisplay.innerText = productNameInput.value.length+" / "+productNameInput.maxLength;
            productNameInput.oninput = function(){
                // When a char is added or removed, updating the displayed value
                nameCharDisplay.innerText = productNameInput.value.length+" / "+productNameInput.maxLength;
            }

            // Defining product description constants
            const productDescriptionInput = document.querySelector('textarea#description');
            const descriptionCharDisplay = document.querySelector('span#descriptionCharCounter');
            productDescriptionInput.value = product.description;  // Setting the input value with the current product description
            // Auto expand the field to display the text correctly
            // Sending mandatory informations only to preserve server resources
            fieldForServer = {value: productDescriptionInput.value, scrollHeight: productDescriptionInput.scrollHeight};
            Meteor.call('autoExpand', {field:fieldForServer}, function(error, result){
                if(!error && result){
                    productDescriptionInput.style.height = result;  // Result is the height to apply to the field
                }
            });
            // Setting input min and max length
            productDescriptionInput.minLength = result.description.minLength;
            productDescriptionInput.maxLength = result.description.maxLength;
            // Displaying char counter and creating an event listener
            descriptionCharDisplay.innerText = productDescriptionInput.value.length+" / "+productDescriptionInput.maxLength;
            productDescriptionInput.oninput = function(){
                // When a char is added or removed, updating the displayed value
                descriptionCharDisplay.innerText = productDescriptionInput.value.length+" / "+productDescriptionInput.maxLength;
                // Auto expand the field to display the text correctly
                // Sending mandatory informations only to preserve server resources
                fieldForServer = {value: productDescriptionInput.value, scrollHeight: productDescriptionInput.scrollHeight};
                Meteor.call('autoExpand', {field:fieldForServer}, function(error, result){
                    if(!error && result){
                        productDescriptionInput.style.height = result;  // Result is the height to apply to the field
                    }
                });
            }

            // Defining cover image constants
            const coverImageInput = document.querySelector('input#coverImage');  // Saving input in a variable
            const coverImageNumberDisplay = document.querySelector('span.coverImage.file-name');  // Catching the file number display
            // Setting current cover image
            var coverImageId = product.images.splice(0, 1)[0];  // Cover image Id is the first (splice remove it from the list so we can use it after for other images)
            Session.set('coverImageId', coverImageId);  // Setting the reactive variable with this value
            Session.set('editedCoverImageId', coverImageId);  // For the moment, the cover image of the edited product is the same than the actual product
            // Displaying file counter and creating an event listener
            if(Session.get('editedCoverImageId') === null){
                coverImageNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
            } else if(Session.get('editedCoverImageId')){
                coverImageNumberDisplay.textContent = "1 fichier sélectionné";  // Updating displayed value
            }
            coverImageInput.onchange = function(){
                if(coverImageInput.files.length === 0 && Session.get('editedCoverImageId') === null){
                    coverImageNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
                } else{
                    // There is at least one uploaded file, we transform them to pass it to the server (File object can't be pass)
                    var serverFiles = [];
                    for(file of coverImageInput.files){
                        serverFiles.push({size: file.size, type: file.type});
                    }
                    Meteor.call('checkProductCoverImageInput', {files: serverFiles}, function(error, result){
                        if(error){
                            // There is an error
                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                        } else{
                            // File input is correct
                            coverImageNumberDisplay.textContent = "1 fichier sélectionné";  // Updating displayed value
                            if(Session.get('editedCoverImageId')){
                                // There was already a cover image and it was replaced
                                if(Session.get('editedCoverImageId') !== Session.get('coverImageId')){
                                    // The replaced cover image wasn't the one of the actual product, we can delete it
                                    Images.remove(Session.get('editedCoverImageId'));  // Remove the old image from the db
                                }
                                Session.set('editedCoverImageId', null);  // Reseting the value of the cover image
                            }
                            Images.insert(coverImageInput.files[0], function(error, fileObj){
                                if(!error){
                                    Session.set('editedCoverImageId', fileObj._id);
                                }
                            });
                        }
                    });
                }
            }

            // Defining other images constants
            const imagesInput = document.querySelector('input#images');  // Saving input in a variable
            const imagesNumberDisplay = document.querySelector('span.images.file-name');  // Catching the file number display to update the value
            Session.set('otherImagesId', product.images);  // Set the original product other images
            Session.set('editedOtherImagesId', product.images);  // For the moment, the images of the edited product are the same than the actual product
            // Displaying file counter and creating an event listener
            if(product.images.length === 0){
                imagesNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
            } else if(product.images.length === 1){
                imagesNumberDisplay.textContent = "1 fichier sélectionné";  // Updating displayed value
            } else{
                // At least 2 files
                imagesNumberDisplay.textContent = product.images.length + " fichiers sélectionnés";  // Updating displayed value
            }
            // Event listener
            imagesInput.onchange = function(){
                if(imagesInput.files.length >= 1){
                    // There is at least one uploaded file, we transform them to pass it to the server (File object can't be pass)
                    var serverFiles = [];
                    for(file of imagesInput.files){
                        serverFiles.push({size: file.size, type: file.type});
                    }
                    Meteor.call('checkProductOtherImagesInput', {files: serverFiles, numberOfUploadedImages: Session.get('editedOtherImagesId').length}, function(error, result){
                        if(error){
                            // There is an error
                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                        } else{
                            // Files are correct, adding them to the db
                            for(var image of imagesInput.files){
                                Images.insert(image, function(error, fileObj){
                                    if(!error){
                                        var otherImagesId = Session.get('editedOtherImagesId');  // Catching the array of images
                                        otherImagesId.push(fileObj._id)  // Adding it the new image
                                        Session.set('editedOtherImagesId', otherImagesId);  // Updating the value
                                        if(otherImagesId.length === 1){
                                            imagesNumberDisplay.textContent = "1 fichier sélectionné";  // Updating displayed value
                                        } else{
                                            // At least 2 files
                                            imagesNumberDisplay.textContent = otherImagesId.length + " fichiers sélectionnés";  // Updating displayed value
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else{
                    imagesNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
                }
            }
        }
    });


    // Categories
    Session.set('selectedCategories', product.categories);  // Updating the selected categories with product's ones
    var selectedCategories = product.categories;  // Catching the array of categories that are already selected
    for(var category of selectedCategories){
        // Adding the tag for each category
        var newElement = document.createElement("div");  // Creating a new element to contain the tag
        newElement.className = "control";  // Adding a class for a better display
        // Adding the tag in the div :
        newElement.innerHTML = '<div class="tags has-addons"> <a class="tag is-link">'+category+'</a> <a class="tag is-delete"></a> </div>';
        document.getElementById("categoryTags").appendChild(newElement);  // Inserting it in the category tags container
    }
    const select = document.querySelector("select#categories");  // Catching the select element
    select.onchange = function(){
        var selectedCategories = Session.get('selectedCategories');  // Catching the array of categories that are already selected
        var selectedOption = select.value;  // Catch the value attribute of the selected option
        if(selectedOption !== 'add' && !selectedCategories.includes(selectedOption)){
            // The selected option isn't the default one and isn't already selected, displaying the category tag
            var newElement = document.createElement("div");  // Creating a new element to contain the tag
            newElement.className = "control";  // Adding a class for a better display
            // Adding the tag in the div :
            newElement.innerHTML = '<div class="tags has-addons"> <a class="tag is-link">'+selectedOption+'</a> <a class="tag is-delete"></a> </div>';
            document.getElementById("categoryTags").appendChild(newElement);  // Inserting it in the category tags container
            selectedCategories.push(selectedOption);  // Adding the category to the selected ones
            Session.set('selectedCategories', selectedCategories);  // Updating the value of the Session variable
        }
        select.value = 'add';  // Reseting the select with the default value
    }


});


Template.editProduct.helpers({
    displayCoverImage: function(){
        // Display the cover image
        var coverImageId = Session.get('editedCoverImageId');  // Catching the image id
        return Images.find({_id: coverImageId})  // Find and return the corresponding image in the db
    },
    displayOtherImages: function(){
        // Display the other images
        var otherImagesId = Session.get('editedOtherImagesId');  // Catching the array of images id
        var otherImages = [];
        for(var imageId of otherImagesId){
            // For each image id, we add it to the images array
            otherImages.push(Images.findOne({_id: imageId}));
        }
        return otherImages;
    }
});


Template.editProduct.events({
    'click a.tag.is-delete'(event){
        // Link to delete a category tag is cliked
        event.preventDefault();
        var selectedCategories = Session.get('selectedCategories');  // Catching the array of categories that are already selected
        // Catching the grand parent element of the delete link (delete link is inside tags div which is inside a control div) :
        var tagToRemove = event.currentTarget.parentElement.parentElement;
        // The catagory to remove is the text content of the tag (control div's first elem is tags div, and it's first elem is the tag) :
        var categoryToRemove = tagToRemove.firstElementChild.firstElementChild.innerText;
        var index = selectedCategories.indexOf(categoryToRemove);  // Catching the index of the category to delete
        selectedCategories.splice(index, 1);  // Removing the category
        Session.set('selectedCategories', selectedCategories);  // Updating the value of the Session variable
        tagToRemove.parentNode.removeChild(tagToRemove);  // Removing the tag
    },
    'click div.cover-image button.delete'(event){
        // When the delete button of a cover image is clicked
        event.preventDefault();
        document.querySelector('input#coverImage').value = null;  // Reset the value of the input
        document.querySelector('span.coverImage.file-name').textContent = "Aucun fichier sélectionné";  // Updating displayed value
        if(Session.get('editedCoverImageId') !== Session.get('coverImageId')){
            // The deleted cover image wasn't the one of the original product, we can delete it
            Images.remove(Session.get('editedCoverImageId'));
        }
        Session.set('editedCoverImageId', null);  // Update cover image id
    },
    'click div.other-image button.delete'(event){
        // When the delete button of an other image is clicked
        event.preventDefault();
        var imageId = event.currentTarget.parentElement.id;  // Current image id is the id of the container (parent element)
        if(!Session.get('otherImagesId').includes(imageId)){
            // This image wasn't one of the real product, we can delete it
            Images.remove(imageId);  // Remove the image from the db
        }
        var otherImagesId = Session.get('editedOtherImagesId');  // Catch the array of images
        var index = otherImagesId.indexOf(imageId);
        if(index !== -1){
            otherImagesId.splice(index, 1);  // Removing the image id
        }
        Session.set('editedOtherImagesId', otherImagesId);  // Updating the value
        const imagesNumberDisplay = document.querySelector('span.images.file-name');  // Catching the file number display to update the value
        if(otherImagesId.length === 0){
            imagesNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
        } else if(otherImagesId.length === 1){
            imagesNumberDisplay.textContent = "1 fichier sélectionné";  // Updating displayed value
        } else{
            // At least 2 files
            imagesNumberDisplay.textContent = otherImagesId.length + " fichiers sélectionnés";  // Updating displayed value
        }
    },
    'click #submitModifications'(event){
        event.preventDefault();
        var form = new FormData(document.querySelector('form#editProduct'));
        var formErrors = 0;  // No error for the moment
        var callbacksPending = 0;  // No callback is pending for the moment

        // Catching and formatting product name
        var productName = form.get('name');
        productName.slice(0, 70);  // TODO: Remplacer par la rule

        // Catching and formatting product description
        var productDescription = form.get('description');
        productDescription.slice(0, 1000);  // TODO: Remplacer par la rule
        
        // Description is correct, checking the images
        if(Images.findOne({_id: Session.get('editedCoverImageId')})){
            // Cover image is in the db, checking the images
            var otherImagesId = Session.get('editedOtherImagesId');
            var correctImages = 0;
            for(var imageId of otherImagesId){
                // For each image id, checking if it's in the db
                if(Images.findOne({_id: imageId})){
                    correctImages++;
                }
            }
            if(correctImages === Session.get('editedOtherImagesId').length){
                // All images are correct, catching categories
                var selectedCategories = Session.get('selectedCategories');  // Catching the array of categories that are already selected
                var originalProduct = Products.findOne({_id: Session.get('currentProductID')});
                // Inserting informations in the database :
                callbacksPending++;  // Starting a call with a callback function
                EditedProducts.insert({
                    originalId: originalProduct._id,
                    name: productName,
                    description: productDescription,
                    images: [],
                    score: originalProduct.score,
                    categories: selectedCategories
                }, function(error, addedProductId){
                        if(!error){
                            // The product was successfully added, now let's add the images id
                            var editedProductImages = EditedProducts.findOne({_id: addedProductId}).images;  // Catching the product images IDs array
                            var editedCoverImage = Session.get('editedCoverImageId');
                            var editedOtherImages = Session.get('editedOtherImagesId');
                            editedProductImages.push(editedCoverImage);  // Adding the cover image to the array
                            for(var imageId of editedOtherImages){
                                // For each image, adding it to the array
                                editedProductImages.push(imageId);
                            }
                            // Updating the db with the new array
                            EditedProducts.update(addedProductId, { $set: {
                                images: editedProductImages
                            }});
                            callbacksPending++;  // Starting a call with a callback function
                            // Adding the product to the moderation database
                            Moderation.insert({
                                userId: Meteor.userId(),
                                elementId: Session.get('currentProductID'),
                                reason: "editProduct"
                            }, function(error, addedModerationId){
                                if(!error){
                                    // The new product was successfully inserted in moderation, adding the corresponding contribution to the user
                                    Contributions.insert({
                                        userId: Meteor.userId(),
                                        type: 'Proposition de modifications',
                                        elementId: addedProductId,
                                        createdAt: new Date().toISOString(),
                                        moderationId: addedModerationId,
                                        points: 10
                                    });
                                } else{
                                    // There was an error while adding the moderation
                                    formErrors++;
                                }
                                callbacksPending--;  // End of callback function
                            });
                        } else{
                            // There was an error while adding the product
                            formErrors++;
                        }
                        callbacksPending--;  // End of callback function
                    }
                );
            }
        } else{
            // Other images doesn't match all criteria
            formErrors++;
        }


        // Waiting for all callbacks to complete (to see if an error is raised)
        var intervalId = setInterval(function(){
            if(callbacksPending === 0 && formErrors === 0){
                // All callbacks were completed without any error, displaying a success message
                Session.set('message', {type: "header", headerContent: "Proposition de modification effectuée", style:"is-success"} );
                Session.set('page', 'productPage');
                clearInterval(intervalId);  // This interval is not required anymore, removing it
            }
        }, 200);
    }
});


Template.addProduct.onDestroyed(function(){
    // Selected categories' Session variable isn't useful anymore, deleting it
    delete Session.keys.selectedCategories;
    // TODO: Si template fermé sans submit le form, supprimer les images edited qui ne sont pas dans les normales de la db
    Session.set('coverImageId', null);
    Session.set('editedCoverImageId', null);
    Session.set('otherImagesId', []);
    Session.set('editedOtherImagesId', []);
});
