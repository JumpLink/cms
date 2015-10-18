# Getting started

## System Requirements
* Linux (Other OS's not tested)
* [Node.js or io.js with NVM](https://github.com/creationix/nvm)
* [ImageMagick](http://www.imagemagick.org/) to manipulate images
* [Ghostscript](http://www.ghostscript.com/) and [Poppler Utils](http://poppler.freedesktop.org/) to generate thumbnails from PDF's
* [Bower](http://bower.io/) to install the theme dependencies
* [Grunt](http://gruntjs.com/) to build your theme

### Optinal Requirements
* [Authbind](https://en.wikipedia.org/wiki/Authbind) to receive emails with user rights on port 25
* [Forever](https://github.com/foreverjs/forever) to ensure that the cms runs continuously on your Server
* [Spamassassin and Spamc](https://en.wikipedia.org/wiki/SpamAssassin) to enable email spam protection
* [unoconv](https://github.com/dagwieers/unoconv) to convert documents

## Install Requirements

Install the system requirements, on debian based systems this looks like
l
    sudo apt install imagemagick ghostscript poppler-utils

### Optional Requirements

For the optional requirements

    sudo apt install authbind spamassassin spamc unoconv

And for LibreOffice (on your server [without the gui](http://askubuntu.com/questions/519082/how-to-install-libre-office-without-gui))

    sudo apt install libreoffice --no-install-recommends

## Install CMS

Clone this git-repo and install the dependencies with NPM:

    git clone https://github.com/JumpLink/cms.git
    cd cms
    npm install

### Install Themes

Install the required themes

    git clone https://github.com/JumpLink/cms-admin-theme.git public/themes/admin
    git clone https://github.com/JumpLink/cms-docs-theme.git public/themes/docs

Install the optional themes

    git clone https://github.com/JumpLink/cms-nvc-theme.git public/themes/nvc
    git clone https://github.com/JumpLink/cms-bootstrap-theme.git public/themes/bootstrap

go into each theme, install the theme dependencies with bower and NPM and build the theme

    cd public/themes/admin
    npm install; bower install; grunt build-dev
    
    cd ../docs
    npm install; bower install; grunt build-dev
    ...

## Server configuration

### Authbind

To receive emails with this CMS you need to get access to port 25, access to ports under 1000 are only allowed by root. To work around this limitation you can use [authbind](https://www.debian-administration.org/article/386/Running_network_services_as_a_non-root_user.) for example. On Debian / Ubuntu based linux boxes you can install it with

    sudo apt install authbind
    
To allow access to port 25 for your user (replace user with your desired username) you need to
    
    sudo touch /etc/authbind/byport/25
    sudo chown user:user /etc/authbind/byport/25
    sudo chmod 755 /etc/authbind/byport/25
    
Now you can start applications with authbind to allow this applications to access port 25

    authbind --deep node cms
    
More informations about how you and why you need to configure authbind can you found [on mailin](https://github.com/Flolagale/mailin) which uses the CMS for the mail reception.

### Forever
You can use [forever](https://github.com/foreverjs/forever) to ensure that the cms runs continuously on your Server. To use forever install it with npm

    npm install forever -g
    
Start the cms app with forever and authbind

    authbind --deep forever start cms.js

If this works, configure your cronjob to start the cms with forever on each reboot automatically.

    crontab -e
    
An example line with authbind, forever and for node.js installed with nvm (you need to customize this, if you want to use it) could be:

    @reboot (/usr/bin/authbind --deep /home/[user]/.nvm/versions/node.js/[version]/bin/node /root/.nvm/versions/io.js/[version]/bin/forever start /home/[user]/cms/cms.js)

### Email spam protection

To enable email spam protection install `spamassassin` and `spamc`, on Debian / Ubuntu based linux boxes this looks like

    sudo apt-get install spamassassin spamc

and enable it in `/etc/default/spamassassin`.

### Proxy

#### Apache2 Example

    <VirtualHost *:80>
        ServerAdmin info@domain.io
        ServerName domain.io
        ServerAlias admin.yourdomain.io cms.yourdomain.io domain2.com
        RewriteEngine On
        RewriteCond %{REQUEST_URI}  ^/socket.io            [NC]
        RewriteCond %{QUERY_STRING} transport=websocket    [NC]
        RewriteRule /(.*)           ws://localhost:1337/$1 [P,L]
        ProxyPass / http://localhost:1337/
        ProxyPassReverse / http://localhost:1337/
        ProxyPreserveHost On
    </VirtualHost>

#### Nginx Example

    server {
        listen x.x.x.x:80;
        server_name admin.yourdomain.io cms.yourdomain.io domain2.com;
        location ~ ^/ {
            client_max_body_size 500M;
            proxy_pass http://127.0.0.1:1337;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }



## CMS Configuration

Create an new file as `[cms-path]/config/local.json`

The basic file looks like this:

```
{
  "environment": "development",
  "port": 1337,
  "secret": "AnyStringAsScret123456",
  "paths": {
    "public": "./public",
    "fallback": "fallback",
    "sites": "sites",
    "members": "assets/images/members",
    "gallery": "assets/images/gallery",
    "timeline": "assets/files/timeline",
    "blog": "assets/files/blog",
    "files": "assets/files",
    "uploads": "uploads"
  },
  "sites":[
  ]
}
```

You need to add sites for the admin and docs theme:

```
  "sites":[
    {
      "name": "admin",
      "domains": [
        "admin"
      ],
      "fallback": {
        "theme": "admin"
      }
    },
    {
      "name": "docs",
      "domains": [
        "docs"
      ],
      "fallback": {
        "theme": "docs"
      }
    }
  ]
```

To make this sites locally available on your dev box you need to insert the domains in your `/etc/hosts` file:

    [...]
    127.0.1.1       docs
    127.0.1.1       admin

### Setup basic Routes

Start the CMS by running

    node cms
    
within the CMS folder.

By default the CMS dosn't knows any theme routes, so at first you need to create them by call the following url in your webbrowser:

 * [http://admin:1337/routes/setup](http://admin:1337/routes/setup)
 * [http://docs:1337/routes/setup](http://docs:1337/routes/setup)





