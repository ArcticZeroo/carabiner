import Client from './dist/lib/client/Client';
import * as Structures from './dist/lib/structures';
import * as Enum from './dist/lib/enum';
import * as Util from './dist/lib/util';

export default {
    Client,
    ...Structures,
    ...Enum,
    ...Util
};