
isValidPassword = function(password){
    if(password.length < 6){
        Session.set('formErrorMessage', 'Le mot de passe doit faire plus de 6 caractères');
        return false;
    } else if(password.includes(" ")){
        Session.set('formErrorMessage', "Le mot de passe ne peut pas contenir d'espaces");
        return false;
    }
    return true;
}

areValidPasswords = function(password, confirmPassword){
    if(!isValidPassword(password)){
        return false;
    } else if(password !== confirmPassword){
        Session.set('formErrorMessage', "Les mots de passe ne correspondent pas");
        return false;
    }
    return true;
}
