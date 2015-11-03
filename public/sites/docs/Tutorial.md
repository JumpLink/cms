# Tutorial

All steps of this tutorial are pushed to a github repository: [https://github.com/JumpLink/cms-tutorial-theme](https://github.com/JumpLink/cms-tutorial-theme).

## Step 0: Start to create a new theme

Things you need to know (and how they work) before you start with this step:

* [Jade](http://jade-lang.com/)

To create a new theme create a folder in `[cms root]/public/themes`, the new theme folder name will be the identifier for the theme.
We call our theme `tutorial` (is hereinafter referred to as `[theme root]`).

Each theme requires at least the following files:

* `[theme root]/theme.json` - Describes the theme
* `[theme root]/views/modern/init.jade` - Is always loaded first on each modern route
* `[theme root]/assets/images/preview.png` - To have a preview image of the theme

### theme.json and bower.json
A minimal theme.json could look like


    {
      "name": "JumpLink CMS Tutorial Theme",
      "version": "0.0.1",
      "description": "Theme to learn how you can create your own CMS Theme for JumpLink CMS",
      "image": "assets/images/preview.png",
      "modernview": "views/modern/init.jade"
    }

The bower.json is required to manage third-party modules, [see here](http://bower.io/docs/creating-packages/) to see how you can create it.

### views/modern/init.jade
A minimal init.jade could look like

    doctype html
    html
      head
        title JumpLink CMS Tutorial
      body
        | Hello World

### assets/images/preview.png
This image is just for a preview of the theme in the admin theme.

### Create a new site use the new theme in the local.json

Modify your CMS config file `[cms root]/config/local.json` and add the new object as a parent of `sites`:


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

* `name` is the Name of your site and is needed as an identifier in the CMS database to distinguish the site from other sites.
* `domains` - You can insert multiple domains in this array, the CMS decides on the basis of the domain which site (and the related theme) will be served.
* `fallback.theme` - The theme that will be used if no theme was set up (in the admin) for the current site, this must be the same as the folder name of your new theme.

### /etc/hosts

If you are on your local machine you need to "simulate" the domain to test your site, so you need to add your domain to your `/etc/hosts` file, in our case for example like this:

    [...]
    127.0.1.1       tutorial


### Try it out

Okay, now you have created a new theme and a new site which should use our new theme, run the CMS `node cms` and open your browser with the domain we have chosen: [http://tutorial:1337/](http://tutorial:1337/).
Now you should just see "Hello World", if not, something is wrong.

### Compare

To compare your version with mine, please clone my tutorial repository and run `git checkout -f step-0` 

## Step 1: Our first route with AngularJS and AngularUI Router

Things you need to know (and how they work) before you start with this step:

* [Bower](http://bower.io/)
* [AngularJS](https://angularjs.org/)
* [AngularUI Router](https://github.com/angular-ui/ui-router)
* [Sails.js](http://sailsjs.org/)
  * [Routes](http://sailsjs.org/documentation/concepts/routes)
  * [Routing to Controllers]()


### Install AngularJS and AngularUI Router
Third party libraries must be installed in the assets folder to make them loadable from the CMS, so you should create a .bowerrc (if you are using bower) e.g. with the following destination folder:

    {
      "directory": "assets/third-party/"
    }

After that you can install AngularJS and AngularUI Router with bower `bower install angular angular-ui-router --save`.

### app.js`

Create a `[theme root]/assets/js/config/app.js` file with the following content


    var tutorial = angular.module('jumplink.cms.tutorial', ['ui.router']);


### First route in routes.js

Create a new file called `[theme root]/assets/config/routes.js`

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

Content of `[theme root]/views/modern/helloworld/index.jade`

    h1 Hello World from template file!

### init.jade

And modify your init.jade file to let angular know that this is an angular app, add

`ng-app="jumplink.cms.tutorial"` to your html element and load your javascript files:

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

### Try it out

Open your browser and go to [http://tutorial:1337/](http://tutorial:1337/), you will NOT see the content of your new template file because this is the wrong route.
Now, go to [http://tutorial:1327/#/helloworld](http://tutorial:1327/#/helloworld) and you should see the content of your new template file in your browser.

This is working because the URL the CMS processed is just `http://tutorial:1327/`,the rest `#/helloworld` is just a [Fragment identifier](https://en.wikipedia.org/wiki/Fragment_identifier) and processed by the client/browser.
If you try to call [http://tutorial:1327/helloworld](http://tutorial:1327/helloworld) the site will not be found and the CMS prints the error message `[RoutesService.findOneByUrl] Route not found! /helloworld`. The CMS also tries to find any Controller that would match this url, but there is no `HelloworldController`. So you need to register this route in the CMS database.

#### Register / insert your new route in the CMS database

You can do this by inserting a setup json object into your theme.json or by creating this route in the CMS admin, the theme.json could look like this:

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

In this step the important entries are

* `main: true` - If this route is not a main route it will be ignored by the CMS.
* `url` to let the CMS find your route.

The other parts are important later.

If the route is defined in your theme.json setup you can call [http://tutorial:1327/routes/setup](http://tutorial:1327/routes/setup) and the CMS will take the routes objects from your theme.json and insert them in its database for the current site with the domain you call in your browser. Please note: This is only possible in the `development` mode!

To remove the `#` from the url you need to add the base tag `base(href="/")` to your html head:

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

and to activate the angular html5Mode in your `routes.js` with `$locationProvider.html5Mode(true);`:

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

Now you should be able to call [http://tutorial:1327/helloworld](http://tutorial:1327/helloworld) and see the parsed contents of your `helloworld/index.jade` template file.

### Compare
[See here](https://github.com/JumpLink/cms-tutorial-theme/compare/step-0...step-1) to see all differences between step-0 and step-1 and/or clone my repository and run `git checkout -f step-1` to compare your version with mine.

## Step 2: Layouts and multiple templates

Now we need the [jumplink-cms-angular](https://github.com/JumpLink/cms-angular) module:

    bower install JumpLink/cms-angular --save

### app.js

Add `'jumplink.cms.routes'` as an angular dependency in your `[theme root]/assets/js/config/app.js` file.

    var tutorial = angular.module('jumplink.cms.tutorial', [
      'ui.router',
      'jumplink.cms.routes',
    ]); 

In your `[theme root]/assets/js/config/routes.js` replace `$stateProvider` and `$locationProvider` with `jlRoutesProvider`. The `jlRoutesProvider` is a provider from the jumplink-cms-angular module. It is adapted to the CMS and uses AngularUI Router internally.

    tutorial.config( function(jlRoutesProvider, jlRoutesProvider) {
      jlRoutesProvider.html5Mode(true);
      // Hello World
      jlRoutesProvider.state('helloworld', {
        url: '/helloworld',
        views: {
          'layout' : {
            templateUrl: '/views/modern/helloworld/index.jade',
          },
        }
      });
    });

Now create some new templates:

 * `[theme root]/views/modern/layout.jade` - our new layout file wich will contain directives for 3 templates, the helloworld content, a footer and a toolbar.
 * `[theme root]/views/modern/footer.jade` - a simple footer example
 * `[theme root]/views/modern/toolbar.jade` - a simple toolbar example

### layout.jade

    .main-body
      .toolbar.hidden-print(ui-view="toolbar")
      .content(ui-view="content")
      .footer.hidden-print(ui-view="footer")

the ui-view attributes are the directive for our templates, this directive comes from the AngularUI Router.

### routes.js

For our layout file we need to define layout in our routes.js:

    // basic layout
    jlRoutesProvider.state('layout', {
      abstract: true,
      resolve: {},
      views: {
        'layout' : {
          templateUrl: '/views/modern/layout.jade'
        },
      }
    });

Our Helloworld state needs to be based on our template state now:

    // Hello World View based on the layout state (parent `layout` + state key `helloworld` = route objectname `layoutHelloworld`)
    routeOptions.layoutHelloworld = {
      views: {
        'toolbar' : {
          templateUrl: '/views/modern/toolbar.jade',
        },
        'content' : {
          templateUrl: '/views/modern/helloworld/index.jade',
        },
        'footer' : {
          templateUrl: '/views/modern/footer.jade',
        },
      }
    };

Last but not least we need to init our new states:

    // init all routes from `routes` defined in routeOptions 
    jlRoutesProvider.setRoutes(routes, routeOptions);

To see error messages on your browser's developer console you can catch the state error event at the end of our routes.js file:

    tutorial.run(function ($rootScope, $state, $window, $log) {
      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        $log.error("[config/routes.js] Error", error);
      });
    }); 

### How is the `layoutHelloworld` object assigned to the `/helloworld` url?

Let's look at the helloworld route from step 1 again:

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

There is an objectName property `"objectName": "layoutHelloworld"`, the object name is generated from the key and state.parent properties.
The parent state is `layout` and the key is `helloworld`, so "layout"+"helloworld" in the [CamelCase practice](https://en.wikipedia.org/wiki/CamelCase) results in `layoutHelloworld` and that is exactly the route object name we need to use for our state if we want it to run this state on our `/helloworld` url.

### Parent State / Layout

Each state needs to have a parent, the parent /layout of `layoutHelloworld` is `layout`, this is the reason why our layout has the same name:

    jlRoutesProvider.state('layout', {
      abstract: true,
      resolve: {},
      views: {
        'layout' : {
          templateUrl: '/views/modern/layout.jade'
        },
      }
    });

### Compare
[See here](https://github.com/JumpLink/cms-tutorial-theme/compare/step-1...step-2) to see all differences between step-1 and step-2 and/or clone my repository and run `git checkout -f step-2` to compare your version with mine.