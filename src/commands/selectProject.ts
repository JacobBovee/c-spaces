import * as vscode from 'vscode';
import { FoundFile, getHashMapOfFilesInExplorerOfTypes } from "../utils";
import { VirtualWorkspace } from '../Services/Workspaces';

async function getSelectedProject(files: Map<string, FoundFile>): Promise<FoundFile | undefined> {    
    // Show options for projects
    const fileLabels = Array.from(files.keys());
    const selectedProjectedLabel = await vscode.window.showQuickPick(fileLabels);
    
    // Get and return user selected project
    if (selectedProjectedLabel) {
        const selectedProject = files.get(selectedProjectedLabel);
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
    const files = await getHashMapOfFilesInExplorerOfTypes(['csproj', 'sln']);
    const selectedProject = await getSelectedProject(files);

    if (selectedProject) {
        const virtualWorkspace = VirtualWorkspace.initialize(selectedProject, files, context);
        virtualWorkspace.createWorkspaceFromVirtualWorkspace();
    }
}