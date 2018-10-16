'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('./helpers/prototypes');
const path = require('path');
const chai = require('chai');
const config = require('./helpers/config.helper').default;
const modulesLoader = require('./helpers/modules-loader.helper.js').create();
const { deleteReports } = require('./helpers/delete-files.helper');
const { prepareCatalogs } = require('./helpers/prepare-catalogs.helper');
const browsersConfiguration = require('./helpers/browsers-config.helper');
const chaiAsPromised = require('chai-as-promised');
const { emailService } = require('./emails');
const commandArgs = require('minimist')(process.argv.slice(2));
chai.use(chaiAsPromised);

const reportsDirectory = path.join(config.projectPath, config.reports);
const jsonOutputDirectory = path.join(reportsDirectory, 'json-output-folder');
const generatedReportsDirectory = path.join(reportsDirectory, 'report');
const featureReportsDirectory = path.join(generatedReportsDirectory, 'features');
const performanceReportsDirectory = path.join(reportsDirectory, 'performance');

const prepareReportCatalogs = () => {
  prepareCatalogs(reportsDirectory);
  prepareCatalogs(generatedReportsDirectory);
  prepareCatalogs(featureReportsDirectory);
  prepareCatalogs(performanceReportsDirectory);
};

const deleteReportFiles = () => {
  deleteReports(reportsDirectory);
  deleteReports(jsonOutputDirectory);
  deleteReports(generatedReportsDirectory);
  deleteReports(featureReportsDirectory);
  deleteReports(performanceReportsDirectory);

  console.log('All reports have been deleted!');
};

exports.config = {
  getMultiCapabilities: browsersConfiguration(config, commandArgs),

  useAllAngular2AppRoots: config.type === 'ng2',

  getPageTimeout: parseInt(config.timeout) * 1000,
  allScriptsTimeout: parseInt(config.timeout) * 1000,

  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  specs: config.features.map(file => path.join(config.projectPath, file, '**/*.feature')),

  cucumberOpts: {
    require: ['./configuration/config.js', './configuration/hooks.js', './step_definitions/**/*.js', ...config.step_definitions.map(file => path.join(config.projectPath, file, '**/*.js')), ...config.hooks.map(file => path.join(config.projectPath, file, '**/*.js'))],
    format: [`json:./${config.reports}/features-report.json`],
    profile: false,
    'no-source': true
  },

  plugins: [{
    package: 'protractor-multiple-cucumber-html-reporter-plugin',
    options: {
      removeExistingJsonReportFile: true,
      removeOriginalJsonReportFile: true,
      automaticallyGenerateReport: true,
      saveCollectedJSON: true
    }
  }],

  onPrepare: (() => {
    var _ref = _asyncToGenerator(function* () {
      yield prepareReportCatalogs();
      yield deleteReportFiles();

      if (!config.headless) {
        browser.driver.manage().window().setSize(parseInt(config.browserWidth), parseInt(config.browserHeight));
      }

      modulesLoader.getModules('matchers');
      modulesLoader.getModules('dictionaries');
      modulesLoader.getModules('generators');
      modulesLoader.getModules('comparators');
      modulesLoader.getModules('form_handlers');
      modulesLoader.getModules('transformers');
      modulesLoader.getModules('emails');

      const modules = modulesLoader.getModulesAsObject(config.pages.map(function (page) {
        return path.join(config.projectPath, page);
      }));

      browser.page = Object.keys(modules).reduce(function (pages, moduleName) {
        return _extends({}, pages, { [moduleName]: new modules[moduleName]() });
      }, {});

      global.expect = chai.expect;

      if (config.clearEmailInboxBeforeTests) {
        return emailService.clearInbox();
      }
    });

    return function onPrepare() {
      return _ref.apply(this, arguments);
    };
  })(),

  baseUrl: config.baseUrl
};