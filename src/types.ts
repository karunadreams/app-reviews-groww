export interface RawReview {
  rating: number;
  title: string;
  text: string;
  date: Date;
  appVersion?: string;
}

export interface Config {
  groqApiKey: string;
  mcpServerUrl: string;
  targetDocId: string;
  targetEmail: string;
}
