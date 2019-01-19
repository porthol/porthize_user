
export const UserCreateSchema = {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
        username: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        password: {
            type: 'string'
        },
        workspace: {
            type: 'string'
        }
    }
};

export const UserQuerySchema = {
    type: 'object',
    required: ['id'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'string'
        }
    }
};

export const UserUpdateSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        username: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        enabled: {
            type: 'boolean'
        }
    }
};

export const UserRoleSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        roleId: {
            type: 'string'
        }
    }
};

export const UserRoleQuerySchema = {
    type: 'object',
    required: ['id', 'roleId'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'string'
        },
        roleId: {
            type: 'string'
        }
    }
};
