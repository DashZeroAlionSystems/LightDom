/**
 * Data Streams Management Storybook
 */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import DataStreamsManagement from './DataStreamsManagement';
import { ConfigProvider } from 'antd';

const meta: Meta<typeof DataStreamsManagement> = {
  title: 'Components/DataStreamsManagement',
  component: DataStreamsManagement,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ConfigProvider>
        <div style={{ minHeight: '100vh' }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DataStreamsManagement>;

export const Default: Story = {
  args: {},
};

export const WithMockData: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/data-streams',
        method: 'GET',
        status: 200,
        response: {
          success: true,
          data: [
            {
              id: '1',
              name: 'User Analytics Stream',
              description: 'Real-time user behavior analytics',
              source_type: 'api',
              destination_type: 'database',
              status: 'active',
              data_format: 'json',
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-15T10:30:00Z',
              total_records_processed: 15234,
              attributes: [
                {
                  id: 'a1',
                  attribute_name: 'user_id',
                  attribute_type: 'string',
                  is_required: true,
                  is_included: true,
                  position: 0,
                },
                {
                  id: 'a2',
                  attribute_name: 'event_type',
                  attribute_type: 'string',
                  is_required: true,
                  is_included: true,
                  position: 1,
                },
                {
                  id: 'a3',
                  attribute_name: 'timestamp',
                  attribute_type: 'date',
                  is_required: true,
                  is_included: true,
                  position: 2,
                },
              ],
            },
            {
              id: '2',
              name: 'SEO Metrics Stream',
              description: 'SEO performance metrics aggregation',
              source_type: 'api',
              destination_type: 'stream',
              status: 'active',
              data_format: 'json',
              created_at: '2025-01-05T00:00:00Z',
              updated_at: '2025-01-16T08:15:00Z',
              total_records_processed: 8456,
              attributes: [
                {
                  id: 'b1',
                  attribute_name: 'url',
                  attribute_type: 'string',
                  is_required: true,
                  is_included: true,
                  position: 0,
                },
                {
                  id: 'b2',
                  attribute_name: 'title',
                  attribute_type: 'string',
                  is_required: true,
                  is_included: true,
                  position: 1,
                },
                {
                  id: 'b3',
                  attribute_name: 'meta_description',
                  attribute_type: 'string',
                  is_required: false,
                  is_included: true,
                  position: 2,
                },
                {
                  id: 'b4',
                  attribute_name: 'keywords',
                  attribute_type: 'object',
                  is_required: false,
                  is_included: true,
                  position: 3,
                },
              ],
            },
            {
              id: '3',
              name: 'Product Catalog Sync',
              description: 'Synchronize product catalog across systems',
              source_type: 'database',
              destination_type: 'api',
              status: 'inactive',
              data_format: 'json',
              created_at: '2024-12-20T00:00:00Z',
              updated_at: '2025-01-10T14:00:00Z',
              total_records_processed: 3421,
              attributes: [
                {
                  id: 'c1',
                  attribute_name: 'product_id',
                  attribute_type: 'string',
                  is_required: true,
                  is_included: true,
                  position: 0,
                },
                {
                  id: 'c2',
                  attribute_name: 'name',
                  attribute_type: 'string',
                  is_required: true,
                  is_included: true,
                  position: 1,
                },
                {
                  id: 'c3',
                  attribute_name: 'price',
                  attribute_type: 'number',
                  is_required: true,
                  is_included: true,
                  position: 2,
                },
                {
                  id: 'c4',
                  attribute_name: 'inventory',
                  attribute_type: 'number',
                  is_required: false,
                  is_included: false,
                  position: 3,
                },
              ],
            },
          ],
          pagination: {
            page: 1,
            limit: 50,
            total: 3,
            pages: 1,
          },
        },
      },
    ],
  },
};
