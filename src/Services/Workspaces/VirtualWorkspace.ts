import { FoundFile } from "../../utils";
import * as fs from 'fs';
import * as vscode from 'vscode';
import { SlnWorkspace } from ".";
import { CsprojWorkspace } from ".";

export enum ProjectType {
    project = 0,
    dependency = 1,
    test = 2
}

interface VirtualFolder {
    name: string;
    path: string;
    type: ProjectType;
    file: FoundFile;
}

export abstract class VirtualWorkspace {
    public _name: string;
    protected _projects: VirtualFolder[];
    protected _dependencies: VirtualFolder[];
    protected _tests: VirtualFolder[];
    protected _context: vscode.ExtensionContext;
    protected _workspaceUri?: vscode.Uri;
    protected _foundProjects: Map<string, FoundFile>;

    constructor(name: string, context: vscode.ExtensionContext, foundProjects: Map<string, FoundFile>) {
        this._name = name;
        this._context = context;
        this._projects = [];
        this._dependencies = [];
        this._tests = [];
        this._foundProjects = foundProjects;
    }

    public static initialize(selectedProject: FoundFile, foundProjects: Map<string, FoundFile>, context: vscode.ExtensionContext) {
        const isSln = selectedProject.file.fsPath.endsWith('.sln');
        const workspace = isSln ? new SlnWorkspace(selectedProject.label, context, foundProjects) : new CsprojWorkspace(selectedProject.label, context, foundProjects);

        workspace.createWorkspace(selectedProject);

        return workspace;
    }

    public abstract createWorkspace(selectedProject: FoundFile): void;

    public createWorkspaceFromVirtualWorkspace() {
        const { storageUri } = this._context;
        if (!storageUri) {
            throw new Error('Storage Uri is undefined');
        }

        const workspaceStructure = {
            folders: [...this._projects, ...this._dependencies, ...this._tests].map(folder => ({
                name: `${this._getFriendlyTypeEnum(folder.type)}: ${folder.name}`,
                path: folder.name
            })),
            // TODO: Add a proper settings system
            settings: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'c-cpp-flylint.clangTidyChecks': '*',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'files.exclude': {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "**/.classpath": true,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "**/.project": true,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "**/.settings": true,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "**/.factorypath": true
                }
            }
        };
        // Create storage path if it does not exist
        if (!fs.existsSync(storageUri.fsPath)) {
            fs.mkdirSync(storageUri.fsPath);
        }

        const workspaceExtensionStorageUri = this._context.storageUri?.with({ path: `${storageUri.path}/${this._name}.code-workspace` });

        if (workspaceExtensionStorageUri) {
            fs.writeFileSync(workspaceExtensionStorageUri.fsPath, JSON.stringify(workspaceStructure));
            // Open newly created vscode code-workspace
            vscode.commands.executeCommand('vscode.openFolder', workspaceExtensionStorageUri);
            this._workspaceUri = workspaceExtensionStorageUri;
        }
    }

    protected static _getFolderPathFormatFromProjectPath = (projectPath: string): string => projectPath.split('\\').pop() || '';

    protected _getFileFromProjectPath(projectPath: string): FoundFile {
        // Get file name from project path
        const fileName = VirtualWorkspace._getFolderPathFormatFromProjectPath(projectPath);
        const folder = this._foundProjects.get(fileName);
        if (!folder) {
            throw new Error('Folder does not exist');
        }

        return folder;
    }

    private _getFriendlyTypeEnum(type: ProjectType) {
        switch (type) {
            case ProjectType.project:
                return 'Project';
            case ProjectType.test:
                return 'Test';
            case ProjectType.dependency:
                return 'Dependency';
            default:
                return '';
        }
    }
}