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
  '*': ['authenticated', 'siteadmin'],

  CMSController: {
    'setup': 'developer',
    'infoUser': true
  },

  ConfigController: {
    'setup': 'developer',
    'find': true
  },

  ContentController: {
    'setup': 'developer',
    'find': true,
    'findAll': true,
    'findAllWithImage': true
  },

  DocsController: {
    'setup': 'developer',
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
    'setup': 'developer',
    'upload': true,
    'convert': true,
  },

  EmailController: {
    'setup': 'developer',
    'send': true,
    'contact': true,
    'application': true,
  },

  GalleryController: {
    'setup': 'developer',
    'find': true,
    'findOne': true,
  },

  LocaleController: {
    'setup': 'developer',
  },

  MagentoController: {
    'setup': 'developer',
  },

  MarkdownController: {
    'setup': 'developer',
    'find': true
  },

  MemberController: {
    'setup': 'developer',
    'find': true,
  },

  MultisiteController: {
    'find': ['authenticated', 'superadmin'],
    'findNames': ['authenticated', 'superadmin'],
    'findHosts': ['authenticated', 'superadmin'],
  },

  NavigationController: {
    'setup': 'developer',
    'find': true
  },

  SessionController: {
    'setup': 'developer',
    'create': true,
    'subscribe': true,
    'authenticated': true
  },

  SetupController: {
    '*': 'developer',
  },

  ThemeController: {
    'setup': 'developer',
    'assets': true,
    'likeAssets': true,
    'favicon': true,
    'signin': true,
    'modern': true,
    'fallback': true,
    'view': true,
    'find': ['authenticated', 'siteadmin'],
    'findByHost': ['authenticated', 'superadmin'],
    'updateOrCreate': ['authenticated', 'siteadmin'],
    'updateOrCreateByHost': ['authenticated', 'superadmin'],
    'updateOrCreateEach': ['authenticated', 'siteadmin'],
    'updateOrCreateEachByHost': ['authenticated', 'siteadmin'],
  },

  TimelineController: {
    'setup': 'developer',
    'find': true,
  },
  
  UserController: {
    'setup': 'developer',
    'find': true,
  },

  VWHeritageController: {
    'setup': 'developer',
    'find': true,
  }
};
