
export enum AgentStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface RawProduct {
  id: string;
  name: string;
  category: string;
  features: string[];
  specs: Record<string, string>;
  price: number;
  safetyInfo: string[];
  usageInstructions: string[];
}

export interface ParsedProduct extends RawProduct {
  lastUpdated: string;
  isSanitized: boolean;
}

export interface Question {
  id: string;
  category: 'Informational' | 'Usage' | 'Safety' | 'Purchase' | 'Comparison';
  text: string;
  answer?: string;
}

export interface ContentBlock {
  type: string;
  content: any;
}

export interface PageObject {
  title: string;
  templateId: string;
  sections: ContentBlock[];
  metadata: {
    generatedAt: string;
    agentId: string;
  };
}

export interface PipelineState {
  currentStep: number;
  logs: string[];
  agentStatuses: Record<string, AgentStatus>;
  data: {
    product?: ParsedProduct;
    questions?: Question[];
    blocks?: Record<string, ContentBlock>;
    pages?: Record<string, PageObject>;
  };
}
