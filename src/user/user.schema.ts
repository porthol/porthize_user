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
        firstName: {
            type: 'string'
        },
        lastName: {
            type: 'string'
        },
        password: {
            type: 'string'
        },
        loginEnabled: {
            type: 'boolean'
        },
        emailing: {
            type: 'boolean'
        }
    }
};

export const UserQuerySchema = {
    type: 'object',
    required: ['id'],
    additionalProperties: false,
    properties: {
        id: {
            type: 'string',
            pattern: '^[0-9a-fA-F]{24}$'
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
        firstName: {
            type: 'string'
        },
        lastName: {
            type: 'string'
        },
        birthDate: {
            type: 'string'
        },
        emailing: {
            type: 'boolean'
        }
    }
};

export const UserUpdateSecuritySchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        enabled: {
            type: 'boolean'
        },
        loginEnabled: {
            type: 'boolean'
        },
        companyId: {
            type: 'string'
        }
    }
};

export const UserRoleSchema = {
    type: 'object',
    required: ['roleId'],
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

export const UserLoginSchema = {
    type: 'object',
    required: ['password'],
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
        }
    }
};

export const UserAuthorizedSchema = {
    type: 'object',
    required: ['method', 'url'],
    additionalProperties: false,
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
};

export const UserMicroServiceSchema = {
    type: 'object',
    required: ['uuid'],
    additionalProperties: false,
    properties: {
        uuid: {
            type: 'string'
        },
        hostname: {
            type: 'string'
        }
    }
};

export const UserRenewBotTokenSchema = {
    type: 'object',
    required: ['token'],
    additionalProperties: false,
    properties: {
        token: {
            type: 'string'
        }
    }
};

export const UserPasswordRequestResetSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        email: {
            type: 'string'
        }
    }
};

export const UserPasswordResetSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        password: {
            type: 'string'
        },
        ['reset-token']: {
            type: 'string'
        }
    }
};
