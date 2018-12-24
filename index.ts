import Client from './src/lib/client/Client';
import * as Structures from './src/lib/structures';
import * as Enum from './src/lib/enum';
import * as Util from './src/lib/util';

export default {
    Client,
    ...Structures,
    ...Enum,
    ...Util
};