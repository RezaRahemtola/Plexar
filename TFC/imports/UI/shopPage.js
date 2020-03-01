// Useful imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// HTML imports
import './shopPage.html';

// Database import
import { Magasins } from '../bdd/magasins.js';
import { Favoris } from '../bdd/favoris.js';

Template.displayedShopPage.events({
    'click #addToFavoriteShops'(event){
        event.preventDefault();
        var favorites = Favoris.findOne({user :{$eq: Meteor.user()._id}});
        favorites.magasins.push(Session.get('IDshop'));
        Favoris.update(favorites._id, { $set: {
            magasins: favorites.magasins
        }});
        alert("Magasin bien ajouté aux favoris !");
    },
    'click #removeFromFavoriteShops'(event){
        var favorites = Favoris.findOne({user :{$eq: Meteor.user()._id}});
        favorites.magasins.pop(Session.get('IDshop'));
        Favoris.update(favorites._id, { $set: {
            magasins: favorites.magasins
        }});
        alert("Magasin supprimé de vos favoris");
    }
})

Template.shopPage.helpers({
    displayShop: function(){
        return Magasins.find({_id :{$eq: Session.get('IDshop')}},{});
    }
});

Template.displayedShopPage.helpers({
    shopInFavorites: function(IDshop){
        // Check if the given shop ID is in the favorite shops of the user
        var favorites = Favoris.findOne({user: Meteor.user()._id});  // Return the favorites of the current user
        if(favorites.magasins.indexOf(IDshop) === -1){
            return false;  // Given ID is not in the favorite shops, so return false
        } else{
            return true;  // Given ID is in the favorite shops, return true
        }
    }
});
