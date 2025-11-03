# Visual Workflow Builder - Phase 4 Documentation

## Overview

The Visual Workflow Builder is a drag-and-drop interface for creating, editing, and managing workflows visually. It provides an intuitive way to design complex workflows with task dependencies, real-time execution monitoring, and SVG-based high-quality graphics.

## Features

### 1. Drag-and-Drop Interface
- **Visual Task Placement**: Drag tasks anywhere on the canvas
- **Connection Drawing**: Click-to-connect tasks with dependency arrows
- **Real-time Updates**: See changes immediately as you build

### 2. Task Management
- **Add Tasks**: Create new tasks with custom labels, descriptions, and handlers
- **Edit Tasks**: Modify task properties inline
- **Delete Tasks**: Remove tasks and their connections
- **Task Status**: Visual indicators for pending, in-progress, completed, and failed states

### 3. Workflow Orchestration
- **Dependencies**: Create task dependencies by connecting tasks
- **Execution Order**: Visual representation of task execution flow
- **Parallel Execution**: Support for parallel task execution (visualized)
- **Conditional Logic**: Ready for conditional task execution

### 4. Visual Elements
- **SVG Rendering**: High-quality bezier curves for connections
- **Color-coded Status**: Tasks change color based on execution status
- **Animated Transitions**: Smooth task movements and status changes
- **Zoom and Pan**: (Future) Navigate large workflows

### 5. Workflow Operations
- **Save**: Persist workflow to database
- **Execute**: Run workflow with real-time status updates
- **Export**: Save workflow as JSON schema
- **Import**: Load workflows from templates or saved definitions

## Component Architecture

### VisualWorkflowBuilder Component

```typescript
interface Task {
  id: string;
  label: string;
  description: string;
  handler: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  position: { x: number; y: number };
  dependencies?: string[];
}

interface Connection {
  from: string;
  to: string;
}
```

**Key Props:**
- `onSave`: Callback when workflow is saved
- `onExecute`: Callback when workflow execution is triggered
- `initialWorkflow`: Existing workflow to edit

### WorkflowBuilderPage Component

Main page component that provides:
- Workflow list view
- Builder modal integration
- Workflow CRUD operations
- Execution management

## Usage

### Creating a New Workflow

1. **Navigate to Workflow Builder**
   ```typescript
   // Access via route
   /workflow-builder
   ```

2. **Click "Create New Workflow"**
   - Opens visual builder in modal

3. **Add Tasks**
   - Click "Add Task" button
   - Fill in task details:
     - Name
     - Description  
     - Handler type
   - Tasks appear on canvas

4. **Connect Tasks**
   - Select a task (click on it)
   - Click "Connect" button
   - Click on target task
   - Dependency arrow appears

5. **Save Workflow**
   - Enter workflow name
   - Click "Save Workflow"
   - Workflow persisted to database

6. **Execute Workflow**
   - Click "Execute" button
   - Watch real-time status updates
   - See task progression

### Editing Existing Workflow

1. **Select Workflow from List**
2. **Click "Edit" button**
3. **Modify tasks or connections**
4. **Save changes**

### Handler Types

Available task handlers:
- `data-source` - Database connections
- `dom-mining` - DOM extraction
- `schema-linking` - Schema analysis
- `component-generation` - Component creation
- `seo-optimization` - SEO processing
- `ml-training` - Machine learning
- `custom` - Custom handlers

## Integration with Existing System

### API Endpoints Used

```typescript
// Load workflows
GET /api/workflow-admin/workflows/summary

// Save new workflow
POST /api/workflow-admin/workflows

// Update workflow
PUT /api/workflow-admin/workflows/:id

// Execute workflow
POST /api/workflow-admin/workflows/:id/execute
```

### Database Schema

Workflows saved with visual builder include:
- Task positions (x, y coordinates)
- Connection information (dependencies)
- Metadata (created date, author)
- Version tracking

### Template Integration

Visual builder works seamlessly with:
- **JSON Schema Templates** (Phase 2)
- **AI-Generated Workflows** (Phase 3)
- **Database-Persisted Workflows** (Phase 1)

## Advanced Features

### Real-time Status Updates

During execution:
- Tasks change color based on status
- Progress indicators appear
- Completion states visualized

Status colors:
- **Gray**: Pending
- **Blue**: In Progress (animated)
- **Green**: Completed
- **Red**: Failed

### SVG Connection Rendering

