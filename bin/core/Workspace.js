"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rs = require("recursive-readdir-async");
const fs = require("fs-extra");
const path = require("path");
const WorkspaceTheme_1 = require("./WorkspaceTheme");
const WorkspaceConfig_1 = require("./WorkspaceConfig");
const WorkspacePortalConfig_1 = require("./WorkspacePortalConfig");
const WorkspaceContent_1 = require("./WorkspaceContent");
class Workspace {
    constructor(name) {
        this.name = name;
        this.path = Workspace.getDirectoryPath(name);
        this.config = new WorkspaceConfig_1.default(this.path, 'cli.conf.yaml');
        this.portalConfig = new WorkspacePortalConfig_1.default(this.path, 'portal.conf.yaml');
    }
    getCurrentThemeName() {
        return this.portalConfig.theme;
    }
    async getContent() {
        return await WorkspaceContent_1.default.init(this.path);
    }
    async getTheme(name) {
        return await WorkspaceTheme_1.default.init(this.path, name);
    }
    async getCurrentTheme() {
        return this.getTheme(this.getCurrentThemeName());
    }
    async getThemes() {
        let workspaceThemes = [];
        let themes = await rs.list(path.join(this.path, 'themes'), {
            recursive: false,
            ignoreFolders: false,
        });
        themes = themes.filter((element) => element.isDirectory);
        for (let theme of themes) {
            workspaceThemes.push(await this.getTheme(theme.name));
        }
        return workspaceThemes;
    }
    getLocation() {
        return this.path;
    }
    getConfig(key) {
        return key ? this.config[key] : this.config;
    }
    getPortalConfig(key) {
        return key ? this.portalConfig[key] : this.portalConfig;
    }
    static async init(name) {
        const workspace = new Workspace(name);
        await workspace.config.load();
        await workspace.portalConfig.load();
        return workspace;
    }
    static async exists(name) {
        try {
            const stat = await fs.lstat(Workspace.getDirectoryPath(name));
            return stat && stat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    static getDirectoryPath(name) {
        return path.join(process.cwd(), 'workspaces', name);
    }
}
exports.default = Workspace;