/**
 * ContentController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {


  // example: function (req, res, next) {
  //   TemplateService.example(function(error, result) {
  //     Content.createEach(result, function (error, result) {
  //       if(error)
  //         next(error);
  //       else
  //         res.json(result);
  //     });
  //   });
  // }

  // find: function (req, res, next) {
  //   var name = req.param('name') ? req.param('name') : req.param('id');
  //   // console.log(name);
  //   Content.find({name:name}).exec(function found(err, result) {
  //     // console.log(err);
  //     // console.log(result);
  //     if(typeof result === 'undefined')
  //       return res.notFound();
  //     return res.json(result);
  //   });
  // }


  // , create: function (req, res, next) {
  //   var name = req.param('name');
  //   var data = req.params.all();
  //   Content.create(data).exec(function created (err, data) {

  //   });
  // }


  // warn this creates each time a new id
  replace: function (req, res, next) {

    // Locate and validate name parameter
    var name = req.param('name');
    var content = req.param('content');
    var data = req.params.all();
    // console.log(name);
    // console.log(content);
    // console.log(data);
    if (!name) {
      return res.badRequest('No name provided.');
    }

    // Otherwise, find and destroy the Content in question
    Content.find(name).exec(function found(err, results) {

      // TODO: differentiate between waterline-originated validation errors
      //      and serious underlying issues
      // TODO: Respond with badRequest if an error is encountered, w/ validation info
      if (err) return res.serverError(err);

      // if (!results) return res.notFound();
      // not found
      if (!results)
        Content.create(data).exec(function created (err, data) {
          console.log(data);
          return res.json(data.toJSON());
        });
      else
        Content.destroy({name:name}).exec(function destroyed(err) {
          // TODO: differentiate between waterline-originated validation errors
          //      and serious underlying issues
          // TODO: Respond with badRequest if an error is encountered, w/ validation info
          if (err) return res.serverError(err);

          // Create new instance of Content using data from params
          Content.create(data).exec(function created (err, data) {

            // TODO: differentiate between waterline-originated validation errors
            //      and serious underlying issues
            // TODO: Respond with badRequest if an error is encountered, w/ validation info
            if (err) return res.serverError(err);

            // If we have the pubsub hook, use the Content class's publish method
            // to notify all subscribers about the created item
            if (sails.hooks.pubsub) {
              // sails.log.debug("publishUpdate: "+name);
              // http://sailsjs.org/#/documentation/reference/websockets/resourceful-pubsub/publishUpdate.html
              Content.publishUpdate(name, data.toJSON());
              // Content.publishUpdate('content', data.toJSON());
            }

            // Set status code (HTTP 201: Created)
            res.status(201);

            // Send JSONP-friendly response if it's supported
            return res.jsonp(data.toJSON());

            // Otherwise, strictly JSON.
            return res.json(data.toJSON());
          });
        });
      });
  }

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ContentController)
   */
  , _config: {}


};
