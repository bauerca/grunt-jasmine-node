module.exports = function (grunt) {
    'use strict';

    grunt.registerMultiTask("jasmine_node", "Runs jasmine-node.", function() {
      var jasmine = require('jasmine-node');
      var util;
      // TODO: ditch this when grunt v0.4 is released
      grunt.util = grunt.util || grunt.utils;
      var Path = require('path');
      var _ = grunt.util._;

      try {
          util = require('util');
      } catch(e) {
          util = require('sys');
      }

      var projectRoot     = this.data.projectRoot || ".";
      var specFolders     = this.data.specFolders || [];
      var source          = this.data.source || "src";
      var specNameMatcher = this.data.specNameMatcher || "spec";
      var teamcity        = this.data.teamcity || false;
      var useRequireJs    = this.data.requirejs || false;
      var extensions      = this.data.extensions || "js";
      var match           = this.data.match || ".";
      var matchall        = this.data.matchall || false;
      var autotest        = this.data.autotest || false;
      var useHelpers      = this.data.useHelpers || false;
      var forceExit       = this.data.forceExit || false;
      var useCoffee       = this.data.useCoffee || false;

      var isVerbose       = this.data.verbose;
      var showColors      = this.data.colors;

      if (projectRoot) {
        specFolders.push(projectRoot);
      }

      if (_.isUndefined(isVerbose)) {
        isVerbose = true;
      }

      if (_.isUndefined(showColors)) {
        showColors = true;
      }

      var junitreport = {
          report: false,
          savePath : "./reports/",
          useDotNotation: true,
          consolidate: true
      };

      var jUnit = this.data.jUnit || junitreport;

      // Tell grunt this task is asynchronous.
      var done = this.async();

      var regExpSpec = new RegExp(match + (matchall ? "" : specNameMatcher + "\\.") + "(" + extensions + ")$", 'i');
      var onComplete = function(runner, log) {
        var exitCode;
        util.print('\n');
        if (runner.results().failedCount === 0) {
          exitCode = 0;
        } else {
          exitCode = 1;

          if (forceExit) {
            process.exit(exitCode);
          }
        }

        done(exitCode === 0);
      };

      var options = {
        match:           match,
        matchall:        matchall,
        specNameMatcher: specNameMatcher,
        extensions:      extensions,
        specFolders:     specFolders,
        onComplete:      onComplete,
        isVerbose:       isVerbose,
        showColors:      showColors,
        teamcity:        teamcity,
        useRequireJs:    useRequireJs,
        coffee:          useCoffee,
        regExpSpec:      regExpSpec,
        junitreport:     jUnit
      };


      // order is preserved in node.js
      var legacyArguments = Object.keys(options).map(function(key) {
        return options[key];
      });

      if (useHelpers) {
        jasmine.loadHelpersInFolder(projectRoot,
        new RegExp("helpers?\\.(" + extensions + ")$", 'i'));
      }

      try {
        // for jasmine-node@1.0.27 individual arguments need to be passed
        jasmine.executeSpecsInFolder.apply(this, legacyArguments);
      }
      catch (e) {
        try {
          // since jasmine-node@1.0.28 an options object need to be passed
          jasmine.executeSpecsInFolder(options);
        } catch (e) {
          console.log('Failed to execute "jasmine.executeSpecsInFolder": ' + e.stack);
        }
      }
    });
};
