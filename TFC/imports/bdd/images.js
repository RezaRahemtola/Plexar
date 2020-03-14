export const Images = new FS.Collection("images", {
  stores: [new FS.Store.FileSystem("images", {path: ""})],
  filter: {
    allow: {
      contentTypes: ['image/*']  //Allow only images in this FS.Collection
    }
  }
});
