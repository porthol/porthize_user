export const RoleQuerySchema = {
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

export const RolePrivilegeSchema = {
    type: 'object',
    required: ['privilegeId', 'actions'],
    additionalProperties: false,
    properties: {
        privilegeId: {
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

export const RolePrivilegeQuerySchema = {
    type: 'object',
    required: ['id', 'privilegeId'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'string'
        },
        privilegeId: {
            type: 'string'
        }
    }
};
