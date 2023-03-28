import * as vscode from 'vscode';
import selectProject from './Actions/selectProject';
import { onCsProjectPromptTask as registerCSharpProjectPrompt } from './Actions/ActivationPrompts';

export function activate(context: vscode.ExtensionContext) {
	// User activated commands
	let selectProjectCommand = vscode.commands.registerCommand('c-spaces.selectProject', () => selectProject(context));
	let selectProjectCommandNewWindow = vscode.commands.registerCommand('c-spaces.selectProjectNewWindow', () => selectProject(context, true));

	// When a C# project is opened, prompt the user to open it in a new workspace
	registerCSharpProjectPrompt(context);

	context.subscriptions.push(selectProjectCommand, selectProjectCommandNewWindow);
}

// this method is called when your extension is deactivated
export function deactivate() { }
