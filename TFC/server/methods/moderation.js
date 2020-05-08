// Useful imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Importing databases
import { Products } from '../../imports/databases/products.js';
import { Images } from '../../imports/databases/images.js';
import { Moderation } from '../../imports/databases/moderation.js';
import { EditedProducts } from '../../imports/databases/editedProducts.js';
import { Contributions } from '../../imports/databases/contributions.js';
import { CollectiveModeration } from '../../imports/databases/collectiveModeration.js';
import { Rules } from '../rules.js';

Meteor.methods({
    'checkIfProductInModeration'({productId}){
        // Type check to prevent malicious calls
        check(productId, String);

        // Checking if the given productId corresponds to the elementId field of the moderation database
        const isUnderModeration = Moderation.findOne({elementId: productId});

        if(isUnderModeration){
            // A moderation was found, returning true
            return true;
        } else{
            // No moderation found, checking edits propositions (because elementId field of moderation contains editedProductId for edit propositions)
            const isUnderEdit = EditedProducts.findOne({originalId: productId});
            if(isUnderEdit){
                // This product is under edit
                return true;
            } else{
                // Product isn't under moderation and isn't under edit, we can return false
                return false;
            }
        }

    },
    'displayCurrentDailyVotes'(){

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, catching user's daily votes
            const dailyVotes = CollectiveModeration.findOne({userId: Meteor.userId()}).dailyVotes;

            // Catching the current date
            var year = new Date().getFullYear();  // Catching the year
            var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
            var date = new Date().getDate();  // Catching the date
            if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
            if(month < 10){ month = '0' + month; }
            const currentDate = date+ '/' +month+ '/' +year;

            if(dailyVotes[currentDate] !== undefined){
                // User has already voted in collective moderation today, returning number of participations
                return dailyVotes[currentDate];
            } else{
                // User hasn't voted in collective moderation today, returning 0
                return 0;
            }
        }
    },
    'displayCurrentDailyVotesLimit'(){
        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, returning default dailyVotes limit
            // TODO: faire en fonction des paliers
            return Rules.moderation.dailyVotingLimit;
        }
    },
    'findModerationElementId'({moderationId}){
        // Type check to prevent malicious calls
        check(moderationId, String);

        return Moderation.findOne({_id: moderationId}).elementId;
    },
    'moderationCounter'(){

        // Checking if user is admin :
        const userEmail = Meteor.user().emails[0].address;
        if(!Meteor.settings.admin.list.includes(userEmail)){
            // User isn't in the admin list
            throw new Meteor.Error('userNotAdmin', 'Accès refusé, cette action est réservée aux administrateurs.')
        } else{
            const total = Moderation.find().count().toLocaleString();  // toLocaleString() make a space where needed (1000 will be 1 000)
            const newProducts = Moderation.find({reason : 'newProduct'}).count().toLocaleString();
            const editedProducts = Moderation.find({reason : 'editProduct'}).count().toLocaleString();
            const reports = Moderation.find({reason : {$in: ['duplicate', 'offTopic']} }).count().toLocaleString();

            return {total: total, newProducts: newProducts, editedProducts: editedProducts, reports: reports};
        }
    },
    'displayModeration'(){
        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, checking if his email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // Email isn't verified
                throw new Meteor.Error('emailNotVerified', 'Vous devez vérifier votre adresse email pour effectuer cette action.');
            } else{
                // Email is verified, checking if he's admin :

                const userEmail = Meteor.user().emails[0].address;
                if(!Meteor.settings.admin.list.includes(userEmail)){
                    // User isn't in the admin list, so he will have a limit of daily votes
                    var maxDailyVotes = Rules.moderation.dailyVotingLimit;

                    // Catching daily votes of the user to see if he has already voted today
                    var dailyVotes = CollectiveModeration.findOne({userId: Meteor.userId()}).dailyVotes;

                    // Catching the current date
                    var year = new Date().getFullYear();  // Catching the year
                    var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                    var date = new Date().getDate();  // Catching the date
                    if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                    if(month < 10){ month = '0' + month; }
                    const currentDate = date+ '/' +month+ '/' +year;

                    if(dailyVotes[currentDate] !== undefined){
                        // User has already voted in collective moderation today, we need to decrement the daily votes limit
                        maxDailyVotes -= dailyVotes[currentDate];
                    }

                } else{
                    // User is an admin, no voting limit (unreachable value)
                    var maxDailyVotes = 10000000;
                }

                // Catching array of moderation on which the user has already vote
                const votedModeration = CollectiveModeration.findOne({userId: Meteor.userId()}).alreadyVoted;

                var moderationElements = Moderation.find({}, {sort: { createdAt: 1 }});  // Return moderation sorted by date (most older first)

                var elementsToReturn = []
                for(var moderation of moderationElements){
                    // For each moderation, we add a text for the buttons depending on the reason
                    if(elementsToReturn.length < maxDailyVotes && !votedModeration.includes(moderation._id)){
                        // We will only return the number of elements that the user can vote and on which he hasn't already vote
                        switch(moderation.reason){
                            case 'newProduct':
                                moderation.reasonText = "Proposition d'ajout";
                                moderation.approveText = "Valider l'ajout";
                                moderation.rejectText = "Rejeter l'ajout";
                                break;
                            case 'editProduct':
                                moderation.reasonText = "Proposition de modification";
                                moderation.approveText = "Valider les modifications";
                                moderation.rejectText = "Rejeter les modifications";
                                break;
                            case 'duplicate':
                                moderation.reasonText = "Signalement : Produit référencé plusieurs fois.";
                                moderation.approveText = "Supprimer le produit";
                                moderation.rejectText = "Garder le produit";
                                break;
                            case 'offTopic':
                                moderation.reasonText = "Signalement : Produit hors-sujet";
                                moderation.approveText = "Supprimer le produit";
                                moderation.rejectText = "Garder le produit";
                                break;
                            default:
                                // Unknown reason
                                moderation.reasonText = doc.reason;
                                moderation.approveText = "Garder le produit";
                                moderation.rejectText = "Supprimer le produit";
                        }

                        // Then we find the corresponding product
                        if(moderation.reason === 'editProduct'){
                            // It's an edit suggestion, so the elementId isn't the productId but the editedProductId
                            const editedProductId = moderation.elementId;
                            const productId = EditedProducts.findOne({_id: editedProductId}).originalId;
                            var product = Products.findOne({_id: productId});
                        } else{
                            // Property elementId of the moderation is the productId
                            var product = Products.findOne({_id: moderation.elementId});
                        }

                        // And we add the moderation + the product to the returned array
                        elementsToReturn.push( {
                                                product: product,
                                                moderation: moderation
                                                }
                                            );
                    }

                }
                return elementsToReturn;
            }
        }
    },
    'moderationAccepted'({moderationId}){
        // Type check to prevent malicious calls
        check(moderationId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, checking if his email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // Email isn't verified
                throw new Meteor.Error('emailNotVerified', 'Vous devez vérifier votre adresse email pour effectuer cette action.');
            } else{
                // Email is verified, checking if he's admin :

                const userEmail = Meteor.user().emails[0].address;
                if(!Meteor.settings.admin.list.includes(userEmail)){
                    // User isn't in the admin list, he will only update the vote
                    // TODO : régler le nombre en fonction du palier
                    const voteToApply = 1;
                    // Catching the current score and updating it
                    var currentScore = Moderation.findOne({_id: moderationId}).score;
                    currentScore += voteToApply;
                    // Updating the value in the database
                    Moderation.update(moderationId, { $set: { score: currentScore } } );
                } else{
                    // User is an admin, set the score to the amount it needs to be accepted
                    const votesToApprove = Rules.moderation.votesToApprove;
                    // Updating the value in the database
                    Moderation.update(moderationId, { $set: { score: votesToApprove } } );
                }

                // Adding this moderation to those on which the user has voted
                const collectiveModerationId = CollectiveModeration.findOne({userId: Meteor.userId()})._id;
                var dailyVotes = CollectiveModeration.findOne({userId: Meteor.userId()}).dailyVotes;

                // Catching the current date
                var year = new Date().getFullYear();  // Catching the year
                var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                var date = new Date().getDate();  // Catching the date
                if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                if(month < 10){ month = '0' + month; }
                const currentDate = date+ '/' +month+ '/' +year;

                if(dailyVotes[currentDate] !== undefined){
                    // User has already voted in collective moderation today, we will only update the number
                    var todayVotes = dailyVotes[currentDate];
                    todayVotes++;
                    dailyVotes[currentDate] = todayVotes;
                } else{
                    // User hasn't vote for collective moderation today, we create a new daily vote of 1
                    dailyVotes[currentDate] = 1;
                }
                // Updating daily votes value in the database
                CollectiveModeration.update(collectiveModerationId, { $set: { dailyVotes: dailyVotes } } );

                var alreadyVotedModeration = CollectiveModeration.findOne({userId: Meteor.userId()}).alreadyVoted;
                alreadyVotedModeration.push(moderationId);
                // Updating the value with the modified array
                CollectiveModeration.update(collectiveModerationId, { $set: { alreadyVoted: alreadyVotedModeration } } );
                // Calling the method to check if the score to accept/reject the moderation was reached
                Meteor.call('checkModerationDecision', {moderationId: moderationId});
            }
        }
    },
    'moderationRejected'({moderationId}){
        // Type check to prevent malicious calls
        check(moderationId, String);

        if(!Meteor.userId()){
            // User isn't logged in
            throw new Meteor.Error('userNotLoggedIn', 'Utilisateur non-connecté, veuillez vous connecter et réessayer.');
        } else{
            // User is logged in, checking if his email is verified
            const hasVerifiedEmail = Meteor.user().emails[0].verified;
            if(!hasVerifiedEmail){
                // Email isn't verified
                throw new Meteor.Error('emailNotVerified', 'Vous devez vérifier votre adresse email pour effectuer cette action.');
            } else{
                // Email is verified, checking if he's admin :

                const userEmail = Meteor.user().emails[0].address;
                if(!Meteor.settings.admin.list.includes(userEmail)){
                    // User isn't in the admin list, he will only update the vote
                    // TODO : régler le nombre en fonction du palier
                    const voteToApply = -1;
                    // Catching the current score and updating it
                    var currentScore = Moderation.findOne({_id: moderationId}).score;
                    currentScore += voteToApply;
                    // Updating the value in the database
                    Moderation.update(moderationId, { $set: { score: currentScore } } );
                } else{
                    // User is an admin, set the score to the amount it needs to reject
                    const votesToReject = Rules.moderation.votesToReject;
                    // Updating the value in the database
                    Moderation.update(moderationId, { $set: { score: votesToReject } } );
                }

                // Adding this moderation to those on which the user has voted
                const collectiveModerationId = CollectiveModeration.findOne({userId: Meteor.userId()})._id;
                var dailyVotes = CollectiveModeration.findOne({userId: Meteor.userId()}).dailyVotes;

                // Catching the current date
                var year = new Date().getFullYear();  // Catching the year
                var month = new Date().getMonth()+1;  // Catching the month (getMonth is 0 indexed so adding 1)
                var date = new Date().getDate();  // Catching the date
                if(date < 10){ date = '0' + date; }  // Formatting the date and the month properly (adding a 0 before if needed)
                if(month < 10){ month = '0' + month; }
                const currentDate = date+ '/' +month+ '/' +year;

                if(dailyVotes[currentDate] !== undefined){
                    // User has already voted in collective moderation today, we will only update the number
                    var todayVotes = dailyVotes[currentDate];
                    todayVotes++;
                    dailyVotes[currentDate] = todayVotes;
                } else{
                    // User hasn't vote for collective moderation today, we create a new daily vote of 1
                    dailyVotes[currentDate] = 1;
                }
                // Updating daily votes value in the database
                CollectiveModeration.update(collectiveModerationId, { $set: { dailyVotes: dailyVotes } } );

                var alreadyVotedModeration = CollectiveModeration.findOne({userId: Meteor.userId()}).alreadyVoted;
                alreadyVotedModeration.push(moderationId);
                // Updating the value with the modified array
                CollectiveModeration.update(collectiveModerationId, { $set: { alreadyVoted: alreadyVotedModeration } } );
                // Calling the method to check if the score to accept/reject the moderation was reached
                Meteor.call('checkModerationDecision', {moderationId: moderationId});
            }
        }
    },
    'checkModerationDecision'({moderationId}){
        // Type check to prevent malicious calls
        check(moderationId, String);

        // Catching the moderation
        const currentModeration = Moderation.findOne({_id: moderationId});
        // Catching rules about the score needed to approve or reject
        const votesToApprove = Rules.moderation.votesToApprove;
        const votesToReject = Rules.moderation.votesToReject;

        if(currentModeration.score >= votesToApprove){
            // Moderation was approved, checking the reason to execute the corresponding action
            switch(currentModeration.reason){
                case 'newProduct':
                    // New product accepted, it's already in the Products database so we only need to remove it from Moderation and update the Contribution
                    break;
                case 'duplicate':
                case 'offTopic':
                    // Duplicate or off topic approved, removing the product and it's images
                    var productImages = Products.findOne({_id: currentModeration.elementId}).images;  // Catching the product images
                    Products.remove(currentModeration.elementId, function(error, result){
                        if(error){
                            // There was an error while removing the product
                            throw new Meteor.Error('removeProductFailed', 'La suppression du produit a échoué, veuillez réessayer.');
                        } else{
                            // The product was successfully removed, we can now delete it's images
                            for(var image of productImages){
                                Images.remove(image);
                            }
                        }
                    });
                    break;
                case 'editProduct':
                    // Edit proposition was approved, updating the current product with modified informations
                    const editedProductId = currentModeration.elementId;
                    const editedProduct = EditedProducts.findOne({_id: editedProductId});

                    const productId = editedProduct.originalId;
                    const originalProduct = Products.findOne({_id: productId});
                    Products.update(productId, { $set: {
                        name: editedProduct.name,
                        description: editedProduct.description,
                        images: editedProduct.images,
                        categories: editedProduct.categories,
                        website: editedProduct.website
                    }}, function(error, result){
                        if(error){
                            // There was an error while updating the product
                            throw new Meteor.Error('productUpdateFailed', 'La mise à jour du produit a échoué, veuillez réessayer.');
                        } else{
                            // Product was successfully modified, we check images to delete those who aren't in the real product anymore
                            const oldImages = originalProduct.images;
                            const newImages = editedProduct.images;
                            for(var imageId of oldImages){
                                if(!newImages.includes(imageId)){
                                    // This image isn't used in the product anymore, we can delete it
                                    Images.remove(imageId);
                                }
                            }
                            // Deleting the edited product
                            EditedProducts.remove(editedProductId);
                        }
                    });
                    break;
            }
            // Now let's catch the correponding contribution to update it's status
            const contributionId = Contributions.findOne({moderationId: moderationId})._id;
            // Updating the status
            Contributions.update(contributionId, { $set: { status: 'accepted' } } );
            // Removing the moderation
            Moderation.remove(moderationId);

        } else if(currentModeration.score <= votesToReject){
            // Moderation was rejected, checking the reason to execute the corresponding action
            switch(currentModeration.reason){
                case 'newProduct':
                    // New product rejected, removing it from the database
                    const productImages = Products.findOne({_id: currentModeration.elementId}).images;  // Catching the product images
                    Products.remove(currentModeration.elementId, function(error, result){
                        if(error){
                            // There was an error while removing the product
                            throw new Meteor.Error('removeProductFailed', 'La suppression du produit a échoué, veuillez réessayer.');
                        } else{
                            // The product was successfully removed, we can now delete it's images
                            for(var image of productImages){
                                Images.remove(image);
                            }
                        }
                    });
                    break;
                case 'duplicate':
                case 'offTopic':
                    // Duplicate or off topic rejected, we only need to remove the Moderation and update the Contribution
                    break;
                case 'editProduct':
                    // Edit product rejected, catching the product to delete
                    const editedProductId = currentModeration.elementId;
                    const editedProduct = EditedProducts.findOne({_id: editedProductId});
                    // Edit proposition was rejected, we delete it from the database
                    EditedProducts.remove(editedProductId, function(error, result){
                        if(error){
                            // There was an error while removing the edit proposition
                            throw new Meteor.Error('removeProductFailed', 'La suppression du produit a échoué, veuillez réessayer.');
                        } else{
                            // Edit proposition was successfully removed, we check it's images to delete those who aren't in the real product
                            const editedProductImages = editedProduct.images;
                            const productImages = Products.findOne({_id: editedProduct.originalId}).images;
                            for(var imageId of editedProductImages){
                                if(!productImages.includes(imageId)){
                                    // Image isn't in the product's ones, we can delete it safely delete it
                                    Images.remove(imageId);
                                }
                            }
                        }
                    });
                    break;
            }
            // Now let's catch the correponding contribution to update it's status
            const contributionId = Contributions.findOne({moderationId: moderationId})._id;
            // Updating the status
            Contributions.update(contributionId, { $set: { status: 'rejected' } } );
            // Removing the moderation
            Moderation.remove(moderationId);
        }
    }
});
