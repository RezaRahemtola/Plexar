// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Shops } from '../bdd/shops.js';
import { Images } from '../bdd/images.js';

// HTML import
import './manageShop.html';
import './functions/checkInputs.js';


Template.manageShop.onRendered(function(){
    // Code to update file name from https://bulma.io/documentation/form/file/
    const filesInput = document.querySelector('input#shopPictures');  // Saving input in a variable
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


Template.manageShop.events({
    'click button#addShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newShop'));
        var formErrors = 0;  // No error for the moment
        var callbacksPending = 0;  // No callback is pending for the moment

        // Check if the name is correctly formatted
        var shopName = form.get('shopName');
        if(checkTextInput(text=shopName, minLength=1, maxLength=70)){
            // Shop name is correct, checking the description
            var shopDescription = form.get('shopDescription');
            if(checkTextInput(text=shopDescription, minLength=50, maxLength=1000)){
                // Check if the file upload is correct
                var files = document.querySelector('input#shopPictures').files;
                if(checkFileInput(files=files, minLength=1, maxLength=5, type='image', maxMBSize=5)){
                    // Files are correct, catching categories
                    const checkedCategories = document.querySelectorAll('input[name="category"]:checked');
                    var shopCategories = [];
                    for(var category of checkedCategories){
                        shopCategories.push(category.value);
                    }
                    callbacksPending++;  // Starting a call with a callback function
                    Shops.insert({
                        name: shopName,
                        description: shopDescription,
                        imagesID: [],
                        score: 0,
                        categories: shopCategories
                    }, function(error, addedShopID){
                            if(!error){
                                // The shop was successfully added, now let's add the images
                                for(var file of files){
                                    // For each file, check if it's an image
                                    callbacksPending++;  // Starting a call with a callback function
                                    Images.insert(file, function (error, fileObj){
                                        if(!error){
                                            // Image was successfully inserted, linking it with the shop
                                            var shopImagesID = Shops.findOne({_id: addedShopID}).imagesID;  // Catching the shop images IDs array
                                            shopImagesID.push(fileObj._id);  // Adding inserted image ID to the array
                                            // Updating the db with the new array
                                            Shops.update(addedShopID, { $set: {
                                                imagesID: shopImagesID
                                            }});
                                        } else{
                                            // There was an error while inserting the file in Images db
                                            formErrors++;
                                        }
                                        callbacksPending--;  // End of callback function
                                    });
                                }
                            } else{
                                // There was an error while adding the shop
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
                // Shop description doesn't match all criteria
                formErrors++;
            }
        } else{
            // Shop name doesn't match all criteria
            formErrors++;
        }



        // Waiting for all callbacks to complete (to see if an error is raised)
        var intervalID = setInterval(function(){
            if(callbacksPending === 0 && formErrors === 0){
                // All callbacks were completed without any error, displaying a success message
                Session.set('message', {type: "header", headerContent: "Magasin ajouté avec succès !", style:"is-success"} );
                Session.set('userPage', '');
                clearInterval(intervalID);  // This interval is not required anymore, removing it
            }
        }, 200);
    },
    'click button#deleteShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteShop'));
        var shopID = form.get('ID');
        var shopImagesID = Shops.findOne({_id: shopID}).imagesID;  // Catching the shop images

        // Delete corresponding line in the databaset
        Shops.remove(shopID, function(error, result){
            if(!error){
                // Shop was successfully removed, we can now delete it's images
                for(var imageID of shopImagesID){
                    Images.remove(imageID);
                }
            }
        });
    }
});

Template.manageShop.helpers({
    displayAllShops: function(){
        return Shops.find({}, {});
    }
});
