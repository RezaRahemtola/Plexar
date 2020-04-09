// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// Database import
import { Products } from '../databases/products.js';
import { Images } from '../databases/images.js';
import { Contributions } from '../databases/contributions.js';
import { Moderation } from '../databases/moderation.js';

// HTML import
import './editProduct.html';

// CSS import
import './css/form.css';

// JS import
import './functions/checkInputs.js';


Template.editProduct.onRendered(function(){

    // Filling the fields with product's informations :

    // Catching product's informations
    var productId = Session.get('currentProductID');
    var product = Products.findOne({_id: productId});

    // Product name
    const productName = document.querySelector('input#name');  // Catching the input
    productName.value = product.name;  // Updating the value

    // Product description
    const productDescription = document.querySelector('textarea#description');  // Catching the field
    productDescription.value = product.description;  // Updating it's value
    autoExpand(productDescription);  // Auto expand the field to display the text correctly

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

    // Cover image
    const coverImageColumn = document.querySelector('div.columns').firstElementChild;  // Catching the element in which we will insert the image
    var coverImageId = product.imagesID.splice(0, 1);  // Cover image Id is the first (splice remove it from the list so we can use it after for other images)
    var imageContainer = document.createElement('div');
    var imageUrl = Images.findOne({_id: coverImageId[0]}).url();  // Find the image url in the db
    imageContainer.id = coverImageId;  // Set the image id to the container's to remove the image after
    imageContainer.classList += "image-container width-fit-content";  // Adding class and style to display it correctly
    imageContainer.style.position = 'relative';
    imageContainer.style.display = 'inline-block';
    imageContainer.innerHTML = '<img src='+imageUrl+' class="image is-128x128"><button class="delete" style="position: absolute; top: 0; right: 0;"></button>';
    coverImageColumn.appendChild(imageContainer);  // Add the element to the document

    // Other images
    const otherImagesColumn = document.querySelector('div.columns').lastElementChild;  // Catching the element in which we will insert the image
    for(var imageId of product.imagesID){
        // For each imageId, create and display an image element
        var imageContainer = document.createElement('div');
        var imageUrl = Images.findOne({_id: imageId}).url();  // Find the image url in the db
        imageContainer.id = imageId;  // Set the image id to the container's to remove the image after
        imageContainer.classList += "image-container width-fit-content";  // Adding class and style to display it correctly
        imageContainer.style.position = 'relative';
        imageContainer.style.display = 'inline-block';
        imageContainer.innerHTML = '<img src='+imageUrl+' class="image is-128x128"><button class="delete" style="position: absolute; top: 0; right: 0;"></button>';
        otherImagesColumn.appendChild(imageContainer);  // Add the element to the document
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








    const descriptionCharDisplay = document.querySelector('span#descriptionCharCounter');
    descriptionCharDisplay.innerText = productDescription.value.length+" / "+productDescription.maxLength;
    productDescription.oninput = function(){
        descriptionCharDisplay.innerText = productDescription.value.length+" / "+productDescription.maxLength;
        autoExpand(productDescription);
    }
});


Template.editProduct.events({
    'click #return'(event){
        event.preventDefault();
        Session.set('page', Session.get('lastPage'));
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
    'click div.image-container button.delete'(event){
        // When the delete button of an image is clicked
        event.preventDefault();
        // TODO: Supprimer l'id de l'image de la liste des id des images du produit
        var imageContainer = event.currentTarget.parentElement;  // Image container is the parent element of the delete button
        imageContainer.parentNode.removeChild(imageContainer);  // Removing image container
    }
});
