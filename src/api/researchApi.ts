import axios from "axios";

// Default to localhost if environment variable not set
const API_URL = "https://insightai-backend-urvq.onrender.com/api/v1";

// Basic Research Interfaces
export interface ResearchRequest {
  query: string;
  max_results_per_source?: number;
  save_history?: boolean;
}

export interface Citation {
  chunk_id: string;
  source_type: string;
  title: string;
  url?: string;
  text: string;
  additional_info: Record<string, any>;
}

export interface ResearchResponse {
  query: string;
  report: string;
  sources: Record<string, number>;
  research_id?: string;
  metadata?: {
    processing_time?: {
      fetch_time: number;
      process_time: number;
      query_time: number;
      report_time: number;
      total_time: number;
    };
    template?: {
      id: string;
      name: string;
      domain: string;
    };
    session_id?: string;
  };
  citations?: Record<string, Citation>;
  contradictions?: Record<
    string,
    Array<{
      statement: string;
      source_type: string;
      source_title: string;
      chunk_id: string;
    }>
  >;
}

// Research History Interfaces
export interface ResearchHistoryItem {
  research_id: string;
  query: string;
  saved_at: string;
  metadata?: Record<string, any>;
  sources: Record<string, number>;
}

export interface ResearchHistoryResponse {
  items: ResearchHistoryItem[];
  total: number;
}

// Template Interfaces
export interface TemplateResponse {
  template_id: string;
  name: string;
  description: string;
  domain: string;
  structure: string[];
  default_sources: string[];
}

export interface TemplateListResponse {
  templates: TemplateResponse[];
  count: number;
}

export interface ResearchWithTemplateRequest {
  query: string;
  template_id: string;
  max_results_per_source?: number;
  save_history?: boolean;
}

// Literature Review Interfaces
export interface LiteratureReviewRequest {
  research_id: string;
  format_type?: "APA" | "MLA" | "Chicago" | "IEEE";
  section_format?: "chronological" | "thematic" | "methodological";
  max_length?: number;
}

export interface LiteratureReviewResponse {
  research_id: string;
  literature_review: string;
  format: Record<string, string>;
  generated_at: string;
}

// Comparison Interfaces
export interface ComparisonRequest {
  research_ids: string[];
  comparison_aspects?: string[];
  include_visualization?: boolean;
}

export interface ComparisonResponse {
  topics: string[];
  research_ids: string[];
  comparison_aspects: string[];
  comparison_result: string;
  generated_at: string;
}

// Research API Functions
export const conductResearch = async (
  data: ResearchRequest
): Promise<ResearchResponse> => {
  try {
    const response = await axios.post<ResearchResponse>(
      `${API_URL}/research`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error conducting research:", error);
    throw error;
  }
};

export const conductSlackResearch = async (
  data: ResearchRequest & { channel: string }
): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/research/slack`, data);
    return response.data;
  } catch (error) {
    console.error("Error conducting slack research:", error);
    throw error;
  }
};

// Template API Functions
export const getTemplates = async (
  domain?: string
): Promise<TemplateListResponse> => {
  try {
    const params = domain ? { domain } : {};
    const response = await axios.get<TemplateListResponse>(
      `${API_URL}/research/templates`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};

export const getTemplateById = async (
  templateId: string
): Promise<TemplateResponse> => {
  try {
    const response = await axios.get<TemplateResponse>(
      `${API_URL}/research/templates/${templateId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching template ${templateId}:`, error);
    throw error;
  }
};

export const researchWithTemplate = async (
  data: ResearchWithTemplateRequest
): Promise<ResearchResponse> => {
  try {
    const response = await axios.post<ResearchResponse>(
      `${API_URL}/research/template`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error conducting templated research:", error);
    throw error;
  }
};

// Research History API Functions
export const getResearchHistory = async (
  limit?: number
): Promise<ResearchHistoryResponse> => {
  try {
    const params = limit ? { limit } : {};
    const response = await axios.get<ResearchHistoryResponse>(
      `${API_URL}/research/history`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching research history:", error);
    throw error;
  }
};

export const getResearchById = async (
  researchId: string
): Promise<ResearchResponse> => {
  try {
    const response = await axios.get<ResearchResponse>(
      `${API_URL}/research/history/${researchId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching research ${researchId}:`, error);
    throw error;
  }
};

export const deleteResearchById = async (
  researchId: string
): Promise<boolean> => {
  try {
    const response = await axios.delete<{ success: boolean }>(
      `${API_URL}/research/history/${researchId}`
    );
    return response.data.success;
  } catch (error) {
    console.error(`Error deleting research ${researchId}:`, error);
    throw error;
  }
};

// Literature Review API Functions
export const generateLiteratureReview = async (
  data: LiteratureReviewRequest
): Promise<LiteratureReviewResponse> => {
  try {
    const response = await axios.post<LiteratureReviewResponse>(
      `${API_URL}/research/literature-review`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error generating literature review:", error);
    throw error;
  }
};

// Comparison API Functions
export const compareResearch = async (
  data: ComparisonRequest
): Promise<ComparisonResponse> => {
  try {
    const response = await axios.post<ComparisonResponse>(
      `${API_URL}/research/compare`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error comparing research:", error);
    throw error;
  }
};
