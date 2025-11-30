export interface RadixComponentDescriptor {
  name: string;
  slug: string;
  category: string;
  docUrl: string;
  radixPackage: string;
  tags: string[];
  topic: string;
  status: 'seeded' | 'pending' | 'deprecated';
  lastUpdated: string;
}
