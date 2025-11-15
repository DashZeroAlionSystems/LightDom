export type QueryablePool = {
  query: (
    queryText: string,
    values?: any[]
  ) => Promise<{
    rows: any[];
    rowCount?: number;
  }>;
};
