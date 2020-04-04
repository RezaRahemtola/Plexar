/**
 * Check if a file input match all criteria
 *
 *  @param  {FileList}  files   Content of the file input
 *  @param  {int}   minLength   Minimum file number, default = 1
 *  @param  {int}   maxLength   Maximum file number, default = 5
 *  @param  {string}     type   Files type (images, audio, text...), default = all
 *  @param  {int}   maxMBSize   Maximum size per file (in MegaBytes), default = 5
 *
 *  @return {boolean}  true if files matched all criteria, else false
 */
checkFileInput = function(files, minLength=1, maxLength=5, type='all', maxMBSize=5){
    if(files.length >= minLength && files.length <= maxLength){
        // Number of files is ok, checking for each file if the size is correct
        var maxSize = maxMBSize*1000000;  // File size is in bytes, converting maxSize (1 MegaByte = 1 000 000 bytes)
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
    // Number of files is not correct, displaying custom error messages
    if(files.length < minLength){
        if(minLength === 1){
            Session.set('message', {type:'header', headerContent:"Veuillez sélectionner au moins 1 fichier.", style:"is-danger"});
        } else{
            Session.set('message', {type:'header', headerContent:"Veuillez sélectionner au moins "+minLength+" fichiers.", style:"is-danger"});
        }
    } else if(files.length > maxLength){
        if(maxLength === 1){
            Session.set('message', {type:'header', headerContent:"Vous ne pouvez pas sélectionner plus d'1 fichier.", style:"is-danger"});
        } else{
            Session.set('message', {type:'header', headerContent:"Vous ne pouvez pas sélectionner plus de "+maxLength+" fichiers.", style:"is-danger"});
        }
    }
    return false;
};




/**
 * Check if a text match all criteria
 *
 *  @param  {string}     text   Content of the text input
 *  @param  {int}   minLength   Minimum char length, default = 1
 *  @param  {int}   maxLength   Maximum char length, default = 100
 *
 *  @return {boolean}  true if the text matched all criteria, else false
 */
checkTextInput = function(text, minLength=1, maxLength=100){
    if(text.length >= minLength && text.length <= maxLength){
        // Text length is correct
        return true;
    }
    // Text length isn't correct, displaying custom error messages
    if(text.length < minLength){
        if(minLength === 1){
            Session.set('message', {type:'header', headerContent:"La longueur minimale du texte doit être de 1 caractère.", style:"is-danger"});
        } else{
            Session.set('message', {type:'header', headerContent:"La longueur minimale du texte doit être de "+minLength+" caractères.", style:"is-danger"});
        }
    } else if(text.length > maxLength){
        if(maxLength === 1){
            Session.set('message', {type:'header', headerContent:"Vous ne pouvez pas sélectionner plus d'1 fichier.", style:"is-danger"});
        } else{
            Session.set('message', {type:'header', headerContent:"La longueur du texte ne peut dépasser "+maxLength+" caractères.", style:"is-danger"});
        }
    }
    return false;
};




/**
 * Check if a password match all criteria and match it's confirmation
 *
 *  @param  {string}         password   Content of the password input
 *  @param  {string}  confirmPassword   Content of the password confirmation input
 *  @param  {int}           minLength   Minimum char length, default = 6
 *  @param  {int}           maxLength   Maximum char length, default = 100
 *  @param  {list}     forbiddenChars   List of forbidden characters
 *
 *  @return {boolean}  true if password matched all criteria, else false
 */
checkPasswordsInput = function(password, confirmPassword, minLength=6, maxLength=100, forbiddenChars=[' ']){
    if(password.length >= minLength && password.length <= maxLength){
        for(var char of forbiddenChars){
            if(password.includes(char)){
                Session.set('message', {type:"header", headerContent:'Le mot de passe ne peut pas contenir "'+char+'".', style:"is-danger"} );
                return false;
           }
        }
        if(password !== confirmPassword){
            Session.set('message', {type:"header", headerContent:"Les mots de passe ne correspondent pas", style:"is-danger"} );
            return false;
        } else{
            // Password match all criteria
            return true;
        }
    }
    // Password length isn't correct
    Session.set('message', {type:"header", headerContent:"La taille du mot de passe n'est pas correcte.", style:"is-danger"} );
    return false;
};




/**
 * Check if a text match all criteria
 *
 *  @param  {string}  email   Content of the email input
 *
 *  @return {boolean}  true if the text matched all criteria, else false
 */
checkEmailInput = function(email){
    if(email.includes('@')){
        return true;
    }
    return false;
};




/**
 * Check a field height to auto expand it
 *
 *  @param  {Object}  field   The field to check
 *
 */
autoExpand = function(field){
    if(field.value.length === 0){
        // If the field is empty, reset the style height to min-height
        field.style.height = 3 + 'rem';
    } else{
        // Reset field height
        field.style.height = 'inherit';

        // Calculate the height based on the scroll height
        field.style.height = field.scrollHeight + 'px';
    }
};
