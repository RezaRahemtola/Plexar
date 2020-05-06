// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Images } from '../databases/images.js';

// HTML import
import './addProduct.html';

// CSS import
import './css/form.css';


Template.addProduct.onRendered(function(){
    if(Meteor.user()){
        // User is logged in, creating all dynamic functions

        Meteor.call('getRuleValue', {rulePath: 'Rules.product'}, function(error, result){
            if(result){
                // The rule was returned succesfully, we apply it
                const productRules = result;  // Carching product rules

                // Defining product name constants
                const productNameInput = document.querySelector('input#name');
                const nameCharDisplay = document.querySelector('span#nameCharCounter');
                // Setting input min and max length
                productNameInput.minLength = productRules.name.minLength;
                productNameInput.maxLength = productRules.name.maxLength;
                // Displaying char counter and creating an event listener
                nameCharDisplay.innerText = productNameInput.value.length+" / "+productNameInput.maxLength;
                productNameInput.oninput = function(){
                    // When a char is added or removed, updating the displayed value
                    nameCharDisplay.innerText = productNameInput.value.length+" / "+productNameInput.maxLength;
                }

                // Defining product description constants
                const productDescriptionInput = document.querySelector('textarea#description');
                const descriptionCharDisplay = document.querySelector('span#descriptionCharCounter');
                // Setting input min and max length
                productDescriptionInput.minLength = productRules.description.minLength;
                productDescriptionInput.maxLength = productRules.description.maxLength;
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
                // Setting input min and max length
                coverImageInput.minLength = productRules.coverImage.minLength;
                coverImageInput.maxLength = productRules.coverImage.maxLength;
                // Reset cover image Id
                Session.set('coverImageId', null);
                // Code to update file name from https://bulma.io/documentation/form/file/
                coverImageInput.onchange = function(){
                    if(coverImageInput.files.length === 0 && Session.get('coverImageId') === null){
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
                                if(Session.get('coverImageId')){
                                    // There was already a cover image and it was replaced, removing the old image from the database
                                    Meteor.call('removeImage', {imageId: Session.get('coverImageId')}, function(error, result){
                                        if(error){
                                            // There was an error
                                            Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                                        } else{
                                            Session.set('coverImageId', null);  // Reset the Id
                                        }
                                    });
                                }
                                Images.insert(coverImageInput.files[0], function(error, fileObj){
                                    if(!error){
                                        // The image was succesfully inserted, we can set the cover image Id with the new one
                                        Session.set('coverImageId', fileObj._id);
                                    }
                                });
                            }
                        });
                    }
                }

                // Defining other images constants
                const imagesInput = document.querySelector('input#images');  // Saving input in a variable
                const imagesNumberDisplay = document.querySelector('span.images.file-name');  // Catching the file number display
                Session.set('otherImagesId', []);  // Set an empty array for images id
                // Code to update file name from https://bulma.io/documentation/form/file/
                imagesInput.onchange = function(){
                    if(imagesInput.files.length >= 1){
                        // There is at least one uploaded file, transform it to pass it to the server (File object can't be pass)
                        var serverFiles = [];
                        for(file of imagesInput.files){
                            serverFiles.push({size: file.size, type: file.type});
                        }
                        Meteor.call('checkProductOtherImagesInput', {files: serverFiles, numberOfUploadedImages: Session.get('otherImagesId').length}, function(error, result){
                            if(error){
                                // There is an error
                                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                            } else{
                                // Files are correct, adding them to the db
                                for(var image of imagesInput.files){
                                    Images.insert(image, function(error, fileObj){
                                        if(!error){
                                            // Image was succesfully inserted
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
                        });
                    } else{
                        imagesNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
                    }
                }
            }
        });


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

        // Live website validation
        const websiteInput = document.querySelector('input#website');
        websiteInput.onchange = function(){
            if(websiteInput.value === ""){
                // User has removed his input, deleting error messages
                $('input#website').removeClass("is-danger");
                document.querySelector('#websiteField p.help.is-danger').textContent = "";
            } else{
                Meteor.call('checkUrlInput', {url: websiteInput.value}, function(error, result){
                    if(error){
                        // There was an error
                        Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                    } else if(!result){
                        // Value isn't a valid url adress
                        $('input#website').addClass("is-danger");
                        document.querySelector('#websiteField p.help.is-danger').textContent = "Veuillez entrer un lien valide";  // Adding a danger help message
                    } else if(result){
                        // Value is a valid url adress, removing error messages
                        $('input#website').removeClass("is-danger");
                        document.querySelector('#websiteField p.help.is-danger').textContent = "";
                    }
                });
            }
        }
    }
});


Template.addProduct.helpers({
    displayCoverImage: function(){
        return Images.find({_id: Session.get('coverImageId')})  // Find and return the corresponding image in the db
    },
    displayOtherImages: function(){
        // Display the other images
        var otherImagesId = Session.get('otherImagesId');  // Catching the array of images id
        var otherImages = [];
        for(var imageId of otherImagesId){
            // For each image id, we add it to the images array
            otherImages.push(Images.findOne({_id: imageId}));
        }
        return otherImages;
    },
    displayCategories: function(){
        // Display available categories
        Meteor.call('getCategories', function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else{
                Session.set('productCategories', result);
            }
        });
        return Session.get('productCategories');
    }
});


Template.addProduct.events({
    'click button#addProduct'(event){
        event.preventDefault();

        // Catching inputs :
        const form = new FormData(document.getElementById('newProduct'));
        const productName = form.get('name');
        const productDescription = form.get('description');
        const coverImage = Session.get('coverImageId');
        const otherImages = Session.get('otherImagesId');
        const categories = Session.get('selectedCategories');
        const website = form.get('website');

        Meteor.call('addNewProduct', {productName: productName, productDescription: productDescription, coverImage: coverImage, otherImages: otherImages, categories: categories, website: website}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:'header', headerContent:error.reason, style:"is-danger"});
            } else{
                // Product was inserted without any error, displaying a success message
                Session.set('message', {type: "header", headerContent: "Produit ajouté avec succès !", style:"is-success"} );
                var navigation = Session.get('navigation');  // Catching navigation history
                navigation.push(Session.get('page'));  // Adding the current page
                Session.set('navigation', navigation);  // Updating the value
                Session.set('page', 'home');
            }
        });
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
        const imageId = event.currentTarget.parentElement.id;
        Meteor.call('removeImage', {imageId: imageId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                Session.set('coverImageId', null);  // Reset the Id
            }
        });
    },
    'click div.other-image button.delete'(event){
        // When the delete button of an other image is clicked
        event.preventDefault();
        const imageId = event.currentTarget.parentElement.id;  // Current image id is the id of the container (parent element)
        Meteor.call('removeImage', {imageId: imageId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
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
    }
});


Template.addProduct.onDestroyed(function(){
    // Selected categories' Session variable isn't useful anymore, deleting it
    delete Session.keys.selectedCategories;
    // TODO: Si template fermé sans submit le form, supprimer les images de la db
    Session.set('coverImageId', null);
    Session.set('otherImagesId', []);
});
