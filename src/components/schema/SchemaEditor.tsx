/**
 * Visual Schema Editor - Interactive schema editor with validation
 */
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle, Wand2, Save, X } from 'lucide-react';
import { Button, Input, Badge, Card, CardContent } from '@/components/ui';

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';
  required?: boolean;
  description?: string;
}

interface Schema {
  id: string;
  name: string;
  description?: string;
  fields: SchemaField[];
}

interface SchemaEditorProps {
  schema?: Schema;
  onSave?: (schema: Schema) => void;
  onCancel?: () => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ schema: initialSchema, onSave, onCancel }) => {
  const [schema, setSchema] = useState<Schema>(
    initialSchema || { id: `schema-${Date.now()}`, name: '', description: '', fields: [] }
  );
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const errs: string[] = [];
    if (!schema.name) errs.push('Schema name required');
    if (schema.fields.length === 0) errs.push('At least one field required');
    schema.fields.forEach((f, i) => {
      if (!f.name) errs.push(`Field #${i + 1}: Name required`);
    });
    const names = schema.fields.map(f => f.name).filter(Boolean);
    const dups = names.filter((n, i) => names.indexOf(n) !== i);
    if (dups.length) errs.push(`Duplicate: ${[...new Set(dups)].join(', ')}`);
    setErrors(errs);
  }, [schema]);

  const handleAddField = () => {
    setSchema(p => ({ ...p, fields: [...p.fields, { name: '', type: 'string', required: false, description: '' }] }));
  };

  const handleRemoveField = (i: number) => {
    setSchema(p => ({ ...p, fields: p.fields.filter((_, idx) => idx !== i) }));
  };

  const handleUpdateField = (i: number, updates: Partial<SchemaField>) => {
    setSchema(p => ({ ...p, fields: p.fields.map((f, idx) => idx === i ? { ...f, ...updates } : f) }));
  };

  const handleSwitchMode = () => {
    if (jsonMode) {
      try {
        setSchema(JSON.parse(jsonText));
        setJsonMode(false);
      } catch (e) {
        setErrors(['Invalid JSON']);
      }
    } else {
      setJsonText(JSON.stringify(schema, null, 2));
      setJsonMode(true);
    }
  };

  const handleAutoFix = () => {
    setSchema(p => ({
      ...p,
      name: p.name || 'Untitled',
      fields: p.fields.filter(f => f.name).map(f => ({ ...f, type: f.type || 'string' }))
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Input
            placeholder="Schema name"
            value={schema.name}
            onChange={(e) => setSchema(p => ({ ...p, name: e.target.value }))}
            className="text-xl font-bold"
          />
          <Input
            placeholder="Description"
            value={schema.description || ''}
            onChange={(e) => setSchema(p => ({ ...p, description: e.target.value }))}
            className="mt-2"
          />
        </div>
        <div className="flex gap-2 ml-4">
          <Button variant="outlined" size="sm" onClick={handleSwitchMode}>
            {jsonMode ? 'Visual' : 'JSON'}
          </Button>
          {errors.length > 0 && (
            <Button variant="filled-tonal" size="sm" onClick={handleAutoFix} leftIcon={<Wand2 className="h-4 w-4" />}>
              Auto-Fix
            </Button>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <Card variant="outlined" className="border-error">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-error" />
              <div>
                <h4 className="font-semibold text-error">Errors</h4>
                <ul className="text-sm space-y-1 mt-1">
                  {errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {errors.length === 0 && schema.fields.length > 0 && (
        <div className="flex gap-2 text-success">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm">Valid schema</span>
        </div>
      )}

      {jsonMode ? (
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full h-96 rounded-lg border border-outline bg-surface-container p-4 font-mono text-sm"
        />
      ) : (
        <div className="space-y-3">
          {schema.fields.map((field, i) => (
            <Card key={i} variant="outlined">
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-3">
                  <Input
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) => handleUpdateField(i, { name: e.target.value })}
                    className="flex-1"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => handleUpdateField(i, { type: e.target.value as any })}
                    className="rounded-lg border border-outline px-3 py-2"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object</option>
                    <option value="array">Array</option>
                    <option value="date">Date</option>
                  </select>
                  <Button variant="text" size="sm" onClick={() => handleRemoveField(i)} className="text-error">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Description"
                  value={field.description || ''}
                  onChange={(e) => handleUpdateField(i, { description: e.target.value })}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => handleUpdateField(i, { required: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Required</span>
                </label>
              </CardContent>
            </Card>
          ))}
          <Button variant="outlined" onClick={handleAddField} leftIcon={<Plus className="h-4 w-4" />} fullWidth>
            Add Field
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && <Button variant="outlined" onClick={onCancel} leftIcon={<X className="h-4 w-4" />}>Cancel</Button>}
        <Button variant="filled" onClick={() => onSave?.(schema)} disabled={errors.length > 0} leftIcon={<Save className="h-4 w-4" />}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default SchemaEditor;
