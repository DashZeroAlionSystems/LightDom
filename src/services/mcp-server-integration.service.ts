import pool from '../config/database';
import axios from 'axios';

interface MCPServer {
  server_id?: string;
  name: string;
  endpoint_url: string;
  auth_type?: string;
  auth_config?: any;
  status?: string;
  config?: any;
  created_at?: Date;
  updated_at?: Date;
}

interface MCPCapability {
  capability_id?: string;
  server_id: string;
  capability_type: string;
  name: string;
  description?: string;
  input_schema?: any;
  output_schema?: any;
  config?: any;
  created_at?: Date;
}

export class MCPServerIntegrationService {
  // MCP Server Management
  async registerMCPServer(server: MCPServer): Promise<MCPServer> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO mcp_servers 
         (name, endpoint_url, auth_type, auth_config, status, config)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          server.name,
          server.endpoint_url,
          server.auth_type || 'none',
          server.auth_config ? JSON.stringify(server.auth_config) : null,
          'active',
          server.config ? JSON.stringify(server.config) : null
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getMCPServer(serverId: string): Promise<MCPServer | null> {
    const result = await pool.query(
      'SELECT * FROM mcp_servers WHERE server_id = $1',
      [serverId]
    );
    return result.rows[0] || null;
  }

  async listMCPServers(status?: string): Promise<MCPServer[]> {
    let query = 'SELECT * FROM mcp_servers';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async updateMCPServer(serverId: string, updates: Partial<MCPServer>): Promise<MCPServer | null> {
    const client = await pool.connect();
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.name) {
        setClauses.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.endpoint_url) {
        setClauses.push(`endpoint_url = $${paramCount++}`);
        values.push(updates.endpoint_url);
      }
      if (updates.auth_type) {
        setClauses.push(`auth_type = $${paramCount++}`);
        values.push(updates.auth_type);
      }
      if (updates.auth_config !== undefined) {
        setClauses.push(`auth_config = $${paramCount++}`);
        values.push(updates.auth_config ? JSON.stringify(updates.auth_config) : null);
      }
      if (updates.status) {
        setClauses.push(`status = $${paramCount++}`);
        values.push(updates.status);
      }
      if (updates.config !== undefined) {
        setClauses.push(`config = $${paramCount++}`);
        values.push(updates.config ? JSON.stringify(updates.config) : null);
      }

      if (setClauses.length === 0) {
        return this.getMCPServer(serverId);
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(serverId);

      const result = await client.query(
        `UPDATE mcp_servers 
         SET ${setClauses.join(', ')}
         WHERE server_id = $${paramCount}
         RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async deleteMCPServer(serverId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM mcp_servers WHERE server_id = $1 RETURNING server_id',
      [serverId]
    );
    return result.rowCount > 0;
  }

  // Capability Discovery
  async discoverCapabilities(serverId: string): Promise<MCPCapability[]> {
    const client = await pool.connect();
    try {
      const server = await this.getMCPServer(serverId);
      if (!server) {
        throw new Error('MCP server not found');
      }

      // Call MCP server to discover capabilities
      const headers: any = {
        'Content-Type': 'application/json'
      };

      // Add authentication if configured
      if (server.auth_type === 'api_key' && server.auth_config) {
        const authConfig = typeof server.auth_config === 'string' 
          ? JSON.parse(server.auth_config) 
          : server.auth_config;
        headers['Authorization'] = `Bearer ${authConfig.api_key}`;
      } else if (server.auth_type === 'basic' && server.auth_config) {
        const authConfig = typeof server.auth_config === 'string' 
          ? JSON.parse(server.auth_config) 
          : server.auth_config;
        const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }

      let capabilities: any[] = [];

      try {
        // Make request to MCP server's discovery endpoint
        const response = await axios.get(`${server.endpoint_url}/capabilities`, {
          headers,
          timeout: 5000
        });

        capabilities = response.data.capabilities || [];
      } catch (error) {
        console.error(`Failed to discover capabilities from ${server.name}:`, error);
        // Return empty array if server is unreachable
        return [];
      }

      // Store discovered capabilities
      await client.query('BEGIN');

      // Clear old capabilities
      await client.query(
        'DELETE FROM mcp_capabilities WHERE server_id = $1',
        [serverId]
      );

      // Insert new capabilities
      const insertedCapabilities: MCPCapability[] = [];

      for (const cap of capabilities) {
        const result = await client.query(
          `INSERT INTO mcp_capabilities 
           (server_id, capability_type, name, description, input_schema, output_schema, config)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            serverId,
            cap.type || 'tool',
            cap.name,
            cap.description || null,
            cap.input_schema ? JSON.stringify(cap.input_schema) : null,
            cap.output_schema ? JSON.stringify(cap.output_schema) : null,
            cap.config ? JSON.stringify(cap.config) : null
          ]
        );

        insertedCapabilities.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return insertedCapabilities;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getServerCapabilities(serverId: string, capabilityType?: string): Promise<MCPCapability[]> {
    let query = 'SELECT * FROM mcp_capabilities WHERE server_id = $1';
    const params: any[] = [serverId];

    if (capabilityType) {
      query += ' AND capability_type = $2';
      params.push(capabilityType);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getAllCapabilities(capabilityType?: string): Promise<MCPCapability[]> {
    let query = 'SELECT * FROM mcp_capabilities';
    const params: any[] = [];

    if (capabilityType) {
      query += ' WHERE capability_type = $1';
      params.push(capabilityType);
    }

    query += ' ORDER BY server_id, name';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Execute MCP Tool
  async executeMCPTool(
    serverId: string,
    toolName: string,
    input: any
  ): Promise<any> {
    const server = await this.getMCPServer(serverId);
    if (!server) {
      throw new Error('MCP server not found');
    }

    // Get tool capability
    const capabilities = await this.getServerCapabilities(serverId);
    const tool = capabilities.find(c => c.name === toolName);

    if (!tool) {
      throw new Error(`Tool '${toolName}' not found on server`);
    }

    // Prepare headers
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (server.auth_type === 'api_key' && server.auth_config) {
      const authConfig = typeof server.auth_config === 'string' 
        ? JSON.parse(server.auth_config) 
        : server.auth_config;
      headers['Authorization'] = `Bearer ${authConfig.api_key}`;
    } else if (server.auth_type === 'basic' && server.auth_config) {
      const authConfig = typeof server.auth_config === 'string' 
        ? JSON.parse(server.auth_config) 
        : server.auth_config;
      const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    // Execute tool
    const response = await axios.post(
      `${server.endpoint_url}/execute/${toolName}`,
      { input },
      { headers, timeout: 30000 }
    );

    return response.data;
  }

  // Health Check
  async checkServerHealth(serverId: string): Promise<{ status: string; response_time_ms: number; error?: string }> {
    const server = await this.getMCPServer(serverId);
    if (!server) {
      throw new Error('MCP server not found');
    }

    const startTime = Date.now();

    try {
      const response = await axios.get(`${server.endpoint_url}/health`, {
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;

      // Update server status
      await this.updateMCPServer(serverId, {
        status: response.status === 200 ? 'active' : 'degraded'
      });

      return {
        status: response.status === 200 ? 'healthy' : 'degraded',
        response_time_ms: responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      // Update server status
      await this.updateMCPServer(serverId, {
        status: 'offline'
      });

      return {
        status: 'offline',
        response_time_ms: responseTime,
        error: error.message
      };
    }
  }

  async checkAllServersHealth(): Promise<{ [serverId: string]: any }> {
    const servers = await this.listMCPServers();
    const healthChecks: { [serverId: string]: any } = {};

    for (const server of servers) {
      if (server.server_id) {
        healthChecks[server.server_id] = await this.checkServerHealth(server.server_id);
      }
    }

    return healthChecks;
  }
}

export default new MCPServerIntegrationService();
