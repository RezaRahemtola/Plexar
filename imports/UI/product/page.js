// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// HTML import
import './page.html';

// Database import
import { Images } from '../../databases/images.js';

// Initializing Session variable
Session.set('productInFavorites', null);


FlowRouter.route('/product/:_id', {
    name: 'product',
    action(params, queryParams){
        // With the given id, we search for the product
        const productId = params["_id"];
        Meteor.call('findOneProductById', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                // Sending user back to home page to avoid a blank page displayed
                FlowRouter.go('/');
            } else if(result){
                // Product was successfully returned, saving it in a Session variable
                Session.set('currentProduct', result);
                // Render a template using Blaze
                BlazeLayout.render('main', {currentPage: 'productPage'});
                // Scrolling the window back to the top
                window.scrollTo(0, 0);
            }
        });
    }
});


Template.productPage.onRendered(function(){
    if(Meteor.user() && Session.get('currentProduct')){
        // Catching current productId for the call
        const productId = Session.get('currentProduct')._id;

        Meteor.call('getVoteValue', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                if(result > 0){
                    // Product has already been upvoted by the user
                    $('#upvote').addClass("has-text-primary");
                } else if(result < 0){
                    // User has already downvoted this product
                    $('#downvote').addClass("has-text-primary");
                }
            }
        });
    }
});


Template.productPage.events({
    'click #addToFavoriteProducts, click #removeFromFavoriteProducts, click .report, click .suggestChanges'(event){
        // Prevent default action for all events
        event.preventDefault();
    },
    'click #addToFavoriteProducts'(event){
        // User wants to add this product to it's favorites
        const productId = Session.get('currentProduct')._id;
        Meteor.call('addProductToFavorite', {productId: productId}, function(error, result){
            if(error){
                // There is an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Product was successfully added to favorite, showing a confirmation message
                Session.set('message', {type: "header", headerContent: "Produit bien ajouté aux favoris !", style: "is-success"});
                // Refreshing the favorite icon by calling the associated helper
                Template.productPage.__helpers.get('productInFavorites').call();
            }
        });
    },
    'click #removeFromFavoriteProducts'(event){
        // User wants to remove this product from it's favorites
        const productId = Session.get('currentProduct')._id;
        Meteor.call('removeProductFromFavorite', {productId: productId}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else{
                // Product was successfully removed from favorite, showing a confirmation message
                Session.set('message', {type: "header", headerContent: "Produit supprimé de vos favoris", style: "is-success"});
                // Refreshing the favorite icon by calling the associated helper
                Template.productPage.__helpers.get('productInFavorites').call();
            }
        });
    },
    'click .productVote'(event){
        // User wants to vote on this product
        event.preventDefault();
        // Catching parameters for the call
        const productId = Session.get('currentProduct')._id;
        const vote = event.currentTarget.id;
        // Remove the active class on votes buttons
        $('#upvote, #downvote').removeClass("has-text-primary");

        Meteor.call('updateProductScore', {productId: productId, vote: vote}, function(error, result){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(result){
                // Database was successfully updated, refreshing the Session variable with the updated product
                Meteor.call('findOneProductById', {productId: productId}, function(error, result){
                    if(!error){
                        // Product was succesfully found
                        Session.set('currentProduct', result);
                    }
                });

                // Return value is the vote, set an active class on the corresponding button
                if(result === 'upvote'){
                    $('#upvote').addClass("has-text-primary");
                } else if(result === 'downvote'){
                    $('#downvote').addClass("has-text-primary");
                }
            }
        });
    },
    'click .report'(event){
        if(!Meteor.user()){
            // User isn't logged in, sending him to register modal
            FlowRouter.go('/register');
        } else{
            // User is logged in, checking if the product is already in moderation

            // Catching productId for the call
            const productId = Session.get('currentProduct')._id;

            Meteor.call('checkIfProductInModeration', {productId: productId}, function(error, result){
                if(error){
                    // There was an error
                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                } else if(result){
                    // Product is already in moderation, display an helping message
                    Session.set('message', {type:"header", headerContent:"Ce produit est déjà en modération, veuillez réessayer ultérieurement.", style:"is-warning"} );
                } else{
                    // Product isn't already under moderation, we can display the report modal
                    FlowRouter.go('/reportProduct/'+productId);
                }
            });
        }
    },
    'click .suggestChanges'(event){
        if(!Meteor.user()){
            // User isn't logged in, sending him to register modal
            FlowRouter.go('/register');
        } else{
            // User is logged in, checking if the product is already in moderation

            // Catching productId for the call
            const productId = event.currentTarget.id;

            Meteor.call('checkIfProductInModeration', {productId: productId}, function(error, result){
                if(error){
                    // There was an error
                    Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
                } else if(result){
                    // Product is already in moderation, display an helping message
                    Session.set('message', {type:"header", headerContent:"Ce produit est déjà en modération, veuillez réessayer ultérieurement.", style:"is-warning"} );
                } else{
                    // Product isn't already under moderation, we can send the user to the edit page
                    FlowRouter.go('/editProduct/'+productId);
                }
            });
        }
    },
    'click #copyProductLink'(event){
        event.preventDefault();

        // Code to copy the link to clipboard, original code from https://stackoverflow.com/a/30810322/12171474

        if(!navigator.clipboard){
            // No navigator clipboard, creating a fake textarea element
            var textArea = document.createElement("textarea");
            // Set the text content to the link we want to copy to clipboard
            textArea.value = window.location.href;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            // Adding the textarea to the page, focusing & selecting it to be able to copy
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try{
                // Copy the text to clipboard
                document.execCommand('copy');
                // Try block wasn't stop so the text was succesfully copied, display a confirmation message
                Session.set('message', {type:"header", headerContent:"Lien copié dans le presse-papier.", style:"is-success"});
            } catch(error){
                // An error occured while copying, showing a message
                Session.set('message', {type:"header", headerContent:"Une erreur a eu lieu lors de la copie du lien : "+error, style:"is-danger"});
            }

            // Removing the textarea from the page
            document.body.removeChild(textArea);

        } else{
            // There is a navigator clipboard, copying the link in it
            navigator.clipboard.writeText(window.location.href);
            Session.set('message', {type:"header", headerContent:"Lien copié dans le presse-papier.", style:"is-success"});
        }
    }
})


