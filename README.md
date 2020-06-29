# Plexar


Before using the app, you need to run the following command to install the required modules :
```
npm install bulma bulma-checkradio bulma-steps bulma-switch dropbox jquery node-fetch node-sass request @creativebulma/bulma-collapsible @sendgrid/mail
```

You also need to create a `settings.json` file (to set up email sending & admin list) with the following content :
```
{
    "smtp": {
        "isSecure": "Boolean, set to true if your smtp service provides a secure connexion (https), else (http) set to false",
        "username": "With SendGrid it's generally apikey",
        "password": "With SendGrid it generally starts with SG.",
        "host": "With SendGrid it's generally smtp.sendgrid.net",
        "port": "Integer, with SendGrid it's generally 465"
    },
    "admin": {
        "list": [
            "Email address of an admin",
            "Email address of another admin"
        ]
    },
    "sendgridContactApiKey": "API Key provided by SendGrid & used to send contact emails (you can use the same that in smtp if you want)"
}
```

If you fork this project, we strongly recommand to add this file in a `.gitignore` as it contains sensitive data.

The app can then be run with those settings like that :
```
meteor --settings path/to/settings.json
```
