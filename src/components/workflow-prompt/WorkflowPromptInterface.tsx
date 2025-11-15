import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Card, CardContent, Typography, Chip, List, ListItem, ListItemText, IconButton, Paper, CircularProgress } from '@mui/material';
import { Send as SendIcon, AutoAwesome as AIIcon, PlayArrow as ExecuteIcon, Edit as EditIcon } from '@mui/icons-material';

interface GeneratedWorkflow {
  id: string;
  name: string;
  description: string;
  steps: Array<{name: string; type: string;}>;
  nextSteps: string[];
}

export const WorkflowPromptInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/workflow-prompt/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setGeneratedWorkflow(data.workflow);
      setPrompt('');
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AIIcon sx={{ fontSize: 40, color: '#6366f1', mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>AI Workflow Assistant</Typography>
            <Typography variant="body2" color="text.secondary">Describe your workflow in natural language</Typography>
          </Box>
        </Box>
        <TextField fullWidth multiline rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Example: Create an SEO audit workflow..." variant="outlined" sx={{ mb: 2 }} />
        <Button variant="contained" onClick={handleSubmitPrompt} disabled={loading || !prompt.trim()} startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}>
          {loading ? 'Creating...' : 'Create Workflow'}
        </Button>
      </Paper>

      {generatedWorkflow && (
        <Card elevation={3} sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5">{generatedWorkflow.name}</Typography>
            <Typography variant="body1" color="text.secondary">{generatedWorkflow.description}</Typography>
            <Box sx={{ mt: 2 }}>
              {generatedWorkflow.steps.map((step, i) => <Chip key={i} label={`${i+1}. ${step.name}`} sx={{ mr: 1, mb: 1 }} />)}
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<ExecuteIcon />}>Execute Now</Button>
              <Button variant="outlined" startIcon={<EditIcon />}>Customize</Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WorkflowPromptInterface;
