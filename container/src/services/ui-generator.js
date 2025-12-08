/**
 * UI Generator
 * 
 * Generates form configurations from JSON Schema
 */

class UIGenerator {
  /**
   * Generate form configuration from JSON Schema
   */
  generateFormConfig(schema, uiSchema = {}) {
    const formConfig = {
      schema,
      uiSchema: {
        ...this.generateDefaultUISchema(schema),
        ...uiSchema
      },
      formData: this.generateDefaultFormData(schema)
    };

    return formConfig;
  }

  /**
   * Generate default UI schema
   */
  generateDefaultUISchema(schema) {
    const uiSchema = {};

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        // Set widget based on type
        if (prop.type === 'string') {
          if (prop.format === 'date') {
            uiSchema[key] = { 'ui:widget': 'date' };
          } else if (prop.format === 'email') {
            uiSchema[key] = { 'ui:widget': 'email' };
          } else if (prop.enum) {
            uiSchema[key] = { 'ui:widget': 'select' };
          } else if (prop.maxLength && prop.maxLength > 200) {
            uiSchema[key] = { 'ui:widget': 'textarea' };
          }
        } else if (prop.type === 'number' || prop.type === 'integer') {
          uiSchema[key] = { 'ui:widget': 'updown' };
        } else if (prop.type === 'boolean') {
          uiSchema[key] = { 'ui:widget': 'checkbox' };
        } else if (prop.type === 'array') {
          if (prop.items && prop.items.type === 'string') {
            uiSchema[key] = { 'ui:widget': 'tags' };
          }
        }

        // Add placeholders
        if (prop.description) {
          uiSchema[key] = {
            ...uiSchema[key],
            'ui:placeholder': prop.description
          };
        }
      }
    }

    return uiSchema;
  }

  /**
   * Generate default form data
   */
  generateDefaultFormData(schema) {
    const formData = {};

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.default !== undefined) {
          formData[key] = prop.default;
        } else if (schema.required && schema.required.includes(key)) {
          // Set empty value for required fields
          if (prop.type === 'string') formData[key] = '';
          else if (prop.type === 'number') formData[key] = 0;
          else if (prop.type === 'boolean') formData[key] = false;
          else if (prop.type === 'array') formData[key] = [];
          else if (prop.type === 'object') formData[key] = {};
        }
      }
    }

    return formData;
  }

  /**
   * Generate bulk edit table configuration
   */
  generateTableConfig(schema, entities = []) {
    const columns = [];

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        columns.push({
          key,
          title: prop.title || key,
          dataType: prop.type,
          editable: !prop.readOnly,
          sortable: true,
          filterable: prop.enum ? true : false,
          filterOptions: prop.enum || null
        });
      }
    }

    return {
      columns,
      data: entities,
      bulkActions: [
        { label: 'Delete', action: 'bulk_delete' },
        { label: 'Export', action: 'bulk_export' },
        { label: 'Enrich', action: 'bulk_enrich' }
      ]
    };
  }
}

export { UIGenerator };
