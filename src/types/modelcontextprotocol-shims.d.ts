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
  const types: any;
  export = types;
}
