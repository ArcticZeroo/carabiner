import config from '../config/attachments';

const properties: string[] = config.fieldProperties;

const propertyPieces: string[] = [];
const methodPieces: string[] = [];

function capitalize(name: string) {
    return name[0].toUpperCase() + name.substr(1);
}

for (const rawProperty of properties) {
    const camelCaseName = rawProperty.split('_').map(capitalize).join('');

    propertyPieces.push(`private ${rawProperty}: string;`);

    methodPieces.push(...[
        `get${camelCaseName}(): string {`,
        `   return this.${rawProperty};`,
        `}`,
        '',
        `set${camelCaseName}(value: string): this {`,
        `   this.${rawProperty} = value;`,
        '   return this;',
        `}`,
        ''
    ]);
}

console.log([...propertyPieces, '', ...methodPieces].join('\n'));