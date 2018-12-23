import Client from './lib/client/Client';
import * as Structures from './lib/structures';
import * as Enum from './lib/enum';
import * as Util from './lib/util';

export default {
    Client,
    ...Structures,
    ...Enum,
    ...Util
};