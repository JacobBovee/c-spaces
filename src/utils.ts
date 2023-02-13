import * as vscode from 'vscode';

export interface FoundFile {
    label: string;
    file: vscode.Uri;
}

// Get all files in the explorer of a certain type
export const getFilesInExplorerOfTypes = (types: string[]): Thenable<vscode.Uri[]> => vscode.workspace.findFiles(`**/*.{${types.join(',')}}`);

// Convert vscode uri to FoundFile
const foundFileFromUri = (file: vscode.Uri): FoundFile => ({ label: file.fsPath.split('\\').pop() || '', file: file });

export const getHashMapOfFilesInExplorerOfTypes = async (types: string[]): Promise<Map<string, FoundFile>> => {
    const fileMap = new Map<string, FoundFile>();
    const files = await getFilesInExplorerOfTypes(types);

    // Map of found files from files with label as the key
    files.forEach((file) => fileMap.set(foundFileFromUri(file).label, foundFileFromUri(file)));

    return fileMap;
};
