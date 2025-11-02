import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface WorkflowDiagramViewProps {
  config: any;
}

const WorkflowDiagramView: React.FC<WorkflowDiagramViewProps> = ({ config }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !config) return;

    // Initialize Mermaid
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });

    // Generate Mermaid diagram from config
    const diagram = generateMermaidDiagram(config);
    
    // Render diagram
    const renderDiagram = async () => {
      if (containerRef.current) {
        try {
          const { svg } = await mermaid.render('workflow-diagram', diagram);
          containerRef.current.innerHTML = svg;
        } catch (error) {
          console.error('Error rendering diagram:', error);
          containerRef.current.innerHTML = '<p class="text-error">Error rendering diagram</p>';
        }
      }
    };

    renderDiagram();
  }, [config]);

  const generateMermaidDiagram = (config: any): string => {
    const steps = config.steps || [];
    
    let diagram = 'graph TD\n';
    diagram += '  Start[Start] --> ';
    
    if (steps.length > 0) {
      diagram += `Step1[${steps[0].name || 'Step 1'}]\n`;
      
      for (let i = 1; i < steps.length; i++) {
        diagram += `  Step${i}[${steps[i - 1].name || `Step ${i}`}] --> Step${i + 1}[${steps[i].name || `Step ${i + 1}`}]\n`;
      }
      
      diagram += `  Step${steps.length}[${steps[steps.length - 1].name || `Step ${steps.length}`}] --> End[Complete]\n`;
    } else {
      diagram += 'End[Complete]\n';
    }
    
    // Add styling
    diagram += '  style Start fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n';
    diagram += '  style End fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n';
    
    return diagram;
  };

  return (
    <div className="rounded-xl border border-outline bg-surface-container-high p-6">
      <div ref={containerRef} className="workflow-diagram" />
    </div>
  );
};

export default WorkflowDiagramView;
