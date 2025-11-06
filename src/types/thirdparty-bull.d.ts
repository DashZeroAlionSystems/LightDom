declare module 'bull' {
  // Minimal bull queue stub used in the repo to reduce type noise.
  export interface Queue<T = any> {
    getWaiting(): Promise<any[]>;
    getActive(): Promise<any[]>;
    getCompleted(): Promise<any[]>;
    getFailed(): Promise<any[]>;
  }

  const Bull: {
    Queue?: new <T = any>(name: string, opts?: any) => Queue<T>;
    default?: any;
  };

  export default Bull;
}
