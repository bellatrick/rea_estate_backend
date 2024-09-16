import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Estate Management API',
      version: '1.0.0',
      description: 'API documentation for the Estate Management application'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management and authentication'
      },
      {
        name: 'Landlords',
        description: 'Operations for landlords to manage properties and tenants'
      },
      {
        name: 'Property',
        description: 'Management of properties by landlords'
      },
      {
        name: 'Maintenance Request',
        description: 'Management of Maintenance Requests'
      }
    ],

    paths: {
      '/api/v1/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'role'],
                  properties: {
                    name: {
                      type: 'string'
                    },
                    email: {
                      type: 'string'
                    },
                    password: {
                      type: 'string',
                      format: 'password'
                    },
                    role: {
                      type: 'string',
                      enum: ['landlord', 'tenant']
                    },
                    phone: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User registered successfully'
            },
            '400': {
              description: 'User already exists or validation error'
            }
          }
        }
      },
      '/api/v1/activate': {
        post: {
          summary: 'Activate a new user account',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['activation_token', 'activation_code'],
                  properties: {
                    activation_token: {
                      type: 'string',
                      description: 'JWT activation token sent to the user'
                    },
                    activation_code: {
                      type: 'string',
                      description: 'Activation code sent to the user'
                    }
                  }
                }
              },
              'application/x-www-form-urlencoded': {
                schema: {
                  type: 'object',
                  required: ['activation_token', 'activation_code'],
                  properties: {
                    activation_token: {
                      type: 'string',
                      description: 'JWT activation token sent to the user'
                    },
                    activation_code: {
                      type: 'string',
                      description: 'Activation code sent to the user'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User account successfully activated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid activation code or user already exists',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: false
                      },
                      message: {
                        type: 'string',
                        example:
                          'Invalid activation code or User already exists'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Internal server error'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/login': {
        post: {
          summary: 'Login an existing user',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string'
                    },
                    password: {
                      type: 'string',
                      format: 'password'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'User logged in successfully'
            },
            '400': {
              description: 'Invalid credentials'
            }
          }
        }
      },
      '/api/v1/profile/{userId}': {
        get: {
          summary: 'Get user profile',
          tags: ['Users'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'User profile retrieved successfully'
            },
            '401': {
              description: 'Unauthorized'
            },
            '404': {
              description: 'User not found'
            }
          }
        },
        put: {
          summary: 'Update user profile',
          tags: ['Users'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string'
                    },
                    email: {
                      type: 'string'
                    },
                    phone: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'User profile updated successfully'
            },
            '401': {
              description: 'Unauthorized'
            },
            '404': {
              description: 'User not found'
            }
          }
        }
      },
      '/api/v1/property': {
        post: {
          summary: 'Add a new property',
          tags: ['Property'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [
                    'name',
                    'description',
                    'rentalTerms',
                    'address',
                    'images'
                  ],
                  properties: {
                    name: {
                      type: 'string'
                    },
                    description: {
                      type: 'string'
                    },
                    rentalTerms: {
                      type: 'string'
                    },
                    address: {
                      type: 'string'
                    },
                    images: {
                      type: 'array',
                      items: {
                        type: 'string',
                        format: 'uri'
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Property added successfully'
            },
            '400': {
              description: 'Validation error'
            }
          }
        },
        get: {
          summary: 'View all properties',
          tags: ['Landlords'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            '200': {
              description: 'List of properties'
            }
          }
        }
      },
      '/api/v1/properties/{propertyId}': {
        get: {
          summary: 'Get Property by ID',
          description: 'Retrieves a specific property by its ID.',
          tags: ['Property'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the property to retrieve'
            }
          ],
          responses: {
            '200': {
              description: 'Property found and returned',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Property'
                  }
                }
              }
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      msg: {
                        type: 'string',
                        example: 'Property not found'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error'
            }
          }
        },
        put: {
          summary: 'Edit a property',
          description: 'Updates an existing property by its ID',
          tags: ['Property'],
          parameters: [
            {
              in: 'path',
              name: 'propertyId',
              required: true,
              description: 'ID of the property to edit',
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'The name of the property'
                    },
                    description: {
                      type: 'string',
                      description: 'A description of the property'
                    },
                    rentalTerms: {
                      type: 'string',
                      description: 'The rental terms for the property'
                    },
                    address: {
                      type: 'string',
                      description: 'The address of the property'
                    },
                    images: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      description: 'An array of image URLs for the property'
                    }
                  },
                  required: [
                    'name',
                    'description',
                    'rentalTerms',
                    'address',
                    'images'
                  ]
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Property updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      rentalTerms: { type: 'string' },
                      address: { type: 'string' },
                      images: {
                        type: 'array',
                        items: { type: 'string' }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - validation error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            msg: { type: 'string' },
                            param: { type: 'string' },
                            location: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Property not found'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                    example: 'Server Error'
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete a property',
          description: 'Deletes a property by its ID',
          tags: ['Property'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              description: 'ID of the property to delete',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Property deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Property deleted successfully'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Property not found'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                    example: 'Server error'
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenants': {
        get: {
          summary: 'View tenant profiles',
          tags: ['Tenants'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            '200': {
              description: 'List of tenants'
            }
          }
        }
      },
      '/api/v1/maintenance-requests': {
        get: {
          summary: 'Manage maintenance requests',
          tags: ['Landlords'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            '200': {
              description: 'List of maintenance requests'
            }
          }
        }
      },
      '/api/v1/reports': {
        get: {
          summary: 'Generate reports and analytics',
          tags: ['Landlords'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            '200': {
              description: 'Reports and analytics data'
            }
          }
        }
      },
      '/api/v1/notifications': {
        post: {
          summary: 'Send notifications to tenants',
          tags: ['Landlords'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: {
                    message: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Notifications sent successfully'
            },
            '400': {
              description: 'Validation error'
            }
          }
        }
      },

      '/api/v1/property/{userId}': {
        put: {
          summary: 'Add a tenant to a property',
          tags: ['Tenants'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'tenantId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the tenant'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    propertyId: {
                      type: 'string',
                      description: 'ID of the property'
                    },
                    rentAmount: {
                      type: 'number',
                      description: 'The amount of rent for the property'
                    }
                  },
                  required: ['propertyId', 'rentAmount']
                }
              }
            }
          },
          responses: {
            '200': {
              description:
                'Tenant successfully added to property with rent details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      _id: {
                        type: 'string'
                      },
                      userId: {
                        type: 'string',
                        description: 'ID of the tenant'
                      },
                      landlords: {
                        type: 'array',
                        items: {
                          type: 'string',
                          description: 'ID of the landlord'
                        }
                      },
                      rentedProperties: {
                        type: 'array',
                        items: {
                          type: 'string',
                          description: 'ID of the rented property'
                        }
                      },
                      rent: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            propertyId: {
                              type: 'string',
                              description: 'ID of the property'
                            },
                            amount: {
                              type: 'number',
                              description: 'Amount of rent'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description:
                'Bad request - validation errors or missing tenant ID',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object'
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description:
                'Unauthorized - missing or invalid authentication token'
            },
            '404': {
              description: 'User or Tenant not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/api/v1/tenant/{tenantId}': {
        get: {
          summary: 'Get Tenant by ID',
          description: 'Retrieves a specific tenant by their ID.',
          tags: ['Tenants'],
          parameters: [
            {
              name: 'tenantId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the tenant to retrieve'
            }
          ],
          responses: {
            '200': {
              description: 'Tenant found and returned',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Tenant'
                  }
                }
              }
            },
            '404': {
              description: 'Tenant not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Tenant not found'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Server error'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      '/api/v1/tenant/{tenantId}/property/{propertyId}': {
        delete: {
          summary: 'Remove Tenant from Property',
          description:
            'Allows landlords to remove a tenant from a specific property they manage.',
          tags: ['Tenants'],
          parameters: [
            {
              name: 'tenantId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the tenant to remove'
            },
            {
              name: 'propertyId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the property the tenant is being removed from'
            }
          ],
          responses: {
            '200': {
              description: 'Tenant removed from the property successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Tenant'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request, tenantId or propertyId missing',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized, landlordId not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Tenant not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error'
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        }
      },

      '/api/v1/payment/{tenantId}/{propertyId}': {
        post: {
          summary: 'Pay Rent',
          description: 'Allows tenants to pay rent for a property',
          tags: ['Tenants'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: {
                      type: 'number',
                      description: 'Amount of rent to be paid'
                    },
                    paymentDate: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Date when the payment is made'
                    },
                    receiptUrl: {
                      type: 'string',
                      description: 'URL of the receipt for the payment'
                    }
                  },
                  required: ['amount', 'paymentDate']
                }
              }
            }
          },
          parameters: [
            {
              name: 'tenantId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the tenant'
            },
            {
              name: 'propertyId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the property'
            }
          ],
          responses: {
            '200': {
              description: 'Payment processed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Payment'
                  }
                }
              }
            },
            '400': {
              description:
                'Bad request, invalid input or missing tenantId/propertyId',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/api/v1/tenant/maintenanceRequest/{tenantId}/{propertyId}': {
        post: {
          summary: 'Submit Maintenance Request',
          description:
            'Allows tenants to submit a maintenance request for a property.',
          tags: ['Maintenance Request'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    landlordId: {
                      type: 'string',
                      description:
                        'ID of the landlord responsible for the property'
                    },
                    status: {
                      type: 'string',
                      description:
                        "Status of the maintenance request (e.g., 'open', 'in progress', 'completed')"
                    },
                    description: {
                      type: 'string',
                      description: 'Details of the maintenance issue'
                    }
                  },
                  required: ['landlordId', 'description']
                }
              }
            }
          },
          parameters: [
            {
              name: 'tenantId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the tenant submitting the request'
            },
            {
              name: 'propertyId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the property related to the request'
            }
          ],
          responses: {
            '200': {
              description: 'Maintenance request submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/MaintenanceRequest'
                  }
                }
              }
            },
            '400': {
              description:
                'Bad request, invalid input or missing tenantId/propertyId',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/api/v1/tenant/{tenantId}/maintenance-requests': {
        get: {
          summary: 'Get All Maintenance Requests for a Tenant',
          description:
            'Retrieves all maintenance requests submitted by a specific tenant, sorted by the most recent requests.',
          tags: ['Maintenance Request'],
          parameters: [
            {
              name: 'tenantId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description:
                'ID of the tenant whose maintenance requests are to be retrieved'
            }
          ],
          responses: {
            '200': {
              description: 'List of maintenance requests for the tenant',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/MaintenanceRequest'
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Bad request, tenant ID not provided',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Please provide a tenant id'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/api/v1/maintenance-request/{id}/status': {
        put: {
          summary: 'Update Maintenance Request Status',
          description:
            'Allows landlords to update the status of a maintenance request for a property they manage.',
          tags: ['Maintenance Request'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the maintenance request to update'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      description: 'New status for the maintenance request',
                      example: 'completed'
                    }
                  },
                  required: ['status']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Maintenance request status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/MaintenanceRequest'
                  }
                }
              }
            },
            '401': {
              description:
                'Unauthorized, landlord does not have permission to update this request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      msg: {
                        type: 'string',
                        example: 'Unauthorized'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Maintenance request not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      msg: {
                        type: 'string',
                        example: 'Request not found'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error'
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        }
      },
      '/api/v1/maintenance-request/{id}': {
        delete: {
          summary: 'Delete Maintenance Request',
          description:
            'Allows a tenant or landlord to delete a maintenance request.',
          tags: ['Maintenance Request'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the maintenance request to delete'
            }
          ],
          responses: {
            '200': {
              description: 'Maintenance request successfully removed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Request removed'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description:
                'Unauthorized, user does not have permission to delete this request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Unauthorized'
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Maintenance request not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Request not found'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Server error'
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        }
      }
    }
  },

  apis: ['./src/routes/*.ts'] // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger UI available at http://localhost:3000/api-docs');
};
