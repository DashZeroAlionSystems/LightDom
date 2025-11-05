/**
 * Component Hierarchy Service
 * 
 * Manages hierarchical component organization using atomic design methodology
 * Provides tree structure, traversal, and visualization for component hierarchies
 */

export interface ComponentNode {
  id: string;
  name: string;
  type: 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  level: number;
  parent: string | null;
  children: string[];
  metadata: {
    description?: string;
    tags?: string[];
    category?: string;
    props?: Record<string, unknown>;
    dependencies?: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  schema?: unknown;
  code?: string;
  story?: string;
}

export interface HierarchyTree {
  root: ComponentNode;
  nodes: Map<string, ComponentNode>;
  levels: Map<string, ComponentNode[]>;
}

export interface HierarchyVisualization {
  mermaid: string;
  json: string;
  d3: unknown;
}

export class ComponentHierarchyService {
  private hierarchies: Map<string, HierarchyTree>;
  private db: unknown;

  constructor(database?: unknown) {
    this.hierarchies = new Map();
    this.db = database;
  }

  /**
   * Create a new component hierarchy
   */
  createHierarchy(name: string, rootComponent: ComponentNode): HierarchyTree {
    const hierarchy: HierarchyTree = {
      root: rootComponent,
      nodes: new Map([[rootComponent.id, rootComponent]]),
      levels: new Map([
        ['atom', []],
        ['molecule', []],
        ['organism', []],
        ['template', []],
        ['page', []],
      ]),
    };

    this.addNodeToLevel(hierarchy, rootComponent);
    this.hierarchies.set(name, hierarchy);

    return hierarchy;
  }

  /**
   * Add a component node to the hierarchy
   */
  addNode(
    hierarchyName: string,
    node: ComponentNode,
    parentId?: string
  ): ComponentNode {
    const hierarchy = this.hierarchies.get(hierarchyName);
    if (!hierarchy) {
      throw new Error(`Hierarchy ${hierarchyName} not found`);
    }

    // Set parent relationship
    if (parentId) {
      const parent = hierarchy.nodes.get(parentId);
      if (!parent) {
        throw new Error(`Parent node ${parentId} not found`);
      }
      node.parent = parentId;
      parent.children.push(node.id);
    }

    // Add to nodes map
    hierarchy.nodes.set(node.id, node);

    // Add to level map
    this.addNodeToLevel(hierarchy, node);

    return node;
  }

  /**
   * Get all nodes of a specific type/level
   */
  getNodesByType(
    hierarchyName: string,
    type: ComponentNode['type']
  ): ComponentNode[] {
    const hierarchy = this.hierarchies.get(hierarchyName);
    if (!hierarchy) {
      return [];
    }

    return hierarchy.levels.get(type) || [];
  }

  /**
   * Get hierarchy tree for visualization
   */
  getHierarchyTree(hierarchyName: string): HierarchyTree | undefined {
    return this.hierarchies.get(hierarchyName);
  }

  /**
   * Traverse hierarchy using depth-first search
   */
  traverseDFS(
    hierarchyName: string,
    callback: (node: ComponentNode) => void
  ): void {
    const hierarchy = this.hierarchies.get(hierarchyName);
    if (!hierarchy) {
      return;
    }

    const visit = (node: ComponentNode): void => {
      callback(node);
      node.children.forEach((childId) => {
        const child = hierarchy.nodes.get(childId);
        if (child) {
          visit(child);
        }
      });
    };

    visit(hierarchy.root);
  }

  /**
   * Traverse hierarchy using breadth-first search
   */
  traverseBFS(
    hierarchyName: string,
    callback: (node: ComponentNode) => void
  ): void {
    const hierarchy = this.hierarchies.get(hierarchyName);
    if (!hierarchy) {
      return;
    }

    const queue: ComponentNode[] = [hierarchy.root];

    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) {
        continue;
      }

      callback(node);

