import { FilesCollection } from 'meteor/ostrio:files';

export const Images = new FilesCollection({
    collectionName: 'images',
    downloadRoute: '',  // Remove the default path to have a prettier link
    allowClientCode: false  // Disable remove() method on client
});
