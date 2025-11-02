/**
 * ApiGatewayService
 * 
 * Dynamic GraphQL API gateway that generates schemas from ld:Service definitions
 * Provides a unified API interface for all services
 * 
 * @module ApiGatewayService
 */

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFieldConfigMap,
  GraphQLFieldConfig,
  GraphQLOutputType,
  GraphQLInputObjectType,
  graphql,
} from 'graphql';
import { wikiService } from './WikiService.js';
import { componentLibraryService } from './ComponentLibraryService.js';

export interface ServiceSchema {
  serviceName: string;
  description: string;
  operations: {
    queries: OperationDefinition[];
    mutations: OperationDefinition[];
  };
}

export interface OperationDefinition {
  name: string;
  description?: string;
  returnType: string;
  parameters?: ParameterDefinition[];
  resolver: (args: any) => Promise<any>;
}

export interface ParameterDefinition {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export class ApiGatewayService {
  private schema: GraphQLSchema | null = null;
  private services: Map<string, ServiceSchema> = new Map();

  /**
   * Register a service schema
   */
  registerService(serviceSchema: ServiceSchema): void {
    this.services.set(serviceSchema.serviceName, serviceSchema);
    // Invalidate cached schema
    this.schema = null;
  }

  /**
   * Build GraphQL schema from registered services
   */
  buildSchema(): GraphQLSchema {
    if (this.schema) {
      return this.schema;
    }

    const queryFields: GraphQLFieldConfigMap<any, any> = {};
    const mutationFields: GraphQLFieldConfigMap<any, any> = {};

    // Build fields from all registered services
    for (const [serviceName, serviceSchema] of this.services.entries()) {
      // Add queries
      for (const query of serviceSchema.operations.queries) {
        queryFields[`${serviceName}_${query.name}`] = this.buildField(query);
      }

      // Add mutations
      for (const mutation of serviceSchema.operations.mutations) {
        mutationFields[`${serviceName}_${mutation.name}`] = this.buildField(mutation);
      }
    }

    // Create root query type
    const queryType = new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    });

    // Create root mutation type (if any mutations exist)
    const mutationType =
      Object.keys(mutationFields).length > 0
        ? new GraphQLObjectType({
            name: 'Mutation',
            fields: mutationFields,
          })
        : undefined;

    this.schema = new GraphQLSchema({
      query: queryType,
      mutation: mutationType,
    });

    return this.schema;
  }

  /**
   * Build a GraphQL field from an operation definition
   */
  private buildField(operation: OperationDefinition): GraphQLFieldConfig<any, any> {
    return {
      type: this.mapTypeToGraphQL(operation.returnType),
      description: operation.description,
      args: operation.parameters?.reduce(
        (acc, param) => {
          const paramType = this.mapTypeToGraphQL(param.type);
          acc[param.name] = {
            type: param.required ? new GraphQLNonNull(paramType) : paramType,
            description: param.description,
          };
          return acc;
        },
        {} as Record<string, any>
      ),
      resolve: async (_source, args) => {
        return operation.resolver(args);
      },
    };
  }

  /**
   * Map type string to GraphQL type
   */
  private mapTypeToGraphQL(typeStr: string): GraphQLOutputType {
    // Handle array types
    if (typeStr.startsWith('[') && typeStr.endsWith(']')) {
      const innerType = typeStr.slice(1, -1);
      return new GraphQLList(this.mapTypeToGraphQL(innerType));
    }

    // Handle basic types
    switch (typeStr.toLowerCase()) {
      case 'string':
        return GraphQLString;
      case 'int':
      case 'integer':
        return GraphQLInt;
      case 'boolean':
      case 'bool':
        return GraphQLBoolean;
      case 'researchtopic':
        return this.getResearchTopicType();
      case 'componentschema':
        return this.getComponentSchemaType();
      default:
        // Default to string for unknown types
        return GraphQLString;
    }
  }

  /**
   * Get ResearchTopic GraphQL type
   */
  private getResearchTopicType(): GraphQLObjectType {
    return new GraphQLObjectType({
      name: 'ResearchTopic',
      fields: {
        id: { type: GraphQLString },
        type: { type: GraphQLString },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        tags: { type: new GraphQLList(GraphQLString) },
        content: { type: GraphQLString },
        metadata: { type: GraphQLString },
      },
    });
  }

  /**
   * Get ComponentSchema GraphQL type
   */
  private getComponentSchemaType(): GraphQLObjectType {
    return new GraphQLObjectType({
      name: 'ComponentSchema',
      fields: {
        schemaId: { type: GraphQLString },
        schemaType: { type: GraphQLString },
        version: { type: GraphQLString },
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        category: { type: GraphQLString },
        isAtomic: { type: GraphQLBoolean },
        tags: { type: new GraphQLList(GraphQLString) },
      },
    });
  }

  /**
   * Execute a GraphQL query
   */
  async executeQuery(query: string, variables?: Record<string, any>): Promise<any> {
    const schema = this.buildSchema();
    return graphql({
      schema,
      source: query,
      variableValues: variables,
    });
  }

  /**
   * Get schema as SDL string
   */
  getSchemaSDL(): string {
    const schema = this.buildSchema();
    // Simple SDL generation (in production, use printSchema from graphql)
    return 'Schema SDL would go here';
  }
}

