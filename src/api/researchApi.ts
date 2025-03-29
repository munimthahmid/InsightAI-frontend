import axios from "axios";

const API_URL = "/api/v1";

export interface ResearchRequest {
  query: string;
  max_results_per_source?: number;
}

export interface ResearchResponse {
  query: string;
  report: string;
  sources: Record<string, number>;
  metadata?: Record<string, any>;
}

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
