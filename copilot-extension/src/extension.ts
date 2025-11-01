import * as vscode from 'vscode';
import { DOMOptimizationProvider } from './providers/DOMOptimizationProvider';
import { CopilotIntegrationManager } from './services/CopilotIntegrationManager';
import { MCPClient } from './services/MCPClient';

let optimizationProvider: DOMOptimizationProvider;
let copilotManager: CopilotIntegrationManager;
let mcpClient: MCPClient;

export function activate(context: vscode.ExtensionContext) {
  console.log('LightDom Copilot extension activated');

  // Initialize MCP client for advanced AI features
  const config = vscode.workspace.getConfiguration('lightdom');
  const serverUrl = config.get('api.endpoint', 'ws://localhost:3001/mcp');
  mcpClient = new MCPClient(serverUrl);
  context.subscriptions.push(mcpClient);

  // Register DOM optimization provider
  optimizationProvider = new DOMOptimizationProvider(mcpClient);
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ['typescript', 'javascript', 'html', 'css', 'typescriptreact', 'javascriptreact'],
      optimizationProvider
    )
  );

  // Initialize Copilot integration
  copilotManager = new CopilotIntegrationManager(mcpClient);
  context.subscriptions.push(copilotManager);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('lightdom.optimizeDOM', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await copilotManager.optimizeCurrentFile(editor);
      } else {
        vscode.window.showErrorMessage('No active editor found');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lightdom.analyzePerformance', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await copilotManager.analyzePerformance(editor);
      } else {
        vscode.window.showErrorMessage('No active editor found');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lightdom.generateTests', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await copilotManager.generateTests(editor);
      } else {
        vscode.window.showErrorMessage('No active editor found');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('lightdom.reviewCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await copilotManager.reviewCode(editor);
      } else {
        vscode.window.showErrorMessage('No active editor found');
      }
    })
  );

  // Register event listeners
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const config = vscode.workspace.getConfiguration('lightdom');
      if (config.get('autoOptimize', false)) {
        // Auto-analyze saved files
        const editor = vscode.window.visibleTextEditors.find(e => e.document === document);
        if (editor) {
          await copilotManager.autoAnalyze(editor);
        }
      }
    })
  );

  // Initialize status bar
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'lightdom.optimizeDOM';
  statusBarItem.text = '$(lightbulb) LightDom';
  statusBarItem.tooltip = 'Click to optimize current file';
  context.subscriptions.push(statusBarItem);
  statusBarItem.show();

  // Show activation message
  vscode.window.showInformationMessage(
    'LightDom Copilot activated! Right-click in editors for optimization options.'
  );
}

export function deactivate() {
  console.log('LightDom Copilot extension deactivated');
}