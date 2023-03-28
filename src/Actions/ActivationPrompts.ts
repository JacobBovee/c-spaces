import * as vscode from 'vscode';
import * as pathlib from 'path';
import { CodeWorkspace } from '../Services/CodeWorkspace';

const YES_OPTION = 'Yes';
const NO_OPTION = 'No';

// When a C# project is opened, prompt the user to open it in a new workspace
export function onCsProjectPromptTask(context: vscode.ExtensionContext) {
    vscode.workspace.onDidOpenTextDocument(async ({ fileName, uri }) => {
        if (fileName.endsWith('.csproj') || fileName.endsWith('.sln')) {
            const selection = await vscode.window.showInformationMessage('Would you like to open this project in a new workspace?', YES_OPTION, NO_OPTION);
            if (selection === YES_OPTION) {
                const uriPath = pathlib.parse(uri.fsPath);
                CodeWorkspace.fromParsedPath(uriPath, context).save().open(true);
            }
        }
    });
};
