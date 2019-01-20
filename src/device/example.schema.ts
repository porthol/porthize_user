
export const ExampleCreateSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {
            type: 'string'
        },
        enabled: {
            type: 'boolean',
            default: true
        }
        // potentially listeners
    }
};

export const ExampleUpdateSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {
            type: 'string'
        },
        enabled: {
            type: 'boolean'
        }
        // potentially listeners
    }
};
