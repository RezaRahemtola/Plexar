checkFileUpload = function(files, minLength=1, maxLength=10, type='all'){
    if(files.length >= minLength && files.length <= maxLength){
        // Number of files is ok
        if(type !== 'all'){
            // Files need to be of a certain type
            // Creating a boolean replaced by false if one of the files isn't of the correct type
            var validType = true;
            for(var file of files){
                // For each file check if it's of the correct type
                if(file.type.indexOf(type) === -1){
                    // File is not of the correct type
                    validType = false;
                }
            }
            if(validType){
                return true;
            }
            return false;
        }
        return true;
    }
    return false;
}
