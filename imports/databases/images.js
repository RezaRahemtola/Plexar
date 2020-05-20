export const Images = new FS.Collection("images", {
    stores: [new FS.Store.FileSystem("images", {path: ""})],
    filter: {
        allow: {
            contentTypes: ['image/*']  // Allow only images in this FS.Collection
        },
        maxSize: 10000000  // Size can't exceed 10MB per file
    }
});
