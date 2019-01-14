
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
