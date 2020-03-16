// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Shops } from '../bdd/shops.js';
import { Images } from '../bdd/images.js';

// HTML import
import './manageShop.html';
import './functions/checkFileUpload.js';


Template.manageShop.onRendered(function(){
    //Code to update file name from https://bulma.io/documentation/form/file/
    const fileInput = document.querySelector('input#shopPictures');  // Saving input in a variable
    fileInput.onchange = () => {
        if(fileInput.files.length > 0){
            // There's at least one file in the input
            const fileNumber = document.querySelector('span.file-name');  //Catching the file number display
            if(fileInput.files.length === 1){
                fileNumber.textContent = fileInput.files.length + " fichier sélectionné";  //Updating displayed value
            } else{
                // At least 2 files
                fileNumber.textContent = fileInput.files.length + " fichiers sélectionnés";  //Updating displayed value
            }
        }
    }
});


Template.manageShop.events({
    'click button#addShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newShop'));
        var shopName = form.get('shopName');
        var shopDescription = form.get('shopDescription');
        var files = document.querySelector('input#shopPictures').files;

        // Check if the file upload is correct
        if(checkFileUpload(files=files, minLength=1, maxLength=10, type='image', maxMBSize=1)){
            Shops.insert({
                name: shopName,
                description: shopDescription,
                imagesID: []
            }, function(error, addedShopID){
                    if(!error){
                        // The shop was successfully added, now let's add the images
                        for(var file of files){
                            // For each file, check if it's an image
                            Images.insert(file, function (error, fileObj){
                                if(!error){
                                    // Image was successfully inserted, linking it with the shop
                                    var shopImagesID = Shops.findOne({_id: addedShopID}).imagesID;  // Catching the shop images IDs array
                                    shopImagesID.push(fileObj._id);  // Adding inserted image ID to the array
                                    // Updating the db with the new array
                                    Shops.update(addedShopID, { $set: {
                                        imagesID: shopImagesID
                                    }});
                                }
                            });
                        }
                    }
                }
            );
        }
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
