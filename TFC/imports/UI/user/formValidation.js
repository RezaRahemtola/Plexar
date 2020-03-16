
isValidPassword = function(password){
    if(password.length < 6){
        Session.set('message', {type:"header", headerContent:'Le mot de passe doit faire plus de 6 caractères', style:"is-danger"} );
        return false;
    } else if(password.includes(" ")){
        Session.set('message', {type:"header", headerContent:"Le mot de passe ne peut pas contenir d'espaces", style:"is-danger"} );
        return false;
    }
    return true;
}

areValidPasswords = function(password, confirmPassword){
    if(!isValidPassword(password)){
        return false;
    } else if(password !== confirmPassword){
        Session.set('message', {type:"header", headerContent:"Les mots de passe ne correspondent pas", style:"is-danger"} );
        return false;
    }
    return true;
}
