import * as vscode from 'vscode';
import selectProject from './commands/selectProject';

export function activate(context: vscode.ExtensionContext) {
	console.log('Startup');

	let disposable = vscode.commands.registerCommand('c-spaces.selectProject', () => selectProject(context));

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
