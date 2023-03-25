import { ParsedPath, parse } from 'path';
import * as vscode from 'vscode';

// Get all files in the explorer of a certain type
export const getFilesInExplorerOfTypes = (types: string[]): Thenable<vscode.Uri[]> => vscode.workspace
    .findFiles(`**/*.{${types.join(',')}}`);

export const getPathsFromUri = (fileUris: vscode.Uri[]): ParsedPath[] => {
    return fileUris.map(file => parse(file.fsPath));
};
