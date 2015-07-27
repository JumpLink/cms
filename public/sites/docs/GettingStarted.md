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

## Run

    iojs cms
or

    node cms

## Setup

## Server configuration
### [Forever](https://github.com/foreverjs/forever)
Install forever to ensure that the cms runs continuously on your Server.

    npm install forever -g
    
Start the cms app with forever

    forever start cms.js

If this works, configure your cronjob to start the cms with forever on each reboot automatically.

    crontab -e
    
example line for io.js/node.js installed with nvm (you need to customize this, if you want to use it):

    @reboot (/home/[username]/.nvm/versions/[io.js|node.js]/[version]/bin/[iojs|node] /root/.nvm/versions/io.js/[version]/bin/forever start /home/[username]/cms/cms.js)

### Proxy

#### Apache2 Example

```
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
```

#### Nginx Example

```
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
```
