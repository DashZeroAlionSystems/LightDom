import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { FormGroup } from '../../molecules/FormGroup';
import { AlertBanner } from '../../molecules/AlertBanner';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: string }[]; // For select/radio
  validation?: (value: any) => string | undefined;
  defaultValue?: any;
  description?: string;
}

export interface FormProps {
  title?: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  variant?: 'default' | 'card';
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  title,
  description,
  fields,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  loading = false,
  variant = 'default',
  className = '',
}) => {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      initial[field.name] = field.defaultValue ?? '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate field if touched
    if (touched[name]) {
      const field = fields.find((f) => f.name === name);
      if (field?.validation) {
        const error = field.validation(value);
        setErrors((prev) => ({
          ...prev,
          [name]: error || '',
        }));
      }
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const field = fields.find((f) => f.name === name);
    if (field?.validation) {
      const error = field.validation(values[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error || '',
      }));
    }
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const value = values[field.name];

      // Check required
      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`;
        isValid = false;
      }

      // Custom validation
      if (field.validation) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach((field) => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validate
    if (!validateAll()) {
      setSubmitError('Please fix the errors above');
      return;
    }

    try {
      await onSubmit(values);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const containerClass = variant === 'card'
    ? 'bg-white rounded-lg border border-gray-200 p-6'
    : '';

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${containerClass} ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}

      {/* Success/Error Messages */}
      {submitSuccess && (
        <AlertBanner
          variant="success"
          title="Success"
          message="Form submitted successfully"
          icon={<CheckCircle2 size={20} />}
        />
      )}
      {submitError && (
        <AlertBanner
          variant="error"
          title="Error"
          message={submitError}
          icon={<AlertCircle size={20} />}
        />
      )}

      {/* Fields */}
      <div className="space-y-4">
        {fields.map((field) => (
          <FormGroup
            key={field.name}
            label={field.label}
            htmlFor={field.name}
            error={touched[field.name] ? errors[field.name] : undefined}
            required={field.required}
            description={field.description}
          >
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                placeholder={field.placeholder}
                disabled={field.disabled || loading}
                required={field.required}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                disabled={field.disabled || loading}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  checked={values[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  onBlur={() => handleBlur(field.name)}
                  disabled={field.disabled || loading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700">{field.label}</span>
              </label>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field.name)}
                placeholder={field.placeholder}
                disabled={field.disabled || loading}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            )}
          </FormGroup>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={loading} className="flex-1 sm:flex-initial">
          {loading ? 'Submitting...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
        )}
      </div>
    </form>
  );
};
