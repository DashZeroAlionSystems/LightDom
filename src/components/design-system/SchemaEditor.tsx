import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Trash2,
  GripVertical,
  Code,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

// Types
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'datetime'
  | 'color'
  | 'json'
  | 'array'
  | 'object'
  | 'reference';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'min' | 'max' | 'custom';
  value?: any;
  message?: string;
}

export interface SchemaField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  description?: string;
  defaultValue?: any;
  options?: Array<{ value: any; label: string }>;
  validations?: ValidationRule[];
  uiHints?: {
    placeholder?: string;
    helpText?: string;
    icon?: string;
    grouping?: string;
  };
  required?: boolean;
}

export interface ComponentSchema {
  id?: string;
  name: string;
  type: 'atom' | 'component' | 'dashboard' | 'workflow';
  description?: string;
  fields: SchemaField[];
  metadata?: Record<string, any>;
}

export interface SchemaEditorProps {
  schema: ComponentSchema;
  onChange: (schema: ComponentSchema) => void;
  mode?: 'visual' | 'code' | 'split';
  onSave?: (schema: ComponentSchema) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({
  schema,
  onChange,
  mode: initialMode = 'visual',
  onSave,
  onCancel,
  readOnly = false,
  className,
}) => {
  const [mode, setMode] = useState<'visual' | 'code' | 'split'>(initialMode);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleFieldExpand = useCallback((fieldId: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  }, []);

  const addField = useCallback(() => {
    const newField: SchemaField = {
      id: crypto.randomUUID(),
      key: `field_${schema.fields.length + 1}`,
      label: 'New Field',
      type: 'string',
      required: false,
    };

    onChange({
      ...schema,
      fields: [...schema.fields, newField],
    });

    setExpandedFields((prev) => new Set([...prev, newField.id]));
  }, [schema, onChange]);

  const removeField = useCallback(
    (fieldId: string) => {
      onChange({
        ...schema,
        fields: schema.fields.filter((f) => f.id !== fieldId),
      });
    },
    [schema, onChange]
  );

  const updateField = useCallback(
    (fieldId: string, updates: Partial<SchemaField>) => {
      onChange({
        ...schema,
        fields: schema.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
      });
    },
    [schema, onChange]
  );

  const moveField = useCallback(
    (fieldId: string, direction: 'up' | 'down') => {
      const index = schema.fields.findIndex((f) => f.id === fieldId);
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === schema.fields.length - 1)
      ) {
        return;
      }

      const newFields = [...schema.fields];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];

