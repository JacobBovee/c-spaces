import * as fs from 'fs';

// TODO: Parse sln file and get all csproj files
export default class Sln {
    public static parse(path: string) {
        // Get text contents of sln file
        const contents = fs.readFileSync(path, 'utf8');
        // Parse all csproj files from sln file
        const csprojFiles = contents.match(/Project\(".*"\) = ".*", "(.*)", ".*"\r/g);
        
    }
}