import { FilesCollection } from 'meteor/ostrio:files';


if(Meteor.isServer){
    const fetch = require("node-fetch");
    const Dropbox = require('dropbox').Dropbox;
    const Request = require('request');
    const fs = require('fs');

    var bound = Meteor.bindEnvironment(function(callback){
        return callback();
    });

    var dropbox = new Dropbox({
        accessToken: "pXInFYLTn7AAAAAAAAAAFFjNBCt8jqvWwmclV5wjYQuL1p8NCtJ-BmYBDkEQC_AD",  // Temporary app token
        fetch: fetch
    });
}

const Request = require('request');
const fs = require('fs');

export var Images = new FilesCollection({
    storagePath: '/tmp',  // Storage path outside project folder for permanent storage on development
    downloadRoute: "",  // Remove the default path to have a prettier link
    collectionName: 'images',
    allowClientCode: false,  // Disable remove() method on client
    onAfterUpload: function(fileRef){
        try{
            var self = this;

            // In onAfterUpload callback we will move file to DropBox
            var makeUrl = function(path, fileRef, version){
                dropbox.sharingCreateSharedLink({path: path, short_url: false}).then(function(response){
                    bound(function(){
                        const url = response.url.replace('dl=0','raw=1');
                        var upd = {
                            $set: {}
                        };
                        upd['$set']["versions." + version + ".meta.pipeFrom"] = url;
                        upd['$set']["versions." + version + ".meta.pipePath"] = path;
                        self.collection.update({
                            _id: fileRef._id
                        }, upd,
                        function(error){
                            if(error){
                                // There was an error, displaying it in the console
                                return console.error(error);
                            }
                            // Unlink original files from FS after successful upload to DropBox
                            self.unlink(self.collection.findOne(fileRef._id), version);
                        });
                    });
                }).catch(function(error){
                    // There was an error while creating the link, displaying it in the console
                    console.error(error);
                });
            };

            var writeToDB = function(fileRef, version, data){
                // DropBox already uses random URLs
                // No need to use random file names
                dropbox.filesUpload({path: '/' + fileRef._id + "-" + version + "." + fileRef.extension, contents: data, autorename:false}).then(function(response){
                    bound(function(){
                        // The file was successfully uploaded, generating a downloadable link
                        makeUrl(response.path_display, fileRef, version);
                    });
                }).catch(function(error){
                    bound(function(){
                        // There was an error while uploading the file, displaying it in the console
                        console.error(error);
                    });
                });
            };

            var readFile = function(fileRef, vRef, version){
                fs.readFile(vRef.path, function(error, data){
                    bound(function(){
                        if(error){
                            // There was an error, displaying it in the console
                            return console.error(error)
                        };
                        writeToDB(fileRef, version, data);
                    });
                });
            };

            var sendToStorage = function(fileRef){
                _.each(fileRef.versions, function(vRef, version){
                    readFile(fileRef, vRef, version);
                });
            };

            sendToStorage(fileRef);
        } catch(error){
            // There was an error while uploading the file to Dropbox, displaying the concerned file
            console.log('The following error occurred while removing '+ fileRef.path);
            // Removing the file from the file system
            fs.unlink(fileRef.path, function(error){
                if(error){
                    // There was an error while removing the file from the file system, displaying it in the console
                    console.error(error);
                }
            });
            // Removing the file from the collection
            Images.remove({
                _id: fileRef._id
            }, function(error){
                if(error){
                    // There was an error while removing the file from the collection, displaying it in the console
                    console.error(error);
                }
            });
        }
    },
    onBeforeRemove: function(cursor){
        return false;
    },
    interceptDownload: function(http, fileRef, version){
        var path, ref, ref1, ref2;
        path = (ref = fileRef.versions) != null ? (ref1 = ref[version]) != null ? (ref2 = ref1.meta) != null ? ref2.pipeFrom : void 0 : void 0 : void 0;
        if(path){
            // If file is moved to DropBox
            // We will pipe request to DropBox
            // So, original link will stay always secure
            Request({
                url: path,
                headers: _.pick(http.request.headers, 'range', 'accept-language', 'accept', 'cache-control', 'pragma', 'connection', 'upgrade-insecure-requests', 'user-agent')
            }).on('response', function(response){
                if (response.statusCode == 200){
                    response.headers = _.pick(response.headers, 'accept-ranges', 'cache-control', 'connection', 'content-disposition', 'content-length', 'content-type', 'date', 'etag');
                    response.headers['Cache-control'] = "only-if-cached, public, max-age=2592000";
                }
            }).pipe(http.response);
            return true;
        } else{
            // While file is not yet uploaded to DropBox
            // We will serve file from FS
            return false;
        }
    }
});


if (Meteor.isServer){
    // Intercept File's collection remove method
    // to remove file from DropBox

    var _origRemove = Images.remove;  // Catching the original remove method to call it after

    Images.remove = function(search){
        var cursor = this.collection.find(search);
        cursor.forEach(function(fileRef){
            _.each(fileRef.versions, function(vRef){
                var ref;
                if (vRef != null ? (ref = vRef.meta) != null ? ref.pipePath : void 0 : void 0){
                    dropbox.filesDeleteV2({path: vRef.meta.pipePath}).catch(function(error){
                        bound(function(){
                            // There was an error while removing the file, displaying it in the console
                            console.error(error);
                        });
                    });
                }
            });
        });
        // Call original method
        _origRemove.call(this, search);
    };
}
