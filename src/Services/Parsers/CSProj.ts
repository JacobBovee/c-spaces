import * as fs from 'fs';
import * as xmldom from '@xmldom/xmldom';
import { FoundFile } from '../../utils';


interface CSProjProject {
    propertyGroup: {
        targetFramework: string;
        rootNamespace: string;
        assemblyName: string;
    };
    itemGroup: {
        packageReference: {
            include: string;
            version: string;
        }[];
        projectReference: {
            include: string;
        }[];
    };
}

export default class CSProj {
    public project: CSProjProject;
    public foundFile: FoundFile;

    constructor(project: CSProjProject, foundFile: FoundFile) {
        this.project = project;
        this.foundFile = foundFile;
    }

    public static parse(file: FoundFile): CSProj {
        try {
            const contents = CSProj._parseXmlToJs(file.file.fsPath);
            const projectContents = contents.getElementsByTagName('Project')[0];
            const propertyGroup = projectContents?.getElementsByTagName('PropertyGroup')[0];
            // Get all PackageReference elements from project contents
            const packageReferences = projectContents?.getElementsByTagName('PackageReference');
            // Get all ProjectReference elements from project contents
            const projectReferences = projectContents?.getElementsByTagName('ProjectReference');

            const project = {
                propertyGroup: {
                    targetFramework: propertyGroup?.getElementsByTagName('TargetFramework')[0]?.textContent || '',
                    rootNamespace: propertyGroup?.getElementsByTagName('RootNamespace')[0]?.textContent || '',
                    assemblyName: propertyGroup?.getElementsByTagName('AssemblyName')[0]?.textContent || ''
                },
                itemGroup: {
                    packageReference: Array.from(packageReferences || []).map((packageReference) => {
                        return {
                            include: packageReference?.getAttribute('Include') || '',
                            version: packageReference?.getAttribute('Version') || ''
                        };
                    }),
                    projectReference: Array.from(projectReferences || []).map((projectReference) => ({ include: projectReference.getAttribute('Include') || '' })),
                }
            };
            return new CSProj(project, file);
        } catch (e) {
            throw new Error('Could not parse a csproj file');
        }
    }

    public get isTestProject(): boolean {
        return this.project.propertyGroup.rootNamespace.endsWith('.Tests');
    }

    private static _getFileContents(path: string): string {
        return fs.readFileSync(path, 'utf8');
    }

    private static _parseXmlToJs(path: string): Document {
        const parser = new xmldom.DOMParser();
        const xml = CSProj._getFileContents(path);
        return parser.parseFromString(xml, 'text/xml');
    }
}