Connections use bezier curves for professional appearance:
```typescript
// Curved connection with arrowhead
<path
  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
  stroke="#4096ff"
  strokeWidth="2"
  markerEnd="url(#arrowhead)"
/>
```

### Responsive Canvas

- Auto-sizing based on viewport
- Scrollable for large workflows
- Maintains aspect ratio

## Best Practices

### Workflow Design

1. **Start Simple**: Begin with 3-5 tasks
2. **Clear Names**: Use descriptive task names
3. **Logical Flow**: Organize tasks top-to-bottom or left-to-right
4. **Test Incrementally**: Execute after each major change

### Performance

- **Limit Tasks**: Keep under 50 tasks per workflow for optimal performance
- **Connection Count**: Avoid excessive connections (star patterns)
- **Save Frequently**: Persist changes regularly

### Accessibility

- **Keyboard Support**: (Future) Keyboard navigation
- **Screen Readers**: ARIA labels on interactive elements
- **High Contrast**: Clear visual distinction between states

## Examples

### Simple Data Pipeline

```typescript
const dataWorkflow = {
  name: "Data Processing Pipeline",
  tasks: [
    {
      id: "task-1",
      label: "Extract Data",
      description: "Pull data from source DB",
      handler: "data-source",
      position: { x: 100, y: 100 }
    },
    {
      id: "task-2",
      label: "Transform Data",
      description: "Clean and normalize",
      handler: "custom",
      position: { x: 100, y: 250 },
      dependencies: ["task-1"]
    },
    {
      id: "task-3",
      label: "Load Data",
      description: "Insert into target DB",
      handler: "data-source",
      position: { x: 100, y: 400 },
      dependencies: ["task-2"]
    }
  ]
};
```

### SEO Workflow

```typescript
const seoWorkflow = {
  name: "SEO Optimization",
  tasks: [
    {
      id: "task-1",
      label: "Crawl Pages",
      handler: "dom-mining",
      position: { x: 100, y: 100 }
    },
    {
      id: "task-2",
      label: "Analyze SEO",
      handler: "seo-optimization",
      position: { x: 300, y: 100 },
      dependencies: ["task-1"]
    },
    {
      id: "task-3",
      label: "Generate Report",
      handler: "custom",
      position: { x: 500, y: 100 },
      dependencies: ["task-2"]
    }
  ]
};
```

## Troubleshooting

### Tasks Not Connecting

- **Check Selection**: Ensure task is selected (blue border)
- **Click Sequence**: Select source, click "Connect", then target
- **Validation**: Connections validate against cycles

### Save Failures

- **Name Required**: Workflow must have a name
- **Task Validation**: All tasks need required fields
- **Network**: Check API endpoint availability

### Performance Issues

- **Too Many Tasks**: Reduce task count
- **Browser Memory**: Clear cache and reload
- **SVG Rendering**: Check GPU acceleration enabled

## Future Enhancements

### Planned Features

- **Zoom Controls**: Zoom in/out on canvas
- **Minimap**: Navigate large workflows
- **Undo/Redo**: Edit history management
- **Templates**: Pre-built workflow templates
- **Export Options**: PNG, SVG, PDF export
- **Collaboration**: Multi-user editing
- **Version History**: Track workflow changes
- **Testing Mode**: Dry-run execution
- **Analytics**: Workflow performance metrics

### Integration Roadmap

- **React Flow Integration**: Consider migrating to React Flow library
- **3D Visualization**: WebGL-based 3D workflow views
- **AI Suggestions**: Smart connection recommendations
- **Auto-layout**: Automatic task positioning
- **Mobile Support**: Touch-optimized interface

## API Reference

### VisualWorkflowBuilder Props

```typescript
interface WorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  onExecute?: (workflowId: string) => void;
  initialWorkflow?: any;
}
```

### Task Object

```typescript
interface Task {
  id: string;              // Unique identifier
  label: string;           // Display name
  description: string;     // Task description
  handler: string;         // Handler type
  status?: string;         // Execution status
  position: {
    x: number;             // X coordinate
    y: number;             // Y coordinate
  };
  dependencies?: string[]; // Parent task IDs
}
```

### Connection Object

```typescript
interface Connection {
  from: string;  // Source task ID
  to: string;    // Target task ID
}
```

## Conclusion

The Visual Workflow Builder provides an intuitive, powerful interface for creating and managing complex workflows. It integrates seamlessly with the existing workflow system while offering enhanced usability through drag-and-drop interactions and real-time visual feedback.
