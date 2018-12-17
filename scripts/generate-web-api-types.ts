import fs from 'fs';
import * as path from 'path';

import methods from '../config/methods';

const argsInterfaceName = 'ISlackWebApiArgs';
const generatedInterfaceName = 'ISlackWebApiMethods';

function getSignature(): string {
    return `(args?: ${argsInterfaceName}) => Promise<any>`;
}

// Should group them all together...
methods.sort();

const groupedMethods: { [key: string]: any } = {};

for (const method of methods) {
    const path = method.split('.');

    let ptr: any = groupedMethods;

    for (let i = 0; i < path.length - 1; i++) {
        const cur = path[i];

        if (!ptr.hasOwnProperty(cur)) {
            ptr[cur] = {};
        }

        ptr = ptr[cur];
    }

    ptr[path[path.length - 1]] = {
        toJSON() {
            return getSignature();
        }
    };
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const json = JSON.stringify(groupedMethods, null, '\t');
const signatureWithQuotesRegex = new RegExp(`"${escapeRegExp(getSignature())}"[,]?`, 'g');

const cleanedJson = json.replace(/[,]/g, '').replace(/"(.+)":/g, '$1:').replace(signatureWithQuotesRegex, `${getSignature()};`);

fs.writeFileSync(path.resolve(`../lib/models/${generatedInterfaceName}.ts`), `import ${argsInterfaceName} from './${argsInterfaceName}';\n\nexport default interface ${generatedInterfaceName} ${cleanedJson}`);