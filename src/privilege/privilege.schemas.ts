export const PrivilegeQuerySchema = {
    type: 'object',
    required: ['id'],
    additionalProperties: false,
    properties: {
        id: {
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
        actions: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    }
};

export const PrivilegeUpdateSchema = {
    type: 'object',
    required: ['actions'],
    additionalProperties: false,
    properties: {
        actions: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    }
};