      onChange({
        ...schema,
        fields: newFields,
      });
    },
    [schema, onChange]
  );

  const validateSchema = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!schema.name?.trim()) {
      newErrors.name = 'Schema name is required';
    }

    schema.fields.forEach((field) => {
      if (!field.key?.trim()) {
        newErrors[`${field.id}_key`] = 'Field key is required';
      }
      if (!field.label?.trim()) {
        newErrors[`${field.id}_label`] = 'Field label is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [schema]);

  const handleSave = useCallback(() => {
    if (validateSchema() && onSave) {
      onSave(schema);
    }
  }, [schema, validateSchema, onSave]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Input
            label="Schema Name"
            value={schema.name}
            onChange={(e) => onChange({ ...schema, name: e.target.value })}
            error={errors.name}
            disabled={readOnly}
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-surface-container p-1">
            <button
              type="button"
              onClick={() => setMode('visual')}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'visual'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              )}
            >
              <Eye className="mr-2 inline h-4 w-4" />
              Visual
            </button>
            <button
              type="button"
              onClick={() => setMode('code')}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'code'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              )}
            >
              <Code className="mr-2 inline h-4 w-4" />
              Code
            </button>
            <button
              type="button"
              onClick={() => setMode('split')}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'split'
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              )}
            >
              <Settings className="mr-2 inline h-4 w-4" />
              Split
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <Input
        label="Description"
        value={schema.description || ''}
        onChange={(e) => onChange({ ...schema, description: e.target.value })}
        placeholder="Describe the purpose of this schema..."
        disabled={readOnly}
      />

      {/* Content */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Visual Editor */}
        {(mode === 'visual' || mode === 'split') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-on-surface">Fields</h3>
              {!readOnly && (
                <Button variant="filled-tonal" size="sm" onClick={addField} leftIcon={<Plus />}>
                  Add Field
                </Button>
              )}
            </div>

            {schema.fields.length === 0 ? (
              <Card variant="outlined" className="p-8 text-center">
                <p className="text-on-surface-variant">No fields defined yet.</p>
                {!readOnly && (
                  <Button variant="text" onClick={addField} className="mt-4">
                    Add your first field
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-2">
                {schema.fields.map((field, index) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    isExpanded={expandedFields.has(field.id)}
                    onToggle={() => toggleFieldExpand(field.id)}
                    onUpdate={(updates) => updateField(field.id, updates)}
                    onRemove={() => removeField(field.id)}
                    onMoveUp={index > 0 ? () => moveField(field.id, 'up') : undefined}
                    onMoveDown={
                      index < schema.fields.length - 1 ? () => moveField(field.id, 'down') : undefined
                    }
                    errors={{
                      key: errors[`${field.id}_key`],
                      label: errors[`${field.id}_label`],
                    }}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Code Editor */}
        {(mode === 'code' || mode === 'split') && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-on-surface">JSON Schema</h3>
            <Card variant="filled" className="p-4">
              <pre className="overflow-auto rounded bg-surface-container p-4 text-sm">
                <code>{JSON.stringify(schema, null, 2)}</code>
              </pre>
            </Card>
          </div>
        )}
      </div>

      {/* Actions */}
      {!readOnly && (onSave || onCancel) && (
        <div className="flex items-center justify-end gap-3 border-t border-outline pt-4">
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {onSave && (
            <Button variant="filled" onClick={handleSave} leftIcon={<CheckCircle2 />}>
              Save Schema
            </Button>
          )}
        </div>
      )}

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <Card variant="outlined" className="border-error bg-error-container/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-error" />
            <div className="flex-1">
              <h4 className="font-semibold text-error">Validation Errors</h4>
              <ul className="mt-2 space-y-1 text-sm text-on-error-container">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>• {message}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

interface FieldEditorProps {
  field: SchemaField;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<SchemaField>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  errors?: { key?: string; label?: string };
  readOnly?: boolean;
}

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  errors,
  readOnly,
}) => {
  return (
    <Card variant="outlined" className="overflow-hidden">
      {/* Field Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-container-highest"
      >
        <GripVertical className="h-5 w-5 text-on-surface-variant" />
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-on-surface-variant" />
        ) : (
          <ChevronRight className="h-5 w-5 text-on-surface-variant" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-on-surface">{field.label || field.key}</span>
            <Badge variant={field.required ? 'error' : 'secondary'} className="text-xs">
              {field.type}
            </Badge>
            {field.required && (
              <Badge variant="error" className="text-xs">
                Required
              </Badge>
            )}
          </div>
          {field.description && (
            <p className="mt-1 text-sm text-on-surface-variant">{field.description}</p>
          )}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="rounded p-1 hover:bg-surface-container-highest"
              >
                ↑
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="rounded p-1 hover:bg-surface-container-highest"
              >
                ↓
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="rounded p-1 text-error hover:bg-error-container/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </button>

      {/* Field Details */}
      {isExpanded && (
        <div className="space-y-4 border-t border-outline bg-surface-container/50 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Field Key"
              value={field.key}
              onChange={(e) => onUpdate({ key: e.target.value })}
              error={errors?.key}
              disabled={readOnly}
              placeholder="field_name"
            />
            <Input
              label="Label"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              error={errors?.label}
              disabled={readOnly}
              placeholder="Display Name"
            />
          </div>

          <Input
            label="Description"
            value={field.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            disabled={readOnly}
            placeholder="Help text for this field..."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Field Type</label>
              <select
                value={field.type}
                onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
                disabled={readOnly}
                className="w-full rounded-lg border border-outline bg-surface px-4 py-2 text-on-surface"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="select">Select</option>
                <option value="multiselect">Multi-Select</option>
                <option value="date">Date</option>
                <option value="datetime">Date & Time</option>
                <option value="color">Color</option>
                <option value="json">JSON</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
                <option value="reference">Reference</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Required</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  disabled={readOnly}
                  className="h-5 w-5 rounded border-outline"
                />
                <span className="text-sm text-on-surface-variant">This field is required</span>
              </label>
            </div>
          </div>

          {/* Options for select/multiselect */}
          {(field.type === 'select' || field.type === 'multiselect') && (
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">Options</label>
              <div className="space-y-2">
                {(field.options || []).map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[idx] = { ...option, label: e.target.value };
                        onUpdate({ options: newOptions });
                      }}
                      placeholder="Label"
                      disabled={readOnly}
                    />
                    <Input
                      value={option.value}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[idx] = { ...option, value: e.target.value };
                        onUpdate({ options: newOptions });
                      }}
                      placeholder="Value"
                      disabled={readOnly}
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = (field.options || []).filter((_, i) => i !== idx);
                          onUpdate({ options: newOptions });
                        }}
                        className="rounded p-2 text-error hover:bg-error-container/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => {
                      const newOptions = [...(field.options || []), { label: '', value: '' }];
                      onUpdate({ options: newOptions });
                    }}
                    leftIcon={<Plus />}
                  >
                    Add Option
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SchemaEditor;
