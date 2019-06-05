export const PrivilegeQuerySchema = {
    type: 'object',
    required: ['id'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            pattern : '^[0-9a-fA-F]{24}$'
        }
    }
};

export const PrivilegeResourceQuerySchema = {
    type: 'object',
    required: ['resource'],
    additionalProperties: false,
    properties: {
        resource: {
            type: 'string'
        }
    }
};

export const PrivilegeCreateSchema = {
    type: 'object',
    required: ['resource'],
    additionalProperties: false,
    properties: {
        resource: {
            type: 'string'
        },
        actionsAvailable: {
            type: 'object'
        }
    }
};

export const PrivilegeUpdateSchema = {
    type: 'object',
    required: ['actionsAvailable'],
    additionalProperties: false,
    properties: {
        actionsAvailable: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    }
};

export const PrivilegeAddRouteSchema = {
    type: 'object',
    required: ['action', 'routes'],
    additionalProperties: false,
    properties: {
        action: {
            type: 'string'
        },
        routes: {
            type: 'array',
            items: {
                type: 'object',
                required: ['method', 'url', 'regexp'],
                properties: {
                    method: {
                        type: 'string'
                    },
                    url: {
                        type: 'string'
                    },
                    regexp: {
                        type: 'string'
                    }
                }
            }
        }
    }
};
