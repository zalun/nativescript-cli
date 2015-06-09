///<reference path="../.d.ts"/>
"use strict";
import shell = require("shelljs");
import net = require("net");
import path = require("path");
import util = require("util");
import Future = require("fibers/future");
import constants = require("../constants");
import helpers = require("../common/helpers");
import fs = require("fs");
import os = require("os");

class FirefoxOSProjectService implements IPlatformProjectService {

	private targetApi: string;

	constructor(private $firefoxOSEmulatorServices: Mobile.IEmulatorPlatformServices,
		private $childProcess: IChildProcess,
		private $errors: IErrors,
		private $fs: IFileSystem,
		private $logger: ILogger,
		private $projectData: IProjectData,
		private $propertiesParser: IPropertiesParser,
		private $options: IOptions,
		private $hostInfo: IHostInfo) {
	}

	private _platformData: IPlatformData = null;

	public get platformData(): IPlatformData {
		if (!this._platformData) {
			var projectRoot = path.join(this.$projectData.platformsDir, "firefoxos");

			this._platformData = {
				frameworkPackageName: "tns-firefoxos",
				normalizedPlatformName: "FirefoxOS",
				appDestinationDirectoryPath: path.join(projectRoot, "assets"),
				appResourcesDestinationDirectoryPath: path.join(projectRoot, "res"),
				platformProjectService: this,
				emulatorServices: this.$firefoxOSEmulatorServices,
				projectRoot: projectRoot,
				deviceBuildOutputPath: path.join(this.$projectData.platformsDir, "firefoxos", "bin"),
				validPackageNamesForDevice: [
					util.format("%s-%s.%s", this.$projectData.projectName, "debug", "zip"),
					util.format("%s-%s.%s", this.$projectData.projectName, "release", "zip")
				],
				frameworkFilesExtensions: []
			};
		}

		return this._platformData;
	}

	public validate(): IFuture<void> {
		return (() => {
			this.validatePackageName(this.$projectData.projectId);
			this.validateProjectName(this.$projectData.projectName);

			this.checkAnt().wait() && this.checkFirefoxOS().wait();
		}).future<void>()();
	}

	public createProject(projectRoot: string, frameworkDir: string): IFuture<void> {
		return (() => {
			this.$logger.trace('FXOS DEBUG: createProject');
			this.$logger.trace(projectRoot);
			this.$logger.trace(frameworkDir);
			this.$fs.ensureDirectoryExists(projectRoot).wait();
			// var newTarget = this.getLatestValidAndroidTarget(frameworkDir).wait();
			// var versionNumber = _.last(newTarget.split("-"));
			// if(this.$options.symlink) {
			// 	this.copyResValues(projectRoot, frameworkDir, versionNumber).wait();
			// 	this.copy(projectRoot, frameworkDir, ".project AndroidManifest.xml project.properties custom_rules.xml", "-f").wait();

			// 	this.symlinkDirectory("assets", projectRoot, frameworkDir).wait();
			// 	this.symlinkDirectory("libs", projectRoot, frameworkDir).wait();
			// } else {
			// 	this.copyResValues(projectRoot, frameworkDir, versionNumber).wait();
			// 	this.copy(projectRoot, frameworkDir, "assets libs", "-R").wait();
			this.copy(projectRoot, frameworkDir, "manifest.webapp", "-f").wait();
			// }

			// if(newTarget) {
			// 	this.updateTarget(projectRoot, newTarget).wait();
			// }

			// Create src folder
			var packageName = this.$projectData.projectId;
			var packageAsPath = packageName.replace(/\./g, path.sep);
			var activityDir = path.join(projectRoot, 'src', packageAsPath);
			this.$fs.createDirectory(activityDir).wait();

		}).future<any>()();
	}

	public interpolateData(projectRoot: string): IFuture<void> {
		return (() => {
			console.log('FXOS DEBUG: interpolateData');
			// Interpolate the activity name and package
			var manifestPath = path.join(projectRoot, "manifest.webapp");
			// var safeActivityName = this.$projectData.projectName.replace(/\W/g, '');
			shell.sed('-i', /__NAME__/, this.$projectData.projectName, manifestPath);
			// shell.sed('-i', /__PACKAGE__/, this.$projectData.projectId, manifestPath);
			// shell.sed('-i', /__APILEVEL__/, this.getTarget(projectRoot).wait().split('-')[1], manifestPath);
			// var stringsFilePath = path.join(projectRoot, 'res', 'values', 'strings.xml');
			// shell.sed('-i', /__TITLE_ACTIVITY__/, this.$projectData.projectName, stringsFilePath);
			// shell.sed('-i', /__NAME__/, this.$projectData.projectName, path.join(projectRoot, '.project'));

		}).future<void>()();
	}

