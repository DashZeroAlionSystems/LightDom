// Minimal shims for @modelcontextprotocol SDK (temporary)
declare module '@modelcontextprotocol/sdk' {
  const _any: any;
  export = _any;
}

declare module '@modelcontextprotocol/sdk/server/index.js' {
  const Server: any;
  export { Server };
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  const StdioServerTransport: any;
  export { StdioServerTransport };
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export const CallToolRequestSchema: any;
  export const ListToolsRequestSchema: any;
  export const CallResourceRequestSchema: any;
  export const ListResourcesRequestSchema: any;
  export const ReadResourceRequestSchema: any;
  export const ListPromptsRequestSchema: any;
  export const GetPromptRequestSchema: any;
  export const CreatePromptRequestSchema: any;
  export const UpdatePromptRequestSchema: any;
  export const DeletePromptRequestSchema: any;
  export const CompletionRequestSchema: any;
  export type Tool = any;
  export type ToolInvocation = any;
  export type ToolResult = any;
}
