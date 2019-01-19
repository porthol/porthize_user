export const RoleQuerySchema = {
    type: 'object',
    required: ['id'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'string'
        }
    }
};

export const RoleCreateSchema = {
    type: 'object',
    required: ['name', 'key'],
    additionalProperties: false,
    properties: {
        key: {
            type: 'string'
        },
        name: {
            type: 'string'
        }
    }
};

export const RoleUpdateSchema = {
    type: 'object',
    required: ['name', 'key'],
    additionalProperties: false,
    properties: {
        key: {
            type: 'string'
        },
        name: {
            type: 'string'
        }
    }
};
