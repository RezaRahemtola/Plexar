![Plexar preview](https://raw.githubusercontent.com/RezaRahemtola/Plexar/master/public/designPreview.jpg "Plexar")


Created as part of [Magic Makers' Tech For Good](https://info.magicmakers.fr/tech-entrepreneurs-for-good) curriculum and in partnership with École Polytechnique and HEC Paris, Plexar is a platform that aims to help people adopt more responsible consumption by discovering products with a positive social impact.

We believe in the power of the collective: on Plexar, each user can propose to add new products, modify those already referenced & much more.


## Installation:

After cloning this repository, you need to install the required modules with
```
npm install
```

You also need to create a `settings.json` file (to set up email sending & admin list) with the following content :
```json
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


## Support this project:

- [One-time donation via PayPal](https://paypal.me/RezaRahemtola)
- If you're using [Brave Browser](https://brave.com/rez051), you can tip me with [BAT](https://basicattentiontoken.org/)