	public afterCreateProject(projectRoot: string): IFuture<void> {
		return (() => {
			console.log('FXOS DEBUG: afterCreateProject');
			var targetApi = this.getTarget(projectRoot).wait();
			this.$logger.trace("FirefoxOS target: %s", targetApi);
			// this.runAndroidUpdate(projectRoot, targetApi).wait();
		}).future<void>()();
	}

	public buildProject(projectRoot: string): IFuture<void> {
		return (() => {
			this.$logger.trace('FXOS DEBUG: buildProject (%s)', projectRoot);
			var buildConfiguration = this.$options.release ? "release" : "debug";
			// var args = this.getAntArgs(buildConfiguration, projectRoot);
			// this.spawn('ant', args).wait();
		}).future<void>()();
	}

	public isPlatformPrepared(projectRoot: string): IFuture<boolean> {
		console.log('FXOS DEBUG: isPlatformPrepared');
		return this.$fs.exists(path.join(projectRoot, "assets", constants.APP_FOLDER_NAME));
	}

	public addLibrary(platformData: IPlatformData, libraryPath: string): IFuture<void> {
		return (() => {
			console.log('FXOS DEBUG: addLibrary');
			// var name = path.basename(libraryPath);
			// var projDir = this.$projectData.projectDir;
			// var targetPath = path.join(projDir, "lib", platformData.normalizedPlatformName);
			// this.$fs.ensureDirectoryExists(targetPath).wait();

			// this.parseProjectProperties(libraryPath, targetPath);

			// shell.cp("-f", path.join(libraryPath, "*.jar"), targetPath);
			// var projectLibsDir = path.join(platformData.projectRoot, "libs");
			// this.$fs.ensureDirectoryExists(projectLibsDir).wait();
			// shell.cp("-f", path.join(libraryPath, "*.jar"), projectLibsDir);

			// var targetLibPath = path.join(targetPath, path.basename(libraryPath));

			// var libProjProp = path.join(libraryPath, "project.properties");
			// if (this.$fs.exists(libProjProp).wait()) {
			// 	this.updateProjectReferences(platformData.projectRoot, targetLibPath);
			// }
		}).future<void>()();
	}

	private copy(projectRoot: string, frameworkDir: string, files: string, cpArg: string): IFuture<void> {
		return (() => {
			var paths = files.split(' ').map(p => path.join(frameworkDir, p));
			shell.cp(cpArg, paths, projectRoot);
		}).future<void>()();
	}

	public canUpdatePlatform(currentVersion: string, newVersion: string): IFuture<boolean> {
		console.log('FXOS DEBUG: canUpdatePlatform');
		return Future.fromResult<boolean>(true);
	}

	public updatePlatform(currentVersion: string, newVersion: string): IFuture<void> {
		return (() => {
			console.log('FXOS DEBUG: updatePlatform');
	   	}).future<void>()();
	}

	private validatePackageName(packageName: string): void {
		//Make the package conform to Java package types
		//Enforce underscore limitation
		if (!/^[a-zA-Z]+(\.[a-zA-Z0-9][a-zA-Z0-9_]*)+$/.test(packageName)) {
			this.$errors.fail("Package name must look like: com.company.Name");
		}

		//Class is a reserved word
		if(/\b[Cc]lass\b/.test(packageName)) {
			this.$errors.fail("class is a reserved word");
		}
	}

	private validateProjectName(projectName: string): void {
		if (projectName === '') {
			this.$errors.fail("Project name cannot be empty");
		}

		//Classes in Java don't begin with numbers
		if (/^[0-9]/.test(projectName)) {
			this.$errors.fail("Project name must not begin with a number");
		}
	}

	private checkAnt(): IFuture<void> {
		return (() => {
			try {
				this.$childProcess.exec("ant -version").wait();
			} catch(error) {
				this.$errors.fail("Error executing commands 'ant', make sure you have ant installed and added to your PATH.")
			}
		}).future<void>()();
	}

	private checkFirefoxOS(): IFuture<void> {
		return (() => {
			try {
				this.$childProcess.exec('node-firefox list targets').wait();
			} catch(error) {
				if (error.match(/command\snot\sfound/)) {
					this.$errors.fail("The command \"node-firefox\" failed.");
				} else {
					this.$errors.fail("An error occurred while listing FirefoxOS targets");
				}
			}
		}).future<void>()();
	}

	private getTarget(projectRoot: string): IFuture<string> {
		return (() => {
			if(!this.targetApi) {
				var projectPropertiesFilePath = path.join(projectRoot, "project.properties");

				if (this.$fs.exists(projectPropertiesFilePath).wait()) {
					var properties = this.$propertiesParser.createEditor(projectPropertiesFilePath).wait();
					this.targetApi = properties.get("target");
				}
			}

			return this.targetApi;
		}).future<string>()();
	}

}

$injector.register("firefoxOSProjectService", FirefoxOSProjectService);
