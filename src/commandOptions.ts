import * as program from 'commander';

const pkg = require('../package.json');


type TargetVersion = 'v2' | 'v1';

export class CommandOptions {
    files: string[];
    urls: string[];
    stdin?: boolean;
    out?: string;
    prefix?: string;
    header?: string;
    target: TargetVersion;

    isReadFromStdin(): boolean {
        return this.stdin || this.files.length === 0 && this.urls.length === 0;
    }
}


let opts = new CommandOptions();
clear(opts);

export function initialize(argv?: string[]): commander.ICommand | null {
    if (argv) {
        return parse(opts, argv);
    } else {
        clear(opts);
        return null;
    }
}
export default opts;


function clear(o: CommandOptions): void {
    o.files = [];
    o.urls = [];
    o.stdin = undefined;
    o.out = undefined;
    o.prefix = undefined;
    o.header = undefined;
    o.target = 'v2';
}

function parse(o: CommandOptions, argv: string[]): commander.ICommand {
    const command = new program.Command();

    function collectUrl(val: string, memo: string[]): string[] {
        memo.push(val);
        return memo;
    }
    function normalize(val: string): TargetVersion {
        if (/^v?2$/i.test(val)) {
            return 'v2';
        } else if (/^v?1$/i.test(val)) {
            return 'v1';
        } else {
            return 'v2';
        }
    }

    // <hoge> is reuired, [hoge] is optional
    command
        .version(pkg.version)
        .usage('[options] <file ... | file patterns using node-glob>')
        .option('--url <url>', 'input json schema from the url.', collectUrl, [])
        .option('--stdin', 'read stdin with other files or urls.')
        .option('-o, --out <file>', 'output d.ts filename.')
        .option('-p, --prefix <type prefix>', 'set the prefix of interface name. default is nothing.')
        .option('-h, --header <type header string>', 'set the string of type header.')
        .option('-t, --target [version]', 'set target TypeScript version. select from `v2` or `v1`. default is `v2`.', /^(v?2|v?1)$/i, 'v2')
        .on('--help', () => {
            console.log('  Examples:');
            console.log('');
            console.log('    $ dtsgen --help');
            console.log('    $ dtsgen --out types.d.ts schema/**/*.schema.json');
            console.log('    $ cat schema1.json | dtsgen --target v1');
            console.log('    $ dtsgen -o swaggerSchema.d.ts --url https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v2.0/schema.json');
            console.log('');
        })
        .parse(argv);

    const res = command as any;
    o.files = command.args;
    o.urls = res.url;
    o.stdin = res.stdin;
    o.out = res.out;
    o.prefix = res.prefix;
    o.header = res.header;
    o.target = normalize(res.target);
    return command;
}
