# CMS
## System Requirements
* Linux (Other OS's not tested)
* [Node.js or io.js](https://github.com/creationix/nvm)
* ImageMagick
* [Bower](http://bower.io/)
* [Grunt](http://gruntjs.com/)

## Install

Clone this git-repo including the git submodules for themes

    git clone --recursive https://github.com/JumpLink/cms.git
    cd cms
    npm install

go into each Theme and install the theme dependencies.

    cd public/themes/bootstrap
    npm install
    bower install
    
    cd ../default_docs
    npm install
    bower install
    ...

## Run
    iojs cms
