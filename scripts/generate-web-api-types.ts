import fs from 'fs';
import * as path from 'path';

import methods from '../config/methods';

const generatedInterfaceName = 'ISlackWebApiMethods';
const methodTypeName = `SlackWebApiMethod`;

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
            return methodTypeName;
        }
    };
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const json = JSON.stringify(groupedMethods, null, '\t');
const signatureWithQuotesRegex = new RegExp(`"${escapeRegExp(methodTypeName)}"[,]?`, 'g');

const cleanedJson = json.replace(/[,]/g, '').replace(/"(.+)":/g, '$1:').replace(signatureWithQuotesRegex, `${methodTypeName};`);

fs.writeFileSync(path.resolve(`../lib/models/${generatedInterfaceName}.ts`), `import ${methodTypeName} from './${methodTypeName}';\n\nexport default interface ${generatedInterfaceName} ${cleanedJson}`);