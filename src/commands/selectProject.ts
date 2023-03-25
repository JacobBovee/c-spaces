import * as vscode from 'vscode';
import { dotnetListPackageReferences } from '../Services/DotnetTasks';
import { getFilesInExplorerOfTypes, getPathsFromUri } from '../utils';
import { ParsedPath } from 'path';
import { VsProject } from '../Services/VsProject';
import { CodeWorkspace } from '../Services/CodeWorkspace';
// import { VirtualWorkspace } from '../Services/Workspaces';

async function promptForProjectSelect(files: ParsedPath[]): Promise<ParsedPath | undefined> {    
    // Show options for projects
    const selectedProjectedLabel = await vscode.window.showQuickPick(files.map(file => file.base));
    
    // Get and return user selected project
    if (selectedProjectedLabel) {
        const selectedProject = files.find(file => file.base === selectedProjectedLabel);
        if (selectedProject) {
            return selectedProject;
        } 
        throw new Error('File does not exist');
    } else {
        vscode.window.showInformationMessage('No file selected');
    }
}

export default async function selectProject(context: vscode.ExtensionContext) {
    // TODO: This should search the root of the project regardless of which workspace is open. 
    const files: ParsedPath[] = await getFilesInExplorerOfTypes(['csproj', 'sln'])
        .then(getPathsFromUri);
    
    const selectedProject = await promptForProjectSelect(files);

    if (selectedProject) {
        // const virtualWorkspace = VirtualWorkspace.CreateWorkspace(selectedProject, files, context);
        // virtualWorkspace.createWorkspaceFromVirtualWorkspace();
        const project = new VsProject(selectedProject);
        const codeWorkspace = new CodeWorkspace(project, context).save().open();
    }
}