import * as vscode from "vscode";
import { VirtualWorkspace } from "./VirtualWorkspace";
import { FoundFile } from "../../utils";

export class SlnWorkspace extends VirtualWorkspace {
    constructor(name: string, context: vscode.ExtensionContext, foundProjects: Map<string, FoundFile>) {
        super(name, context, foundProjects);
    }

    public createWorkspace(selectedProject: FoundFile): void {
        throw new Error("Method not implemented.");

        // const slnProjects = fileContents.match(/Project\(\".*\"\) = \".*\", \"(.*\.csproj)\", \".*\"\nEndProject/g);
    }
}
