# Getting started

## System Requirements
* Linux (Other OS's not tested)
* [Node.js or io.js with NPM](https://github.com/creationix/nvm)
* ImageMagick
* [Bower](http://bower.io/)
* [Grunt](http://gruntjs.com/)

## Install

Clone this git-repo including the git submodules for themes and install the dependencies with NPM:

    git clone --recursive https://github.com/JumpLink/cms.git
    cd cms
    npm install

go into each Theme and install the theme dependencies with bower and NPM.

    cd public/themes/bootstrap
    npm install; bower install
    
    cd ../default_docs
    npm install; bower install
    ...

To test if the CMS is running, run

    node cms
    
within the CMS folder.

## Setup

## Server configuration

### Authbind

To receive emails with this CMS you need to get access to port 25, access to ports under 1000 are only allowed by root. To work around this limitation you can use [authbind](https://www.debian-administration.org/article/386/Running_network_services_as_a_non-root_user.) for example. On Debian / Ubuntu based linux boxes you can install it with

    sudo apt-get install authbind
    
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
        ServerAdmin info@jumplink.eu
        ServerName cms.nvc
        ServerAlias cms.bugwelder cms.ffcux cms.jumplink
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
        root /home/cms/cms;
        server_name cms.nvc cms.ffcux;
        location ~ ^/ {
            client_max_body_size 500M;
            proxy_pass http://127.0.0.1:1327;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
