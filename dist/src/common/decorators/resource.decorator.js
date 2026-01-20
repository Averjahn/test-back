"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = exports.RESOURCE_PARAM_KEY = exports.RESOURCE_TYPE_KEY = exports.ResourceType = void 0;
const common_1 = require("@nestjs/common");
var ResourceType;
(function (ResourceType) {
    ResourceType["PATIENT"] = "patient";
    ResourceType["DOCTOR"] = "doctor";
    ResourceType["USER"] = "user";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
exports.RESOURCE_TYPE_KEY = 'resourceType';
exports.RESOURCE_PARAM_KEY = 'resourceParam';
const Resource = (type, paramName = 'id') => (0, common_1.SetMetadata)(exports.RESOURCE_TYPE_KEY, { type, paramName });
exports.Resource = Resource;
//# sourceMappingURL=resource.decorator.js.map