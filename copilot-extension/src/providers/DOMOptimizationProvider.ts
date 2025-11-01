import * as vscode from 'vscode';
import { MCPClient, DOMOptimizationRequest } from '../services/MCPClient';

export class DOMOptimizationProvider implements vscode.CodeActionProvider {
  constructor(private mcpClient: MCPClient) {}

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    // Only provide actions for relevant file types
    if (!this.isSupportedFileType(document.languageId)) {
      return actions;
    }

    // Optimize DOM action
    const optimizeAction = new vscode.CodeAction(
      'Optimize with LightDom AI',
      vscode.CodeActionKind.QuickFix
    );
    optimizeAction.command = {
      command: 'lightdom.optimizeDOM',
      title: 'Optimize with LightDom AI',
      arguments: [document, range]
    };
    actions.push(optimizeAction);

    // Analyze performance action
    const analyzeAction = new vscode.CodeAction(
      'Analyze Performance',
      vscode.CodeActionKind.QuickFix
    );
    analyzeAction.command = {
      command: 'lightdom.analyzePerformance',
      title: 'Analyze Performance',
      arguments: [document, range]
    };
    actions.push(analyzeAction);

    // Generate tests action
    const testAction = new vscode.CodeAction(
      'Generate Tests',
      vscode.CodeActionKind.QuickFix
    );
    testAction.command = {
      command: 'lightdom.generateTests',
      title: 'Generate Tests',
      arguments: [document, range]
    };
    actions.push(testAction);

    return actions;
  }

  private isSupportedFileType(languageId: string): boolean {
    const supportedTypes = [
      'typescript',
      'javascript',
      'html',
      'css',
      'typescriptreact',
      'javascriptreact'
    ];
    return supportedTypes.includes(languageId);
  }
}