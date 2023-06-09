import * as vscode from 'vscode';
import { dotnetListPackageReferences, dotnetListSlnProjects } from "./DotnetTasks";
import * as pathlib from 'path';

export const projectTypes = ['csproj', 'vbproj', 'dbproj'];

export enum VsType {
    sln = "sln",
    project = "project",
    unknown = "unknown"
}

/**
 * Represents a Visual Studio project, either a solution or a project
 * TODO: This could probably just be an interface and a couple helper methods to initialize it. 
 */
export class VsProject {
    public name: string;
    public path: pathlib.ParsedPath;
    public type: VsType;
    public dependencies: VsProject[];
    public packages: string[];

    // TODO: Add a recursive flag to get all dependencies of dependencies
    constructor(path: pathlib.ParsedPath, getDependencies: boolean = true) {
        this.path = path;
        this.name = this.path.name;
        this.type = this._getProjectType(this.path.ext);
        this.dependencies = getDependencies ? this._getDependencies(this.type) : [];
        // TODO: Might be worth it to get the packages from the dependencies if requested. Mount a virtual directory?
        this.packages = [];
    }

    /**
     * Update the project based on a file path. This is useful for when the project is renamed, moved or changed.
     * @param path The path to update the project with
     */
    public update(path: pathlib.ParsedPath) {
        this.path = path;
        this.name = this.path.name;
        this.type = this._getProjectType(this.path.ext);
        this.dependencies = this._getDependencies(this.type);
    }

    /**
     * Initializes the file watcher for the project and its dependencies
     * @param onChangeCb Callback to run when a file changes
     */
    public initializeFileWatcher(onChangeCb: () => void) {
        const watcher = vscode.workspace.createFileSystemWatcher(pathlib.format(this.path));
        watcher.onDidChange((e) => {
            try {
                this.update(this.path);
                onChangeCb();
            } catch (e) {
                console.error("Failed update, may be a parsing error if file format is innacurate.", e);
            }
        });
    }

    /**
     * Gets the dependencies of the project
     * @param type Type of project
     * @returns The list of dependencies as VsProjects
     */
    private _getDependencies(type: VsType): VsProject[] {
        const stringPath = pathlib.format(this.path);
        const dependencies = type === VsType.sln ? dotnetListSlnProjects(stringPath) : dotnetListPackageReferences(stringPath);
        return dependencies.map((dependency) => new VsProject(pathlib.parse(pathlib.join(this.path.dir, dependency)), false));
    }

    /**
     * Gets the project type from the extension
     * @param ext Extension of the project
     * @returns Project type
     */
    private _getProjectType(ext: string): VsType {
        // Lowercase the extension
        ext = ext.toLowerCase().replace('.', '');

        if (ext === VsType.sln) {
            return VsType.sln;
        } else if (projectTypes.includes(ext)) {
            return VsType.project;
        }
        return VsType.unknown;
    }
}