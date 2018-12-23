"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Client_1 = __importDefault(require("./lib/client/Client"));
const Structures = __importStar(require("./lib/structures"));
const Enum = __importStar(require("./lib/enum"));
const Util = __importStar(require("./lib/util"));
exports.default = {
    Client: Client_1.default,
    ...Structures,
    ...Enum,
    ...Util
};
//# sourceMappingURL=index.js.map