import { PRAnalysis } from '@/types/pr';
import { mockPRs } from '@/lib/mockData';

const DELAY = 800; // Simulate network latency

export const prService = {
  /**
   * Fetches all pull requests
   */
  async getAllPRs(): Promise<PRAnalysis[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockPRs]);
      }, DELAY);
    });
  },

  /**
   * Fetches a single PR analysis by ID
   */
  async getPRById(id: string): Promise<PRAnalysis | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pr = mockPRs.find((p) => p.id === id);
        resolve(pr ? { ...pr } : null);
      }, DELAY);
    });
  },

  /**
   * Simulates triggering a new AI analysis
   */
  async analyzePR(id: string): Promise<PRAnalysis | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pr = mockPRs.find((p) => p.id === id);
        // In a real scenario, this would trigger a background job
        resolve(pr ? { ...pr } : null);
      }, 2000); // Longer delay for "AI Analysis"
    });
  },
};
