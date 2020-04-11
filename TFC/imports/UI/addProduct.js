// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Products } from '../databases/products.js';
import { Images } from '../databases/images.js';
import { Contributions } from '../databases/contributions.js';
import { Moderation } from '../databases/moderation.js';

// HTML import
import './addProduct.html';

// CSS import
import './css/form.css';

// JS import
import './functions/checkInputs.js';


Template.addProduct.onRendered(function(){
    if(Meteor.user()){
        const productNameInput = document.querySelector('input#name');
        const nameCharDisplay = document.querySelector('span#nameCharCounter');
        nameCharDisplay.innerText = productNameInput.value.length+" / "+productNameInput.maxLength;
        productNameInput.oninput = function(){
            nameCharDisplay.innerText = productNameInput.value.length+" / "+productNameInput.maxLength;
        }

        const productDescriptionInput = document.querySelector('textarea#description');
        const descriptionCharDisplay = document.querySelector('span#descriptionCharCounter');
        descriptionCharDisplay.innerText = productDescriptionInput.value.length+" / "+productDescriptionInput.maxLength;
        productDescriptionInput.oninput = function(){
            descriptionCharDisplay.innerText = productDescriptionInput.value.length+" / "+productDescriptionInput.maxLength;
            autoExpand(productDescriptionInput);
        }


        Session.set('coverImageId', null);
        // Code to update file name from https://bulma.io/documentation/form/file/
        const coverImageInput = document.querySelector('input#coverImage');  // Saving input in a variable
        const coverImageNumberDisplay = document.querySelector('span.coverImage.file-name');  // Catching the file number display
        coverImageInput.onchange = function(){
            if(coverImageInput.files.length === 0){
                coverImageNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
            } else if(coverImageInput.files.length === 1){
                if(checkFileInput(files=coverImageInput.files, minLength=1, maxLength=1, type='image', maxMBSize=5)){
                    // File input is correct
                    coverImageNumberDisplay.textContent = "1 fichier sélectionné";  // Updating displayed value
                    if(Session.get('coverImageId')){
                        // There was already a cover image and it was replaced
                        Images.remove(Session.get('coverImageId'));  // Remove the old image from the db
                        Session.set('coverImageId', null);
                    }
                    Images.insert(coverImageInput.files[0], function(error, fileObj){
                        if(!error){
                            Session.set('coverImageId', fileObj._id);
                        }
                    });
                }
            }
        }

        Session.set('otherImagesId', []);
        // Code to update file name from https://bulma.io/documentation/form/file/
        const imagesInput = document.querySelector('input#images');  // Saving input in a variable
        const imagesNumberDisplay = document.querySelector('span.images.file-name');  // Catching the file number display
        imagesInput.onchange = function(){
            if(imagesInput.files.length >= 1){
                // There is at least one uploaded file
                if(checkFileInput(files=imagesInput.files, minLength=0, maxLength=4-Session.get('otherImagesId').length, type='image', maxMBSize=5)){
                    // Files are correct, adding them to the db
                    for(var image of imagesInput.files){
                        Images.insert(image, function(error, fileObj){
                            if(!error){
                                var otherImagesId = Session.get('otherImagesId');  // Catching the array of images
                                otherImagesId.push(fileObj._id)  // Adding it the new image
                                Session.set('otherImagesId', otherImagesId);  // Updating the value
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
            } else{
                imagesNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
            }
        }

        // Dynamically check and show selected categories
        var selectedCategories = [];  // Creating a array to store the categories
        Session.set('selectedCategories', selectedCategories);  // Saving it in a Session variable to allow removing from events

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
    }
});


Template.addProduct.helpers({
    displayCoverImage: function(){
        // Display the cover image
        var coverImageId = Session.get('coverImageId');  // Catchin the image id
        return Images.find({_id: coverImageId})  // Find the image url in the db
    },
    displayOtherImages: function(){
        // Display the other images
        var otherImagesId = Session.get('otherImagesId');  // Catching the array of images id
        var otherImages = [];
        for(var imageId of otherImagesId){
            // For each image id, we display it if it's not already displayed and if it hasn't been removed of the db by the delete button
            otherImages.push(Images.findOne({_id: imageId}));
        }
        return otherImages;
    }
});


Template.addProduct.events({
    'click button#addProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newProduct'));
        var formErrors = 0;  // No error for the moment
        var callbacksPending = 0;  // No callback is pending for the moment

        // Check if the name is correctly formatted
        var productName = form.get('name');
        var currentInput = document.querySelector('input#name');
        if(checkTextInput(text=productName, minLength=currentInput.minLength, maxLength=currentInput.maxLength)){
            // Product name is correct, checking the description
            var productDescription = form.get('description');
            currentInput = document.querySelector('textarea#description');
            if(checkTextInput(text=productDescription, minLength=currentInput.minLength, maxLength=currentInput.maxLength)){
                // Description is correct, checking the images
                if(Images.findOne({_id: Session.get('coverImageId')})){
                    // Cover image is in the db, checking other images
                    var otherImagesId = Session.get('otherImagesId');
                    var correctImages = 0;
                    for(var imageId of otherImagesId){
                        // For each image id, checking if it's in the db
                        if(Images.findOne({_id: imageId})){
                            correctImages++;
                        }
                    }
                    if(correctImages === Session.get('otherImagesId').length){
                        // Files are correct, catching categories
                        var selectedCategories = Session.get('selectedCategories');   // Catching the array of categories that are already selected
                        // Inserting informations in the database :
                        callbacksPending++;  // Starting a call with a callback function
                        Products.insert({
                            name: productName,
                            description: productDescription,
                            imagesID: [],
                            score: 0,
                            categories: selectedCategories
                        }, function(error, addedProductID){
                                if(!error){
                                    // The product was successfully added, now let's add the images id
                                    var productImagesId = Products.findOne({_id: addedProductID}).imagesID;  // Catching the product images IDs array
                                    var coverImageId = Session.get('coverImageId');
                                    var otherImagesId = Session.get('otherImagesId');
                                    productImagesId.push(coverImageId);  // Adding the cover image to the array
                                    for(var imageId of otherImagesId){
                                        // For each image, adding it to the array
                                        productImagesId.push(imageId);
                                    }
                                    // Updating the db with the new array
                                    Products.update(addedProductID, { $set: {
                                        imagesID: productImagesId
                                    }});
                                    callbacksPending++;  // Starting a call with a callback function
                                    // Adding the product to the moderation database
                                    Moderation.insert({
                                        userId: Meteor.userId(),
                                        elementId: addedProductID,
                                        reason: "newProduct"
                                    }, function(error, addedModerationId){
                                        if(!error){
                                            // The new product was successfully inserted in moderation, adding the corresponding contribution to the user
                                            Contributions.insert({
                                                userId: Meteor.userId(),
                                                type: 'Ajout',
                                                elementId: addedProductID,
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
            } else{
                // Product description doesn't match all criteria
                formErrors++;
            }
        } else{
            // Product name doesn't match all criteria
            formErrors++;
        }


        // Waiting for all callbacks to complete (to see if an error is raised)
        var intervalID = setInterval(function(){
            if(callbacksPending === 0 && formErrors === 0){
                // All callbacks were completed without any error, displaying a success message
                Session.set('message', {type: "header", headerContent: "Produit ajouté avec succès !", style:"is-success"} );
                Session.set('page', 'home');
                clearInterval(intervalID);  // This interval is not required anymore, removing it
            }
        }, 200);
    },
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
        Images.remove(event.currentTarget.parentElement.id);  // Remove the image from the db
        Session.set('coverImageId', null);  // Update cover image id
    },
    'click div.other-image button.delete'(event){
        // When the delete button of an other image is clicked
        event.preventDefault();
        var imageId = event.currentTarget.parentElement.id;  // Current image id is the id of the container (parent element)
        Images.remove(imageId);  // Remove the image from the db
        var otherImagesId = Session.get('otherImagesId');  // Catch the array of images
        var index = otherImagesId.indexOf(imageId);
        if(index !== -1){
            otherImagesId.splice(index, 1);  // Removing the image id
        }
        Session.set('otherImagesId', otherImagesId);  // Updating the value
        const imagesNumberDisplay = document.querySelector('span.images.file-name');  // Catching the file number display to update the value
        if(otherImagesId.length === 0){
            imagesNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
        } else if(otherImagesId.length === 1){
            imagesNumberDisplay.textContent = "1 fichier sélectionné";  // Updating displayed value
        } else{
            // At least 2 files
            imagesNumberDisplay.textContent = otherImagesId.length + " fichiers sélectionnés";  // Updating displayed value
        }
    }
});


Template.addProduct.onDestroyed(function(){
    // Selected categories' Session variable isn't useful anymore, deleting it
    delete Session.keys.selectedCategories;
    // TODO: Si template fermé sans submit le form, supprimer les images de la db
    Session.set('coverImageId', null);
    Session.set('otherImagesId', []);
});
