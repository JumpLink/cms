# Tutorial

All steps of this tutorial are 

## Step 0: Start to create a new theme
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

Okay, now you have created a new theme and a new site wich should use or new theme, run the cms `node cms` and open your browser with domain we have chooed: [http://tutorial:1337/](http://tutorial:1337/).
Now you should see just "Hello World", if not, something is wrong.

## Compare
I have pushed this tutorial to [a github repository](https://github.com/JumpLink/cms-tutorial-theme).
To compare your version with mine, please clone my repository and run `git checkout -f step-0` 
