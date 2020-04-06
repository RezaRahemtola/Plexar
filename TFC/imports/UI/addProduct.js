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


        // Code to update file name from https://bulma.io/documentation/form/file/
        const filesInput = document.querySelector('input#pictures');  // Saving input in a variable
        const filesNumberDisplay = document.querySelector('span.file-name');  // Catching the file number display
        filesInput.onchange = function(){
            if(filesInput.files.length === 0){
                filesNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
            } else if(filesInput.files.length === 1){
                filesNumberDisplay.textContent = filesInput.files.length + " fichier sélectionné";  // Updating displayed value
            } else{
                // At least 2 files
                filesNumberDisplay.textContent = filesInput.files.length + " fichiers sélectionnés";  // Updating displayed value
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
                // Description is correct, checking the file upload
                var files = document.querySelector('input#pictures').files;
                if(checkFileInput(files=files, minLength=1, maxLength=5, type='image', maxMBSize=5)){
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
                                // The product was successfully added, now let's add the images
                                for(var file of files){
                                    // For each image, inserting it in the db
                                    callbacksPending++;  // Starting a call with a callback function
                                    Images.insert(file, function(error, fileObj){
                                        if(!error){
                                            // Image was successfully inserted, linking it with the product
                                            var productImagesID = Products.findOne({_id: addedProductID}).imagesID;  // Catching the product images IDs array
                                            productImagesID.push(fileObj._id);  // Adding inserted image ID to the array
                                            // Updating the db with the new array
                                            Products.update(addedProductID, { $set: {
                                                imagesID: productImagesID
                                            }});
                                        } else{
                                            // There was an error while inserting the file in Images db
                                            formErrors++;
                                        }
                                        callbacksPending--;  // End of callback function
                                    });
                                }
                                callbacksPending++;  // Starting a call with a callback function
                                Moderation.insert({
                                    elementId: addedProductID,
                                    reason: "Proposition d'ajout"
                                }, function(error, addedModerationId){
                                    if(!error){
                                        Contributions.insert({
                                            userId: Meteor.userId(),
                                            type: 'Ajout',
                                            elementId: addedProductID,
                                            createdAt: new Date().toISOString(),
                                            moderationId: addedModerationId
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
                } else{
                    // File doesn't match all criteria
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
                Session.set('userPage', '');
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
    }
});


Template.addProduct.onDestroyed(function(){
    // Selected categories' Session variable isn't useful anymore, deleting it
    delete Session.keys.selectedCategories;
});
