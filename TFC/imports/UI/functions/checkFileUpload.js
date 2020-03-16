/**
 * Check if a file upload match all given criteria
 *
 *  @param  {FileList}  files   Content of the file input
 *  @param  {int}   minLength   Minimum file number, default = 1
 *  @param  {int}   maxLength   Maximum file number, default = 5
 *  @param  {string}     type   Files type (images, audio, text...), default = all
 *  @param  {int}   maxMBSize   Maximum size per file (in MegaBytes), default = 5
 *
 *  @return {boolean}  true if files matched all criteria, else false
 */
checkFileUpload = function(files, minLength=1, maxLength=5, type='all', maxMBSize=5){
    if(files.length >= minLength && files.length <= maxLength){
        // Number of files is ok, checking for each file if the size is correct
        var maxSize = maxMBSize*1000000  // File size is in bytes, converting maxSize (1 MegaByte = 1 000 000 bytes)
        for(var file of files){
            if(file.size > maxSize){
                // One of the file is too big
                Session.set('message', {type:'header', headerContent:"La taille maximale autorisée par fichier est de "+maxMBSize+" MB.", style:"is-danger"});
                return false;
            } else if(type !== 'all'){
                // Files need to be of a certain type
                if(file.type.indexOf(type) === -1){
                    // File is not of the correct type
                    Session.set('message', {type:'header', headerContent:"Ce type de fichier n'est pas autorisé.", style:"is-danger"});
                    return false;
                }
            }
        }
        // Files match all criteria
        return true;
    }
    // Number of files is not correct
    Session.set('message', {type:'header', headerContent:"Le nombre de fichier n'est pas correct.", style:"is-danger"});
    return false;
}
