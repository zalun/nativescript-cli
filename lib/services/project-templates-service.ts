///<reference path="../.d.ts"/>
"use strict";

import util = require("util");
import path = require("path");
import shell = require("shelljs");
import npm = require("npm");
var helpers = require("../common/helpers");
import Future = require("fibers/future");

export class ProjectTemplatesService implements IProjectTemplatesService {
	private static NPM_DEFAULT_TEMPLATE_NAME = "tns-template-hello-world";

	public constructor(private $npm: INodePackageManager) { }

	public get defaultTemplatePath(): IFuture<string> {
		return this.$npm.install(ProjectTemplatesService.NPM_DEFAULT_TEMPLATE_NAME);
	}
}
$injector.register("projectTemplatesService", ProjectTemplatesService);