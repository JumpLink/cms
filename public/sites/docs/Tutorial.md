# Tutorial
## Start to create a new theme
To create a new theme create a folder in `[cms root]/public/themes`, the new theme foldername will be the identifer for the theme.
We call or theme `tutorial`.

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
