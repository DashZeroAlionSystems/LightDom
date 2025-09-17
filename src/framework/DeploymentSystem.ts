/**
 * Deployment System - Independent deployment and execution of LightDom Framework
 * Handles containerization, scaling, and distributed execution
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface DeploymentConfig {
  name: string;
  version: string;
  port: number;
  replicas: number;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  environment: Record<string, string>;
  enableLoadBalancer: boolean;
  enableMonitoring: boolean;
  enableAutoScaling: boolean;
  scalingConfig: {
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
    targetMemory: number;
  };
}

export interface DeploymentStatus {
  name: string;
  status: 'deploying' | 'running' | 'stopped' | 'error';
  replicas: number;
  runningReplicas: number;
  uptime: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  endpoints: string[];
  logs: string[];
}

export class DeploymentSystem extends EventEmitter {
  private config: DeploymentConfig;
  private deployments: Map<string, DeploymentStatus> = new Map();
  private isRunning = false;

  constructor(config: Partial<DeploymentConfig> = {}) {
    super();
    this.config = {
      name: 'lightdom-framework',
      version: '1.0.0',
      port: 3000,
      replicas: 1,
      resources: {
        cpu: '500m',
        memory: '512Mi',
        storage: '1Gi'
      },
      environment: {},
      enableLoadBalancer: true,
      enableMonitoring: true,
      enableAutoScaling: false,
      scalingConfig: {
        minReplicas: 1,
        maxReplicas: 10,
        targetCPU: 70,
        targetMemory: 80
      },
      ...config
    };
  }

  /**
   * Deploy LightDom Framework
   */
  async deploy(): Promise<DeploymentStatus> {
    try {
      console.log(`🚀 Deploying LightDom Framework: ${this.config.name}`);
      
      // Create deployment directory
      await this.createDeploymentDirectory();
      
      // Generate deployment files
      await this.generateDeploymentFiles();
      
      // Deploy using Docker/Kubernetes
      const deploymentStatus = await this.executeDeployment();
      
      // Store deployment status
      this.deployments.set(this.config.name, deploymentStatus);
      
      this.emit('deployed', deploymentStatus);
      console.log(`✅ LightDom Framework deployed successfully: ${this.config.name}`);
      
      return deploymentStatus;
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  }

  /**
   * Scale deployment
   */
  async scale(replicas: number): Promise<DeploymentStatus> {
    if (replicas < 1) {
      throw new Error('Replicas must be at least 1');
    }

    try {
      console.log(`📈 Scaling deployment to ${replicas} replicas`);
      
      // Update Kubernetes deployment
      await execAsync(`kubectl scale deployment ${this.config.name} --replicas=${replicas}`);
      
      // Update local config
      this.config.replicas = replicas;
      
      // Get updated status
      const status = await this.getDeploymentStatus(this.config.name);
      this.deployments.set(this.config.name, status);
      
      this.emit('scaled', { name: this.config.name, replicas, status });
      console.log(`✅ Deployment scaled to ${replicas} replicas`);
      
      return status;
    } catch (error) {
      console.error('❌ Scaling failed:', error);
      throw error;
    }
  }

  /**
   * Stop deployment
   */
  async stop(): Promise<void> {
    try {
      console.log(`🛑 Stopping deployment: ${this.config.name}`);
      
      // Scale down to 0 replicas
      await execAsync(`kubectl scale deployment ${this.config.name} --replicas=0`);
      
      // Update status
      const status = this.deployments.get(this.config.name);
      if (status) {
        status.status = 'stopped';
        status.runningReplicas = 0;
        this.deployments.set(this.config.name, status);
      }
      
      this.emit('stopped', this.config.name);
      console.log(`✅ Deployment stopped: ${this.config.name}`);
    } catch (error) {
      console.error('❌ Stop failed:', error);
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(name: string): Promise<DeploymentStatus> {
    try {
      // Get Kubernetes deployment status
      const { stdout } = await execAsync(`kubectl get deployment ${name} -o json`);
      const deployment = JSON.parse(stdout);
      
      const status: DeploymentStatus = {
        name,
        status: this.mapKubernetesStatus(deployment.status.conditions),
        replicas: deployment.spec.replicas,
        runningReplicas: deployment.status.readyReplicas || 0,
        uptime: this.calculateUptime(deployment.metadata.creationTimestamp),
        health: this.determineHealth(deployment.status),
        endpoints: await this.getEndpoints(name),
        logs: await this.getLogs(name)
      };
      
      return status;
    } catch (error) {
      console.error('❌ Failed to get deployment status:', error);
      return {
        name,
        status: 'error',
        replicas: 0,
        runningReplicas: 0,
        uptime: 0,
        health: 'unknown',
        endpoints: [],
        logs: []
      };
    }
  }

  /**
   * Get all deployments
   */
  getAllDeployments(): DeploymentStatus[] {
    return Array.from(this.deployments.values());
  }

  /**
   * Get deployment logs
   */
  async getLogs(name: string, lines: number = 100): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`kubectl logs deployment/${name} --tail=${lines}`);
      return stdout.split('\n').filter(line => line.trim());
    } catch (error) {
      console.error('❌ Failed to get logs:', error);
      return [];
    }
  }

  /**
   * Create deployment directory
   */
  private async createDeploymentDirectory(): Promise<void> {
    const deploymentDir = path.join(process.cwd(), 'deployments', this.config.name);
    await fs.mkdir(deploymentDir, { recursive: true });
  }

  /**
   * Generate deployment files
   */
  private async generateDeploymentFiles(): Promise<void> {
    const deploymentDir = path.join(process.cwd(), 'deployments', this.config.name);
    
    // Generate Dockerfile
    await this.generateDockerfile(deploymentDir);
    
    // Generate Kubernetes manifests
    await this.generateKubernetesManifests(deploymentDir);
    
    // Generate docker-compose.yml
    await this.generateDockerCompose(deploymentDir);
    
    // Generate environment file
    await this.generateEnvironmentFile(deploymentDir);
  }

  /**
   * Generate Dockerfile
   */
  private async generateDockerfile(deploymentDir: string): Promise<void> {
    const dockerfile = `# LightDom Framework Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE ${this.config.port}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:${this.config.port}/health || exit 1

# Start the application
CMD ["npm", "start"]
`;

    await fs.writeFile(path.join(deploymentDir, 'Dockerfile'), dockerfile);
  }

  /**
   * Generate Kubernetes manifests
   */
  private async generateKubernetesManifests(deploymentDir: string): Promise<void> {
    // Deployment manifest
    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: this.config.name,
        labels: {
          app: this.config.name,
          version: this.config.version
        }
      },
      spec: {
        replicas: this.config.replicas,
        selector: {
          matchLabels: {
            app: this.config.name
          }
        },
        template: {
          metadata: {
            labels: {
              app: this.config.name,
              version: this.config.version
            }
          },
          spec: {
            containers: [{
              name: this.config.name,
              image: `${this.config.name}:${this.config.version}`,
              ports: [{
                containerPort: this.config.port
              }],
              resources: {
                requests: this.config.resources,
                limits: this.config.resources
              },
              env: Object.entries(this.config.environment).map(([key, value]) => ({
                name: key,
                value: value
              })),
              livenessProbe: {
                httpGet: {
                  path: '/health',
                  port: this.config.port
                },
                initialDelaySeconds: 30,
                periodSeconds: 10
              },
              readinessProbe: {
                httpGet: {
                  path: '/health',
                  port: this.config.port
                },
                initialDelaySeconds: 5,
                periodSeconds: 5
              }
            }]
          }
        }
      }
    };

    // Service manifest
    const service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: `${this.config.name}-service`,
        labels: {
          app: this.config.name
        }
      },
      spec: {
        selector: {
          app: this.config.name
        },
        ports: [{
          port: 80,
          targetPort: this.config.port
        }],
        type: this.config.enableLoadBalancer ? 'LoadBalancer' : 'ClusterIP'
      }
    };

    // Ingress manifest (if load balancer is enabled)
    const ingress = this.config.enableLoadBalancer ? {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: `${this.config.name}-ingress`,
        annotations: {
          'nginx.ingress.kubernetes.io/rewrite-target': '/'
        }
      },
      spec: {
        rules: [{
          host: `${this.config.name}.local`,
          http: {
            paths: [{
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: `${this.config.name}-service`,
                  port: {
                    number: 80
                  }
                }
              }
            }]
          }
        }]
      }
    } : null;

    // Write manifests
    await fs.writeFile(
      path.join(deploymentDir, 'deployment.yaml'),
      this.yamlStringify(deployment)
    );
    
    await fs.writeFile(
      path.join(deploymentDir, 'service.yaml'),
      this.yamlStringify(service)
    );

    if (ingress) {
      await fs.writeFile(
        path.join(deploymentDir, 'ingress.yaml'),
        this.yamlStringify(ingress)
      );
    }
  }

  /**
   * Generate docker-compose.yml
   */
  private async generateDockerCompose(deploymentDir: string): Promise<void> {
    const dockerCompose = {
      version: '3.8',
      services: {
        [this.config.name]: {
          build: '.',
          ports: [`${this.config.port}:${this.config.port}`],
          environment: this.config.environment,
          deploy: {
            resources: {
              limits: this.config.resources,
              reservations: this.config.resources
            },
            replicas: this.config.replicas
          },
          healthcheck: {
            test: [`CMD-SHELL`, `curl -f http://localhost:${this.config.port}/health || exit 1`],
            interval: '30s',
            timeout: '10s',
            retries: 3,
            start_period: '40s'
          }
        }
      }
    };

    await fs.writeFile(
      path.join(deploymentDir, 'docker-compose.yml'),
      this.yamlStringify(dockerCompose)
    );
  }

  /**
   * Generate environment file
   */
  private async generateEnvironmentFile(deploymentDir: string): Promise<void> {
    const envContent = Object.entries(this.config.environment)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(path.join(deploymentDir, '.env'), envContent);
  }

  /**
   * Execute deployment
   */
  private async executeDeployment(): Promise<DeploymentStatus> {
    const deploymentDir = path.join(process.cwd(), 'deployments', this.config.name);
    
    try {
      // Build Docker image
      console.log('🔨 Building Docker image...');
      await execAsync(`docker build -t ${this.config.name}:${this.config.version} ${deploymentDir}`);
      
      // Apply Kubernetes manifests
      console.log('🚀 Applying Kubernetes manifests...');
      await execAsync(`kubectl apply -f ${deploymentDir}/deployment.yaml`);
      await execAsync(`kubectl apply -f ${deploymentDir}/service.yaml`);
      
      if (this.config.enableLoadBalancer) {
        await execAsync(`kubectl apply -f ${deploymentDir}/ingress.yaml`);
      }
      
      // Wait for deployment to be ready
      console.log('⏳ Waiting for deployment to be ready...');
      await execAsync(`kubectl rollout status deployment/${this.config.name}`);
      
      // Get deployment status
      const status = await this.getDeploymentStatus(this.config.name);
      
      return status;
    } catch (error) {
      console.error('❌ Deployment execution failed:', error);
      throw error;
    }
  }

  /**
   * Get deployment endpoints
   */
  private async getEndpoints(name: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`kubectl get service ${name}-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}'`);
      const ip = stdout.trim();
      
      if (ip) {
        return [`http://${ip}`];
      } else {
        // Get cluster IP
        const { stdout: clusterIP } = await execAsync(`kubectl get service ${name}-service -o jsonpath='{.spec.clusterIP}'`);
        return [`http://${clusterIP.trim()}`];
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * Map Kubernetes status to deployment status
   */
  private mapKubernetesStatus(conditions: any[]): DeploymentStatus['status'] {
    const availableCondition = conditions.find(c => c.type === 'Available');
    const progressingCondition = conditions.find(c => c.type === 'Progressing');
    
    if (availableCondition?.status === 'True') {
      return 'running';
    } else if (progressingCondition?.status === 'True') {
      return 'deploying';
    } else {
      return 'error';
    }
  }

  /**
   * Calculate uptime
   */
  private calculateUptime(creationTimestamp: string): number {
    const created = new Date(creationTimestamp).getTime();
    return Date.now() - created;
  }

  /**
   * Determine health status
   */
  private determineHealth(status: any): DeploymentStatus['health'] {
    const readyReplicas = status.readyReplicas || 0;
    const replicas = status.replicas || 0;
    
    if (readyReplicas === replicas && replicas > 0) {
      return 'healthy';
    } else if (readyReplicas > 0) {
      return 'unhealthy';
    } else {
      return 'unknown';
    }
  }

  /**
   * Convert object to YAML string
   */
  private yamlStringify(obj: any): string {
    // Simple YAML stringifier (in production, use a proper YAML library)
    return JSON.stringify(obj, null, 2)
      .replace(/"/g, '')
      .replace(/,/g, '')
      .replace(/:/g, ': ')
      .replace(/\{/g, '')
      .replace(/\}/g, '');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DeploymentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * Get configuration
   */
  getConfig(): DeploymentConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const deploymentSystem = new DeploymentSystem();
