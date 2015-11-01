# Tutorial

All steps of this tutorial are pushed to a github repository: https://github.com/JumpLink/cms-tutorial-theme

## Step 0: Start to create a new theme

Thinks you need to know before you start with this step:

* Jade


To create a new theme create a folder in `[cms root]/public/themes`, the new theme foldername will be the identifer for the theme.
We call our theme `tutorial`.

Each theme requires at least the following files:
theme.json
views/modern/init.jade
assets/images/preview.png

### theme.json
A minimal theme.json could look like

```json
{
  "name": "JumpLink CMS Tutorial Theme",
  "version": "0.0.1",
  "description": "Theme to learn how you can create your own CMS Theme for JumpLink CMS",
  "image": "assets/images/preview.png",
  "modernview": "views/modern/init.jade"
}
```

### views/modern/init.jade
A minimal init.jade could look like

```jade
doctype html
html
  head
    title JumpLink CMS Tutorial
  body
    | Hello World
```

### assets/images/preview.png
This image is just for a preview of the theme in the admin theme

## Create a new site use the new theme

Modify your cms config file `[cms root]/config/local.json` and add the new object as a parent of `sites`:

```json
{
  "name": "tutorial",
  "matchsubdomain": false,
  "domains": [
    "tutorial"
  ],
  "fallback": {
    "theme": "tutorial"
  }
}
```
* `name` is the Name of your site and is needed as a identifier in the cms database to distinguish the site from each other sites
* `domains` you can insert multiple domains in this array, the cms decides on the basis of the domain which site (and the related theme) it will be loaded
* `fallback.theme` The theme that will be used if no theme was set up (in the admin) for the current site, this must be the same as the folder name of your new theme

If you are on your local maschine you need to "simulate" the domain to test your site, so you need to add your domain to your `/etc/hosts` file, for our this case like that:
```
[...]
127.0.1.1       tutorial
```

## Try it out

Okay, now you have created a new theme and a new site wich should use our new theme, run the cms `node cms` and open your browser with domain we have chooed: [http://tutorial:1337/](http://tutorial:1337/).
Now you should see just "Hello World", if not, something is wrong.

## Compare
I have pushed this tutorial to [a github repository](https://github.com/JumpLink/cms-tutorial-theme).
To compare your version with mine, please clone my repository and run `git checkout -f step-0` 

## Step 1: Our first route with angular and AngularUI Router

Thinks you need to know before you start with this tutorial:

* Bower
* [AngularJS](https://angularjs.org/)
* [AngularUI Router](https://github.com/angular-ui/ui-router)


### Install Angular and AngularUI Router
Third party libraries musst be installed in the assets folder to make them from the cms loadable, so you should create a .bowerrc (if you are using bower) e.g. with the following desitination folder:

```json
{
  "directory": "assets/third-party/"
}
```
After that you can install AngularJS and AngularUI Router with bower `bower install angular angular-ui-router`.

Create a `js/config/app.js` file with the following content

```javascript
var tutorial = angular.module('jumplink.cms.tutorial', ['ui.router']);
```

### First route

Create an new file called `tutorial/assets/config/routes`
```javascript
tutorial.config( function($stateProvider) {
  // Hello World
  $stateProvider.state('helloworld', {
    url: '/helloworld',
    views: {
      'layout' : {
        templateUrl: '/views/modern/helloworld/index.jade',
      },
    }
  });
});
```

And modify your init.jade file to let angular know that this is an angular app, add

`ng-app="jumplink.cms.tutorial"` to your html element and load your javascript files:
```jade
doctype html
html(ng-app="jumplink.cms.tutorial")
  head
    title JumpLink CMS Tutorial
  body
    | Hello World
    span(ui-view="layout")
  script(src="/assets/third-party/angular/angular.js")
  script(src="/assets/third-party/angular-ui-router/release/angular-ui-router.js")
  script(src="/assets/js/config/app.js")
  script(src="/assets/js/config/routes.js")
```

