import * as vscode from 'vscode';
import { VirtualWorkspace, ProjectType } from "./VirtualWorkspace";
import { FoundFile } from "../../utils";
import CSProj from "../Parsers/CSProj";

export class CsprojWorkspace extends VirtualWorkspace {
    constructor(name: string, context: vscode.ExtensionContext, foundProjects: Map<string, FoundFile>) {
        super(name, context, foundProjects);
    }

    public createWorkspace(selectedProject: FoundFile): void {
        const parsedSelectedProject = CSProj.parse(selectedProject);
        const parsedDirectProjects = this._parseDirectProjects(parsedSelectedProject);
        const parsedDependentProjects = this._parseDependentProjects(parsedDirectProjects);
        this._setFoldersFromProjects(parsedDirectProjects, parsedDependentProjects);
    }

    private _setFoldersFromProjects(directProjects: CSProj[], dependentProjects: CSProj[]) {
        const testProjects = [
            ...directProjects.filter((project) => project.isTestProject),
            ...dependentProjects.filter((project) => project.isTestProject)
        ];
        this._projects = directProjects.map((project) => this._getVirtualFolderFromProject(project, ProjectType.project));
        this._dependencies = dependentProjects.map((project) => this._getVirtualFolderFromProject(project, ProjectType.dependency));
        this._tests = testProjects.map((project) => this._getVirtualFolderFromProject(project, ProjectType.test));
    }

    private _parseDirectProjects(selectedProject: CSProj) {
        const projectsInSelected = selectedProject.project.itemGroup.projectReference;

        return projectsInSelected.map((projectReference) => {
            const path = this._getFileFromProjectPath(projectReference.include);
            return CSProj.parse(path);
        });
    }

    private _parseDependentProjects(directProjects: CSProj[]) {
        const projectsToParse: CSProj[] = [];
        const directProjectsMap = new Map(directProjects.map((project) => [project.foundFile.label, project]));
        const parsedProjects: Map<string, CSProj> = new Map();
        // Add all direct projects to projects to parse
        projectsToParse.push(...directProjects);
        // While there are projects to parse
        while (projectsToParse.length > 0) {
            // Get the first project to parse
            const project = projectsToParse.shift();
            if (project) {
                // Get all project references
                const projectReferences = project.project.itemGroup.projectReference;
                // For each project reference
                projectReferences.forEach((projectReference) => {
                    // Get the path of the project reference
                    const path = this._getFileFromProjectPath(projectReference.include);
                    // If the project reference is not in the map
                    if (!parsedProjects.has(path.label) || !directProjectsMap.has(path.label)) {
                        // Parse the project
                        const parsedProject = CSProj.parse(path);
                        // Add the project to the map
                        parsedProjects.set(path.label, parsedProject);
                        // Add the project to the projects to parse
                        projectsToParse.push(parsedProject);
                    }
                });
            }
        }

        return Array.from(parsedProjects.values());
    }

    private _getVirtualFolderFromProject(project: CSProj, projectType: ProjectType) {
        return {
            name: project.project.propertyGroup.assemblyName,
            path: project.foundFile.file.fsPath,
            type: projectType,
            file: project.foundFile
        };
    }
}
