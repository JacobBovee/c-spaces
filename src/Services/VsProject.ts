import { dotnetListPackageReferences, dotnetListSlnProjects } from "./DotnetTasks";
import * as path from 'path';

enum VsType {
    sln = "sln",
    project = "csproj",
    unknown = "unknown"
}

/**
 * Represents a Visual Studio project, either a solution or a project
 * TODO: This could probably just be an interface and a couple helper methods to initialize it. 
 */
export class VsProject {
    public name: string;
    public projectPath: path.ParsedPath;
    public type: VsType;
    public dependencies: VsProject[];
    public packages: string[];

    // TODO: Add a recursive flag to get all dependencies of dependencies
    constructor(projectPath: path.ParsedPath, getDependencies: boolean = true) {
        this.projectPath = projectPath;
        this.name = this.projectPath.name;
        this.type = this._getProjectType(this.projectPath.ext);
        this.dependencies = getDependencies ? this._getDependencies(this.type) : [];
        // TODO: Might be worth it to get the packages from the dependencies if requested. Mount a virtual directory?
        this.packages = [];
    }

    /**
     * Gets the dependencies of the project
     * @param type Type of project
     * @returns The list of dependencies as VsProjects
     */
    private _getDependencies(type: VsType): VsProject[] {
        const stringPath = path.format(this.projectPath);
        const dependencies = type === VsType.sln ? dotnetListSlnProjects(stringPath) : dotnetListPackageReferences(stringPath);
        return dependencies.map((dependency) => new VsProject(path.parse(path.join(this.projectPath.dir, dependency)), false));
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
        } else if (ext === VsType.project) {
            return VsType.project;
        }
        return VsType.unknown;
    }
}