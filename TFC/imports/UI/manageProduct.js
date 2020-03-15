// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Products } from '../bdd/products.js';
import { Images } from '../bdd/images.js';

// HTML import
import './manageProduct.html';

Template.manageProduct.onRendered(function(){
    //Code to update file name from https://bulma.io/documentation/form/file/
    const fileInput = document.querySelector('input#productPictures');  // Saving input in a variable
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

Template.manageProduct.events({
    'click #addProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newProduct'));
        var productName = form.get('productName');
        var productDescription = form.get('productDescription');
        var files = document.querySelector('input#productPictures').files;

        // Inserting informations in the database
        Products.insert({
            name: productName,
            description: productDescription,
            imagesID: []
        }, function(error, ID){
                if(!error){
                    // The product was successfully added, saving it's ID returned by the callback function in a variable
                    var productID = ID;

                    // Now let's add the images
                    if(files.length > 0){
                        // There's at least one uploaded file
                        for(var i = 0, length = files.length; i < length; i++){
                            // For each file, check if it's an image
                            if(files[i].type.indexOf("image") === -1){
                                // File is not an image
                            } else{
                                // Adding the image to the db
                                Images.insert(files[i], function (error, fileObj) {
                                    if(!error){
                                        // Image was successfully inserted, linking it with the product
                                        var productImagesID = Products.findOne({_id: productID}).imagesID;  // Catching the product images IDs array
                                        productImagesID.push(fileObj._id);  // Adding inserted image ID to the array
                                        // Updating the db with the new array
                                        Products.update(productID, { $set: {
                                            imagesID: productImagesID
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
    'click #deleteProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('deleteProduct'));
        var productID = form.get('ID');

        // Delete corresponding line in the database
        Products.remove(productID);
    }
});

Template.manageProduct.helpers({
    displayAllProducts: function(){
        return Products.find();
    }
});
