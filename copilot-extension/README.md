# LightDom Copilot Extension

AI-powered DOM optimization assistant for the LightDom platform, providing intelligent code suggestions, performance analysis, and automated optimizations.

## Features

- **DOM Optimization**: Get AI-powered suggestions for optimizing DOM structures
- **Performance Analysis**: Analyze code performance with ML-driven insights
- **Test Generation**: Automatically generate comprehensive test suites
- **Code Review**: Receive intelligent code review feedback
- **Inline Completions**: Get real-time code suggestions as you type
- **Auto-Optimization**: Automatically optimize files on save (configurable)

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "LightDom Copilot"
4. Click Install

## Configuration

Configure the extension through VS Code settings:

- `lightdom.api.endpoint`: LightDom API endpoint (default: `http://localhost:3001`)
- `lightdom.ml.enabled`: Enable ML-powered analysis (default: `true`)
- `lightdom.autoOptimize`: Automatically optimize files on save (default: `false`)

## Usage

### Commands

- `LightDom: Optimize DOM` - Optimize the current file with AI suggestions
- `LightDom: Analyze Performance` - Analyze performance metrics
- `LightDom: Generate Tests` - Generate test cases for current code
- `LightDom: Review Code` - Get AI-powered code review

### Context Menu

Right-click in any supported file type (TypeScript, JavaScript, HTML, CSS) to access optimization options.

### Status Bar

Click the LightDom icon in the status bar for quick optimization of the current file.

## Supported Languages

- TypeScript (.ts, .tsx)
- JavaScript (.js, .jsx)
- HTML (.html)
- CSS (.css)

## Architecture

The extension consists of:

- **DOMOptimizationProvider**: VS Code code actions provider
- **CopilotIntegrationManager**: Manages GitHub Copilot integration and prompt engineering
- **MCPClient**: Model Context Protocol client for advanced AI communication

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch for changes
npm run watch

# Run tests
npm run test
```

## Requirements

- VS Code 1.74.0 or higher
- LightDom API server running (default: localhost:3001)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.