Template.productPage.helpers({
    displayProduct: function(){
        // Return the product that corresponds to the one to display
        if(Session.get('currentProduct')){
            return Session.get('currentProduct');
        }
    },
    productInFavorites: function(){
        // Check if the product is in the favorite products of the user
        const productId = Session.get('currentProduct')._id;
        Meteor.call('productInFavorites', {productId: productId}, function(error, isInFavorites){
            if(error){
                // There was an error
                Session.set('message', {type:"header", headerContent:error.reason, style:"is-danger"} );  // Display an error message
            } else if(typeof(isInFavorites) === 'boolean'){
                // No error, a boolean was returned, saving it in a Session variable
                Session.set('productInFavorites', isInFavorites);
            }
        });
        return Session.get('productInFavorites');
    },
    imagesLoading: function(){
        // Check if the Images collection is ready to receive our requests
        return !Meteor.subscribe('images').ready();
    },
    displayProductImages: function(){
        if(Session.get('currentProduct')){
            // There is a product to display
            var productImagesId = Session.get('currentProduct').images;  // Return an array with IDs of the product images
            var productImages = [];  // Creating an empty array for the images
            for(var imageId of productImagesId){
                // Filling the array with product's images links
                productImages.push(Images.findOne({_id: imageId}).link());
            }
            return productImages;
        }
    },
    moreThanOneImage: function(){
        // Check if the product has more than one image (to show the slideshow buttons)
        if(Session.get('currentProduct')){
            const productImagesId = Session.get('currentProduct').images;  // Return an array with IDs of the product images
            return (productImagesId.length > 1);
        }
    },
    displayWebsite: function(){
        if(Session.get('currentProduct')){
            // Catching the website
            const website = Session.get('currentProduct').website;
            if(website !== ""){
                // If a website has been given we display it
                return website;
            }
        }
    },
    getProductLink: function(){
        // Get the current page link for social sharing
        return window.location.href;
    },
    getEncodedProductLink: function(){
        // Get the current page link for social sharing in URI format
        return encodeURIComponent(window.location.href);
    },
    getFacebookShareLink: function(){
        // Return the link for the Facebook sharing iframe

        // Convert the link to URI format
        const formattedLink = encodeURIComponent(window.location.href);
        // Return the complete facebook link
        return "https://www.facebook.com/plugins/share_button.php?href="+formattedLink+"&layout=button&size=small&width=81&height=20&appId";
    }
});


Template.productPage.onDestroyed(function(){
    // Reset unused Session variables
    Session.set('productInFavorites', null);
});
