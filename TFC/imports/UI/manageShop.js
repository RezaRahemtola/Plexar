// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Shops } from '../bdd/shops.js';
import { Images } from '../bdd/images.js';

// HTML import
import './manageShop.html';

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
    'click #addShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newShop'));
        var shopName = form.get('shopName');
        var shopDescription = form.get('shopDescription');
        var files = document.querySelector('input#shopPictures').files;

        // Inserting informations in the database
        Shops.insert({
            name: shopName,
            description: shopDescription,
            imagesID: []
        }, function(error, ID){
                if(!error){
                    // The shop was successfully added, saving it's ID returned by the callback function in a variable
                    var shopID = ID;

                    // Now let's add the images
                    if(files.length > 0){
                        // There's at least one uploaded file
                        for(var i = 0, length = files.length; i < length; i++){
                            // For each file, check if it's an image
                            if(files[i].type.indexOf("image") === -1){
                                // File is not an image
                            } else{
                                // Adding the image to the db
                                Images.insert(files[i], function (error, fileObj){
                                    if(!error){
                                        // Image was successfully inserted, linking it with the shop
                                        var shopImagesID = Shops.findOne({_id: shopID}).imagesID;  // Catching the shop images IDs array
                                        shopImagesID.push(fileObj._id);  // Adding inserted image ID to the array
                                        // Updating the db with the new array
                                        Shops.update(shopID, { $set: {
                                            imagesID: shopImagesID
                                        }});
                                    }
                                });
                            }
                        }
                    }
                }
            }
        );
    },
    'click #deleteShop'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteShop'));
        var shopID = form.get('ID');

        // Delete corresponding line in the database
        Shops.remove(shopID);
    }
});

Template.manageShop.helpers({
    displayAllShops: function(){
        return Shops.find({}, {});
    }
});