      node.children.forEach((childId) => {
        const child = hierarchy.nodes.get(childId);
        if (child) {
          queue.push(child);
        }
      });
    }
  }

  /**
   * Get component composition path (from atom to page)
   */
  getCompositionPath(hierarchyName: string, nodeId: string): ComponentNode[] {
    const hierarchy = this.hierarchies.get(hierarchyName);
    if (!hierarchy) {
      return [];
    }

    const path: ComponentNode[] = [];
    let current = hierarchy.nodes.get(nodeId);

    while (current) {
      path.unshift(current);
      if (current.parent) {
        current = hierarchy.nodes.get(current.parent);
      } else {
        break;
      }
    }

    return path;
  }

  /**
   * Generate visualization data for hierarchy
   */
  generateVisualization(hierarchyName: string): HierarchyVisualization {
    const hierarchy = this.hierarchies.get(hierarchyName);
    if (!hierarchy) {
      throw new Error(`Hierarchy ${hierarchyName} not found`);
    }

    // Generate Mermaid diagram
    const mermaid = this.generateMermaid(hierarchy);

    // Generate JSON structure
    const json = JSON.stringify(
      {
        name: hierarchyName,
        root: hierarchy.root.id,
        nodes: Array.from(hierarchy.nodes.values()),
        stats: this.getHierarchyStats(hierarchy),
      },
      null,
      2
    );

    // Generate D3 format
    const d3 = this.generateD3Format(hierarchy);

    return { mermaid, json, d3 };
  }

  /**
   * Get statistics about the hierarchy
   */
  getHierarchyStats(hierarchy: HierarchyTree): Record<string, number> {
    const stats: Record<string, number> = {
      total: hierarchy.nodes.size,
      atoms: 0,
      molecules: 0,
      organisms: 0,
      templates: 0,
      pages: 0,
      maxDepth: 0,
    };

    hierarchy.levels.forEach((nodes, level) => {
      stats[level] = nodes.length;
    });

    // Calculate max depth
    const calculateDepth = (node: ComponentNode, depth = 0): number => {
      if (node.children.length === 0) {
        return depth;
      }

      return Math.max(
        ...node.children.map((childId) => {
          const child = hierarchy.nodes.get(childId);
          return child ? calculateDepth(child, depth + 1) : depth;
        })
      );
    };

    stats.maxDepth = calculateDepth(hierarchy.root);

    return stats;
  }

  /**
   * Save hierarchy to database
   */
  async saveToDatabase(hierarchyName: string): Promise<void> {
    const hierarchy = this.hierarchies.get(hierarchyName);
    if (!hierarchy || !this.db) {
      return;
    }

    // Implementation would depend on database schema
    console.log(`Saving hierarchy ${hierarchyName} to database`);
    // TODO: Implement actual database save
  }

  /**
   * Load hierarchy from database
   */
  async loadFromDatabase(hierarchyName: string): Promise<HierarchyTree | null> {
    if (!this.db) {
      return null;
    }

    // Implementation would depend on database schema
    console.log(`Loading hierarchy ${hierarchyName} from database`);
    // TODO: Implement actual database load
    return null;
  }

  private addNodeToLevel(hierarchy: HierarchyTree, node: ComponentNode): void {
    const levelNodes = hierarchy.levels.get(node.type);
    if (levelNodes) {
      levelNodes.push(node);
    }
  }

  private generateMermaid(hierarchy: HierarchyTree): string {
    let mermaid = 'graph TD\n';

    hierarchy.nodes.forEach((node) => {
      const nodeLabel = `${node.name}[${node.type}]`;
      mermaid += `  ${node.id}["${nodeLabel}"]\n`;

      node.children.forEach((childId) => {
        mermaid += `  ${node.id} --> ${childId}\n`;
      });
    });

    return mermaid;
  }

  private generateD3Format(hierarchy: HierarchyTree): unknown {
    const convertNode = (node: ComponentNode): unknown => {
      return {
        name: node.name,
        type: node.type,
        id: node.id,
        children: node.children
          .map((childId) => hierarchy.nodes.get(childId))
          .filter((child) => child !== undefined)
          .map((child) => convertNode(child as ComponentNode)),
      };
    };

    return convertNode(hierarchy.root);
  }
}
