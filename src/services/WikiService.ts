/**
 * WikiService
 * 
 * Manages research topics and knowledge graph
 * Loads topic.json files and persists them to the database
 * Builds knowledge graph from related topics
 * 
 * @module WikiService
 */

import { getDatabaseService } from '../DatabaseService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ResearchTopic {
  $id: string;
  type: string;
  title: string;
  description: string;
  tags: string[];
  content: {
    summary: string;
    keyPoints: string[];
    references: Array<{
      title: string;
      url: string;
      type: string;
    }>;
    relatedTopics: string[];
  };
  metadata: {
    author: string;
    createdDate: string;
    status: string;
    priority: string;
  };
}

export interface KnowledgeGraphNode {
  id: string;
  title: string;
  type: string;
  connections: string[];
}

export class WikiService {
  private topicsPath: string;
  private dbService: ReturnType<typeof getDatabaseService>;

  constructor(topicsPath?: string) {
    // Default to data/wiki directory at project root
    this.topicsPath = topicsPath || path.resolve(__dirname, '../../../data/wiki');
    this.dbService = getDatabaseService();
  }

  /**
   * Load all topic.json files and persist to database
   */
  async loadTopics(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.topicsPath, { recursive: true });

      const files = await fs.readdir(this.topicsPath);
      const topicFiles = files.filter((f) => f.endsWith('.topic.json'));

      console.log(`📚 Loading ${topicFiles.length} research topics...`);

      for (const file of topicFiles) {
        try {
          const filePath = path.join(this.topicsPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const topic: ResearchTopic = JSON.parse(content);

          await this.saveTopic(topic);
          console.log(`  ✅ Loaded topic: ${topic.title}`);
        } catch (error) {
          console.error(`  ❌ Failed to load topic ${file}:`, error);
        }
      }

      console.log('✨ All topics loaded successfully');
    } catch (error) {
      console.error('Failed to load topics:', error);
      throw error;
    }
  }

  /**
   * Save a research topic to the database
   */
  async saveTopic(topic: ResearchTopic): Promise<void> {
    await this.dbService.query(
      `INSERT INTO content_entities (type, title, description, content, metadata, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ON CONSTRAINT content_entities_pkey
       DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         content = EXCLUDED.content,
         metadata = EXCLUDED.metadata,
         tags = EXCLUDED.tags,
         updated_at = CURRENT_TIMESTAMP`,
      [
        topic.type,
        topic.title,
        topic.description,
        JSON.stringify(topic.content),
        JSON.stringify(topic.metadata),
        topic.tags,
      ]
    );
  }

  /**
   * Get all research topics
   */
  async getAllTopics(): Promise<ResearchTopic[]> {
    const result = await this.dbService.query<any>(
      `SELECT * FROM content_entities WHERE type = 'ld:ResearchTopic' AND is_active = true ORDER BY created_at DESC`
    );

    return result.rows.map((row) => ({
      $id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      tags: row.tags,
      content: row.content,
      metadata: row.metadata,
    }));
  }

  /**
   * Get a research topic by ID
   */
  async getTopicById(id: string): Promise<ResearchTopic | null> {
    const result = await this.dbService.query<any>(
      `SELECT * FROM content_entities WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      $id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      tags: row.tags,
      content: row.content,
      metadata: row.metadata,
    };
  }

  /**
   * Search topics by tag
   */
  async searchByTag(tag: string): Promise<ResearchTopic[]> {
    const result = await this.dbService.query<any>(
      `SELECT * FROM content_entities 
       WHERE type = 'ld:ResearchTopic' 
       AND $1 = ANY(tags) 
       AND is_active = true
       ORDER BY created_at DESC`,
      [tag]
    );

    return result.rows.map((row) => ({
      $id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      tags: row.tags,
      content: row.content,
      metadata: row.metadata,
    }));
  }

  /**
   * Build knowledge graph from topics
   */
  async buildKnowledgeGraph(): Promise<KnowledgeGraphNode[]> {
    const topics = await this.getAllTopics();
    const graph: KnowledgeGraphNode[] = [];

    for (const topic of topics) {
      graph.push({
        id: topic.$id,
        title: topic.title,
        type: topic.type,
        connections: topic.content.relatedTopics || [],
      });
    }

    return graph;
  }

  /**
   * Get related topics for a given topic
   */
  async getRelatedTopics(topicId: string): Promise<ResearchTopic[]> {
    const topic = await this.getTopicById(topicId);
    if (!topic || !topic.content.relatedTopics) {
      return [];
    }

    const related: ResearchTopic[] = [];
    for (const relatedId of topic.content.relatedTopics) {
      const relatedTopic = await this.getTopicById(relatedId);
      if (relatedTopic) {
        related.push(relatedTopic);
      }
    }

    return related;
  }
}

// Singleton instance
export const wikiService = new WikiService();

export default WikiService;
