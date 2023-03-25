import * as exec from 'child_process';

/**
 * Runs a dotnet command
 * @param command Dotnet command to run
 * @returns Output of the command run against parser
 */
function dotnetTaskRunner(command: string) {
    const result = exec.execSync(command).toString();
    return result;
}

/**
 * Get the list of projects from the output of the dotnet list command
 * @param output task runner output
 * @returns List of projects
 */
const parseProjectsFromListOutput = (output: string): string[] => output
    .match(/.*\.(csproj|sln)/g)?.map((project) => project.trim()) || [];

/**
 * List all projects used in the project
 * @param projectPath path of the csharp project
 * @returns List of projects
 */
export const dotnetListPackageReferences = (projectPath: string) => {
    const result = dotnetTaskRunner(`dotnet list ${projectPath} reference`);
    return parseProjectsFromListOutput(result);
};

/**
 * List all packages (nuget, etc) in the project
 * @param projectPath path of the csharp project
 * @returns List of packages
 */
export const dotnetListPackages = (projectPath: string) => {
    const result = dotnetTaskRunner(`dotnet list ${projectPath} package`);
    return parseProjectsFromListOutput(result);
};

/**
 * List all packages (nuget, etc) in the project
 * @param projectPath path of the csharp project
 * @returns List of packages
 */
export const dotnetListSlnProjects = (projectPath: string) => {
    const result = dotnetTaskRunner(`dotnet sln ${projectPath} list`);
    return parseProjectsFromListOutput(result);
};
