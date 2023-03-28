import * as vscode from 'vscode';
import { getFilesInExplorerOfTypes, getPathsFromUri } from '../utils';
import { ParsedPath } from 'path';
import { CodeWorkspace } from '../Services/CodeWorkspace';

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

export default async function selectProject(context: vscode.ExtensionContext, newWindow: boolean = false) {
    // TODO: This should search the root of the project regardless of which workspace is open. 
    const files: ParsedPath[] = await getFilesInExplorerOfTypes(['csproj', 'sln'])
        .then(getPathsFromUri);

    const selectedProject = await promptForProjectSelect(files);

    if (selectedProject) {
        CodeWorkspace.fromParsedPath(selectedProject, context).save().open(newWindow);
    }
}