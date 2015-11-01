# Tutorial

All steps of this tutorial are pushed to a github repository: https://github.com/JumpLink/cms-tutorial-theme

## Step 0: Start to create a new theme

Thinks you need to know (and how it works) before you start with this step:

* [Jade](http://jade-lang.com/)

To create a new theme create a folder in `[cms root]/public/themes`, the new theme foldername will be the identifer for the theme.
We call our theme `tutorial`.

Each theme requires at least the following files:
* theme.json
* views/modern/init.jade
* assets/images/preview.png

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

### Create a new site use the new theme

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

### Try it out

Okay, now you have created a new theme and a new site wich should use our new theme, run the cms `node cms` and open your browser with domain we have chooed: [http://tutorial:1337/](http://tutorial:1337/).
Now you should see just "Hello World", if not, something is wrong.

### Compare
To compare your version with mine, please clone my totorial repository and run `git checkout -f step-0` 

## Step 1: Our first route with AngularJS and AngularUI Router

Thinks you need to know (and how it works) before you start with this step:

* [Bower](http://bower.io/)
* [AngularJS](https://angularjs.org/)
* [AngularUI Router](https://github.com/angular-ui/ui-router)
* [Sails.js](http://sailsjs.org/)
  * [Routes](http://sailsjs.org/documentation/concepts/routes)
  * [Routing to Controllers]()


### Install AngularJS and AngularUI Router
Third party libraries musst be installed in the assets folder to make them from the cms loadable, so you should create a .bowerrc (if you are using bower) e.g. with the following desitination folder:

```json
{
  "directory": "assets/third-party/"
}
```
After that you can install AngularJS and AngularUI Router with bower `bower install angular angular-ui-router`.

Create a `[theme root]/assets/js/config/app.js` file with the following content

```javascript
var tutorial = angular.module('jumplink.cms.tutorial', ['ui.router']);
```

### First route

Create an new file called `[theme root]/assets/config/routes.js`
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

Content of `[theme root]/views/modern/helloworld/index.jade`

``` jade
h1 Hello World from template file!
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

Open your browser and go to [http://tutorial:1337/](http://tutorial:1337/), you will NOT see the content of your new template file because this is the wrong route.
Now, go to [http://tutorial:1327/#/helloworld](http://tutorial:1327/#/helloworld) and you should see the content of your new template file in your browser.

This is working because the url the cms processed is just `http://tutorial:1327/`,the rest `#/helloworld` is just a [Fragment identifier](https://en.wikipedia.org/wiki/Fragment_identifier) and processed from the client/browser.
If you try to call [http://tutorial:1327/helloworld](http://tutorial:1327/helloworld) the site is not found and the cms prints the error message `[RoutesService.findOneByUrl] Route not found! /helloworld`. The CMS tries also to find any Controller that match this route but there is no `HelloworldController`. So you need to regist this route in the CMS Database.

#### Regist / insert your new route in the CMS database

You can do this by insert a setup json object into your theme.json or by creating this route in the cms admin, the theme.json could look like this

```json
{
  "name": "JumpLink CMS Tutorial Theme",
  "version": "0.0.1",
  "description": "Theme to learn how you can create your own CMS Theme for JumpLink CMS",
  "image": "assets/images/preview.png",
  "modernview": "views/modern/init.jade",
  "license": "MIT",
  "setup": {
    "routes": [
      {
        "position": 1,
        "match": "/*helloworld*",
        "title": "Hello World",
        "state": {
          "name": "layout.helloworld",
          "customstate": false,
          "url": "",
          "views": "",
          "resolve": "",
          "parent": "layout"
        },
        "fallback": {
          "url": ""
        },
        "main": true,
        "key": "helloworld",
        "objectName": "layoutHelloworld",
        "sitetitle": "Tutorial - Hello World",
        "url": "/helloworld",
        "navbar": "header"
      }
    ]
  }
}
```

In this step the important entries are
 * `main: true` If this route is not a main route it will be ignored from the cms
 * `url` To let the CMS find your route
The other parts are later important.

If the route is defined in your theme.json setup you can call [http://tutorial:1327/routes/setup](http://tutorial:1327/routes/setup) and the CMS will take the routes objects from your theme.json and will insert them in his database for the current site with the domain you call in your browser. Please note: This is only possible in the `develoment` mode!

To remove the `#` from the url you need to add the base tag `base(href="/")` to your html head:
```jade
doctype html
html(ng-app="jumplink.cms.tutorial")
  head
    base(href="/")
    title JumpLink CMS Tutorial
  body
    | Hello World
    span(ui-view="layout")
  script(src="/assets/third-party/angular/angular.js")
  script(src="/assets/third-party/angular-ui-router/release/angular-ui-router.js")
  script(src="/assets/js/config/app.js")
  script(src="/assets/js/config/routes.js")
```

and to activate the angular html5Mode in your `app.js` with `$locationProvider.html5Mode(true);`:
```javascript
tutorial.config( function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
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

Now you should be able to call [http://tutorial:1327/helloworld](http://tutorial:1327/helloworld) and to see your `helloworld/index.jade` template file.

### Compare
To compare your version with mine, please clone my repository and run `git checkout -f step-1` 

## Step 2: Our first route with AngularJS and AngularUI Router

Thinks you need to know (and how it works) before you start with this step:

* ...

Now we need the [jumplink-cms-angular](https://github.com/JumpLink/cms-angular) module:

```
bower install JumpLink/cms-angular --save
```


