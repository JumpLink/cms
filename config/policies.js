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

  '*': true, // all routes allowed e.g dynamic routes with ThemeController.check, check config/routes.js for that 

  BlogController: {
    'setup': 'developerOrBetter',
    'create': 'bloggerOrBetter',
    'update': 'bloggerOrBetter',
    'upload': 'bloggerOrBetter',
    'find': true,
    'destroy': 'bloggerOrBetter',
  },

  CMSController: {
    'setup': 'developerOrBetter',
    'infoUser': true
  },

  ConfigController: {
    'setup': 'developerOrBetter',
    'find': true
  },

  ContentController: {
    'setup': 'developerOrBetter',
    'find': true,
    'findAll': true,
    'findAllWithImage': true
  },

  DocsController: {
    'setup': 'developerOrBetter',
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
    'setup': 'developerOrBetter',
    'upload': true,
    'convert': true,
  },

  EmailController: {
    'setup': 'developerOrBetter',
    'send': true,
    'contact': true,
    'application': true,
  },

  GalleryController: {
    'setup': 'developerOrBetter',
    'find': true,
    'findOne': true,
    'upload': 'siteadminOrBetter'
  },

  LocaleController: {
    'setup': 'developerOrBetter',
  },

  MagentoController: {
    'setup': 'developerOrBetter',
  },

  MarkdownController: {
    'setup': 'developerOrBetter',
    'find': true
  },

  MemberController: {
    'setup': 'developerOrBetter',
    'find': true,
  },

  MultisiteController: {
    'find': 'superadmin',
    'findNames': 'superadmin',
    'findHosts': 'superadmin',
  },

  NavigationController: {
    'setup': 'developerOrBetter',
    'find': true
  },

  RoutesController: {
    'setup': 'developerOrBetter',
    'update': 'siteadminOrBetter',
    'destroy': 'siteadminOrBetter',
    'create': 'siteadminOrBetter',
    'updateOrCreate': 'siteadminOrBetter',
    'updateOrCreateByHost': 'superadmin',
    'updateOrCreateEach': 'siteadminOrBetter',
    'updateOrCreateEachByHost': 'superadmin',
    'find': true,
    'findByHost': 'superadmin',
  },

  SessionController: {
    'setup': 'developerOrBetter',
    'create': true,
    'subscribe': true,
    'authenticated': true,
    'bloggerOrBetter': true,
    'developerOrBetter': true,
    'siteadminOrBetter': true,
    'superadmin': true,
    'employee': true,
    'employeeOrBetter': true,
    'getAllPolicies': true,
    'getUser': true
  },

  SetupController: {
    '*': 'developerOrBetter',
  },

  ThemeController: {
    'setup': 'developerOrBetter',
    'assets': true,
    'likeAssets': true,
    'favicon': true,
    'signin': true,
    'modern': true,
    'fallback': true,
    'view': true,
    'find': 'siteadminOrBetter',
    'findByHost': 'superadmin',
    'updateOrCreate': 'siteadminOrBetter',
    'updateOrCreateByHost': 'superadmin',
    'updateOrCreateEach': 'siteadminOrBetter',
    'updateOrCreateEachByHost': 'siteadminOrBetter',
    'dynamicForced': true,
    'dynamicSupported': true,
    'dynamicRoute': true,
  },

  TimelineController: {
    'setup': 'developerOrBetter',
    'find': true,
  },
  
  UserController: {
    'setup': 'developerOrBetter',
    'update': 'siteadminOrBetter', // TODO the user self
    'destroy': 'siteadminOrBetter',
    'create': 'siteadminOrBetter',
    'find': 'siteadminOrBetter', // TODO the user self or everyone?
  },

  VWHeritageController: {
    'setup': 'developerOrBetter',
    'find': true,
  }
};
