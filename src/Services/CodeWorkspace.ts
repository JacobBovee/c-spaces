import * as vscode from 'vscode';
import { VsProject } from "./VsProject";
import * as path from 'path';
import * as fs from 'fs';

interface CodeWorkspaceFolder {
    name: string;
    path: string;
}
interface Settings {
    [key: string]: any;
}

/**
 * Represents a VSCode Workspace file
 */
export class CodeWorkspace {
    public readonly name: string;
    public folders: CodeWorkspaceFolder[];
    public settings: Settings;
    private _workspaceUri?: vscode.Uri;
    private _context: vscode.ExtensionContext;

    constructor(vsProject: VsProject, context: vscode.ExtensionContext) {
        this.name = vsProject.name;
        this.folders = this._getFolders(vsProject);
        this.settings = this._getSettings();
        this._context = context;
    }

    /**
     * Saves a code workspace to disk
     * @returns The CodeWorkspace
     */
    public save(): CodeWorkspace {
        if (!this._workspaceUri) {
            this._workspaceUri = this._getWorkspaceUri();
        }

        const serializedWorkspace = this._getSerializedWorkspace();
        fs.writeFileSync(this._workspaceUri.fsPath, serializedWorkspace);
        return this;
    }

    /**
     * Opens a code workspace
     * @returns A CodeWorkspace
     */
    public open(): CodeWorkspace {
        vscode.commands.executeCommand('vscode.openFolder', this._workspaceUri);
        return this;
    }

    /**
     * Serializes the workspace to JSON
     * @returns A serialized workspace for saving to disk
     */
    private _getSerializedWorkspace(): string {
        return JSON.stringify({
            folders: this.folders,
            settings: this.settings
        }, null, 2);
    }

    /**
     * Converts a VsProject to a CodeWorkspaceFolder with the option to prefix the name with a string
     * Will be serialized to JSON
     * @param vsProject A VsProject
     * @param prefix A prefix to add to the name
     * @returns A CodeWorkspaceFolder for serializing
     */
    private _vsProjectToFolder(vsProject: VsProject, prefix?: string): CodeWorkspaceFolder {
        return {
            name: (prefix ? `${prefix}: ` : '') + vsProject.name,
            path: path.resolve(vsProject.projectPath.dir)
        };
    }

    /**
     * Get a list of CodeWorkspaceFolders for the given VsProject
     * @param vsProject A VsProject
     * @returns A list of CodeWorkspaceFolders
     */
    private _getFolders(vsProject: VsProject): CodeWorkspaceFolder[] {
        return [
            this._vsProjectToFolder(vsProject, 'Project'),
            ...vsProject.dependencies.map((dependency) => this._vsProjectToFolder(dependency, 'Dependency'))
        ];
    }

    /**
     * Initializes default settings for the workspace.
     * @returns A Settings object for serializing
     */
    private _getSettings(): Settings {
        return {
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
        };
    }

    private _getWorkspaceUri(): vscode.Uri {
        const { storageUri } = this._context;
        if (!storageUri) {
            throw new Error('Storage Uri is undefined');
        }

        // Create storage path if it does not exist
        if (!fs.existsSync(storageUri.fsPath)) {
            fs.mkdirSync(storageUri.fsPath);
        }

        return storageUri.with({ path: `${storageUri.path}/${this.name}.code-workspace` });
    }
}