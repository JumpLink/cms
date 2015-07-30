/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 *
 * Here's an example of mapping some policies to run before a controller
 * and its actions:
 *
 * ```
 * RabbitController: {
 * 
 *   // Apply the `false` policy as the default for all of RabbitController's actions
 *   // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
 *   '*': false,
 *
 *   // For the action `nurture`, apply the 'isRabbitMother' policy
 *   // (this overrides `false` above)
 *   nurture  : 'isRabbitMother',

 *   // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
 *   // before letting any users feed our rabbits
 *   feed : ['isNiceToAnimals', 'hasRabbitFood']
 * }
 * ```
 */
module.exports.policies = {

  /**
   * Default policy for all controllers and actions (`true` allows publicaccess)
   */
  '*': 'sessionAuth',

  CMSController: {
    'setup': 'sessionAuthDev',
    'infoUser': true
  },

  ConfigController: {
    'setup': 'sessionAuthDev',
    'find': true
  },

  ContentController: {
    'setup': 'sessionAuthDev',
    'find': true,
    'findAll': true,
    'findAllWithImage': true
  },

  DocsController: {
    'setup': 'sessionAuthDev',
    'config': true,
    'controllers': true,
    'policies': true,
    'services': true,
    'adapters': true,
    'models': true,
    'hooks': true,
    'blueprints': true,
    'responses': true,
    'views': true,
    'available': true,
    'all': true
  },

  DocumentController: {
    'setup': 'sessionAuthDev',
    'upload': true,
    'convert': true,
  },

  EmailController: {
    'setup': 'sessionAuthDev',
    'send': true,
    'contact': true,
    'application': true,
  },

  GalleryController: {
    'setup': 'sessionAuthDev',
    'find': true,
    'findOne': true,
  },

  LocaleController: {
    'setup': 'sessionAuthDev',
  },

  MagentoController: {
    'setup': 'sessionAuthDev',
  },

  MarkdownController: {
    'setup': 'sessionAuthDev',
    'find': true
  },


  MemberController: {
    'setup': 'sessionAuthDev',
    'find': true,
  },

  NavigationController: {
    'setup': 'sessionAuthDev',
    'find': true
  },

  SessionController: {
    'setup': 'sessionAuthDev',
    'create': true,
    'subscribe': true,
    'authenticated': true
  },

  SetupController: {
    '*': 'sessionAuthDev',
  },

  ThemeController: {
    'setup': 'sessionAuthDev',
    'assets': true,
    'likeAssets': true,
    'favicon': true,
    'signin': true,
    'modern': true,
    'fallback': true,
    'view': true
  },

  TimelineController: {
    'setup': 'sessionAuthDev',
    'find': true,
  },
  
  UserController: {
    'setup': 'sessionAuthDev',
    'find': true,
  },

  VWHeritageController: {
    'setup': 'sessionAuthDev',
    'find': true,
  }
};