/**
 * Initialize API Gateway with default services
 */
export function initializeApiGateway(): ApiGatewayService {
  const gateway = new ApiGatewayService();

  // Register WikiService
  gateway.registerService({
    serviceName: 'wiki',
    description: 'Research topics and knowledge graph service',
    operations: {
      queries: [
        {
          name: 'getAllTopics',
          description: 'Get all research topics',
          returnType: '[ResearchTopic]',
          resolver: async () => {
            const topics = await wikiService.getAllTopics();
            return topics.map((t) => ({
              id: t.$id,
              type: t.type,
              title: t.title,
              description: t.description,
              tags: t.tags,
              content: JSON.stringify(t.content),
              metadata: JSON.stringify(t.metadata),
            }));
          },
        },
        {
          name: 'getTopicById',
          description: 'Get a research topic by ID',
          returnType: 'ResearchTopic',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'Topic ID',
            },
          ],
          resolver: async (args) => {
            const topic = await wikiService.getTopicById(args.id);
            if (!topic) return null;
            return {
              id: topic.$id,
              type: topic.type,
              title: topic.title,
              description: topic.description,
              tags: topic.tags,
              content: JSON.stringify(topic.content),
              metadata: JSON.stringify(topic.metadata),
            };
          },
        },
        {
          name: 'searchByTag',
          description: 'Search topics by tag',
          returnType: '[ResearchTopic]',
          parameters: [
            {
              name: 'tag',
              type: 'string',
              required: true,
              description: 'Tag to search for',
            },
          ],
          resolver: async (args) => {
            const topics = await wikiService.searchByTag(args.tag);
            return topics.map((t) => ({
              id: t.$id,
              type: t.type,
              title: t.title,
              description: t.description,
              tags: t.tags,
              content: JSON.stringify(t.content),
              metadata: JSON.stringify(t.metadata),
            }));
          },
        },
      ],
      mutations: [],
    },
  });

  // Register ComponentLibraryService
  gateway.registerService({
    serviceName: 'components',
    description: 'Component schema library service',
    operations: {
      queries: [
        {
          name: 'getAtomicComponents',
          description: 'Get all atomic component schemas',
          returnType: '[ComponentSchema]',
          resolver: async () => {
            const components = await componentLibraryService.getAtomicComponents();
            return components.map((c) => ({
              schemaId: c.schemaId,
              schemaType: c.schemaType,
              version: c.version,
              title: c.title,
              description: c.description,
              category: c.category,
              isAtomic: c.isAtomic,
              tags: c.tags,
            }));
          },
        },
        {
          name: 'getSchemaById',
          description: 'Get a component schema by ID',
          returnType: 'ComponentSchema',
          parameters: [
            {
              name: 'schemaId',
              type: 'string',
              required: true,
              description: 'Schema ID',
            },
          ],
          resolver: async (args) => {
            const component = await componentLibraryService.getSchema(args.schemaId);
            if (!component) return null;
            return {
              schemaId: component.schemaId,
              schemaType: component.schemaType,
              version: component.version,
              title: component.title,
              description: component.description,
              category: component.category,
              isAtomic: component.isAtomic,
              tags: component.tags,
            };
          },
        },
      ],
      mutations: [],
    },
  });

  return gateway;
}

// Singleton instance
export const apiGateway = initializeApiGateway();

export default ApiGatewayService;
