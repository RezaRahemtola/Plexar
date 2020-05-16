import assert from "assert";

describe("TFC", function () {
  it("package.json has correct name", async function () {
    const { name } = await import("../package.json");
    assert.strictEqual(name, "TFC");
  });

  if (Meteor.isClient) {
    it("client is not server", function () {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it("server is not client", function () {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});


/*
$('label').click(function(){  // When a label is click
    var labelID = $(this).attr('for');  // Get the content of for attribute (ID of the input)
    $('input#'+labelID).focus();  // Focus this input
});
*/


/*
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
*/
