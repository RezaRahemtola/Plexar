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
    'click button#addProduct'(event){
        event.preventDefault();
        var form = new FormData(document.getElementById('newProduct'));
        var productName = form.get('productName');
        var productDescription = form.get('productDescription');
        var files = document.querySelector('input#productPictures').files;

        // Check if the file upload is correct
        if(checkFileUpload(files=files, minLength=1, maxLength=10, type='image')){
            Products.insert({
                name: productName,
                description: productDescription,
                imagesID: []
            }, function(error, addedProductID){
                    if(!error){
                        // The product was successfully added, now let's add the images
                        for(var file of files){
                            // For each image, inserting it in the db
                            Images.insert(file, function (error, fileObj){
                                if(!error){
                                    // Image was successfully inserted, linking it with the product
                                    var productImagesID = Products.findOne({_id: addedProductID}).imagesID;  // Catching the product images IDs array
                                    productImagesID.push(fileObj._id);  // Adding inserted image ID to the array
                                    // Updating the db with the new array
                                    Products.update(addedProductID, { $set: {
                                        imagesID: productImagesID
                                    }});
                                }
                            });
                        }
                    }
                }
            );
        }
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
