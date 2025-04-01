import axios from "axios";

// Default to localhost if environment variable not set
const API_URL = "https://insightai-backend-urvq.onrender.com/api/v1";
// const API_URL = "http://localhost:8000/api/v1";

// Basic Research Interfaces
export interface ResearchRequest {
  query: string;
  sources?: string[];
  max_results_per_source?: number;
  save_history?: boolean;
  research_id?: string; // Optional research ID
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
  research_id: string;
  sources_used?: string[];
  result_count?: number;
  timestamp?: number;
  template_id?: string;
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
      tags?: string[];
    };
    session_id?: string;
    sources?: Record<string, number>;
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

// Research Status Interface
export interface ResearchStatus {
  research_id: string;
  query: string;
  status: string; // started, data_collected, documents_processed, etc.
  start_time: number;
  end_time?: number;
  raw_data_count?: number;
  processed_docs_count?: number;
  error?: string;
}

// Research History Interfaces
export interface ResearchHistoryItem {
  research_id: string;
  query: string;
  saved_at: string;
  timestamp: number;
  sources_used: string[];
  result_count: number;
  template_id?: string;
  metadata?: Record<string, any>;
}

export interface ResearchHistoryResponse {
  items: ResearchHistoryItem[];
  total: number;
}

// Template Interfaces
export interface TemplateSectionSchema {
  section: string;
  description: string;
  required?: boolean;
}

export interface TemplateResponse {
  id: string; // Using id as in the backend model
  name: string;
  description: string;
  prompt_template: string;
  report_structure: TemplateSectionSchema[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  is_default: boolean;
  tags: string[];
  domain?: string;
  template_id?: string;
  focus_areas?: string[];
}

export interface TemplateListResponse {
  templates: TemplateResponse[];
  count?: number;
}

export interface ResearchWithTemplateRequest {
  query: string;
  template_id: string; // Keep as template_id for the request
  sources?: string[];
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
  original_research_id: string;
  query: string;
  review_type: string;
  format_type: string;
  section_format: string;
  report: string; // Changed from literature_review to report
  literature_review?: string;
  timestamp: number;
  format?: {
    citation_style: string;
  };
}

// Focused Report Interfaces
export interface FocusedReportRequest {
  research_id: string;
  focus_area: string;
  template_id?: string;
}

export interface FocusedReportResponse {
  research_id: string;
  original_research_id: string;
  query: string;
  focus_area: string;
  report: string;
  timestamp: number;
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

export const getResearchStatus = async (
  researchId: string
): Promise<ResearchStatus> => {
  try {
    const response = await axios.get<ResearchStatus>(
      `${API_URL}/research/status/${researchId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching research status ${researchId}:`, error);
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
  tag?: string
): Promise<TemplateListResponse> => {
  try {
    const params = tag ? { tag } : {};
    const response = await axios.get<TemplateListResponse>(
      `${API_URL}/templates`,
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
      `${API_URL}/templates/${templateId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching template ${templateId}:`, error);
    throw error;
  }
};

export const createTemplate = async (
  templateData: Omit<TemplateResponse, "id" | "created_at" | "updated_at">
): Promise<TemplateResponse> => {
  try {
    const response = await axios.post<TemplateResponse>(
      `${API_URL}/templates`,
      templateData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
};

export const updateTemplate = async (
  templateId: string,
  templateData: Partial<TemplateResponse>
): Promise<TemplateResponse> => {
  try {
    const response = await axios.put<TemplateResponse>(
      `${API_URL}/templates/${templateId}`,
      templateData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating template ${templateId}:`, error);
    throw error;
  }
};

export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  try {
    const response = await axios.delete<{ success: boolean }>(
      `${API_URL}/templates/${templateId}`
    );
    return response.data.success;
  } catch (error) {
    console.error(`Error deleting template ${templateId}:`, error);
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

// Focused Report API Functions
export const generateFocusedReport = async (
  data: FocusedReportRequest
): Promise<FocusedReportResponse> => {
  try {
    const response = await axios.post<FocusedReportResponse>(
      `${API_URL}/research/focused-report`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error generating focused report:", error);
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
