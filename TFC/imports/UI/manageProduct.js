// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Products } from '../bdd/products.js';
import { Images } from '../bdd/images.js';

// HTML import
import './manageProduct.html';
import './functions/checkFileUpload.js';


Template.manageProduct.onRendered(function(){
    //Code to update file name from https://bulma.io/documentation/form/file/
    const filesInput = document.querySelector('input#productPictures');  // Saving input in a variable
    filesInput.onchange = () => {
        const filesNumberDisplay = document.querySelector('span.file-name');  // Catching the file number display
        if(filesInput.files.length === 0){
            filesNumberDisplay.textContent = "Aucun fichier sélectionné";  // Updating displayed value
        } else if(filesInput.files.length === 1){
            filesNumberDisplay.textContent = filesInput.files.length + " fichier sélectionné";  // Updating displayed value
        } else{
            // At least 2 files
            filesNumberDisplay.textContent = filesInput.files.length + " fichiers sélectionnés";  // Updating displayed value
        }
    }
});


Template.manageProduct.events({
    'click button#addProduct'(event){
        event.preventDefault();
        const form = new FormData(document.getElementById('newProduct'));
        var productName = form.get('productName');
        var productDescription = form.get('productDescription');
        var files = document.querySelector('input#productPictures').files;
        var formErrors = 0;  // No error for the moment
        var callbacksPending = 0;  // No callback is pending for the moment

        // Check if the file upload is correct
        if(checkFileUpload(files=files, minLength=1, maxLength=5, type='image', maxMBSize=5)){
            callbacksPending++;  // Starting a call with a callback function
            Products.insert({
                name: productName,
                description: productDescription,
                imagesID: []
            }, function(error, addedProductID){
                    if(!error){
                        // The product was successfully added, now let's add the images
                        for(var file of files){
                            // For each image, inserting it in the db
                            callbacksPending++;  // Starting a call with a callback function
                            Images.insert(file, function (error, fileObj){
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
    'click button#deleteProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteProduct'));
        var productID = form.get('ID');
        var productImagesID = Products.findOne({_id: productID}).imagesID;  // Catching the shop images

        // Delete corresponding line in the databaset
        Products.remove(productID, function(error, result){
            if(!error){
                // Shop was successfully removed, we can now delete it's images
                for(var imageID of productImagesID){
                    Images.remove(imageID);
                }
            }
        });
    }
});

Template.manageProduct.helpers({
    displayAllProducts: function(){
        return Products.find();
    }
});
