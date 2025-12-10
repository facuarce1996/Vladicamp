export interface Question {
  id: number;
  text: string;
  type?: 'select' | 'text';
}

export type Candidate = string;

export interface VoteState {
  [questionId: number]: Candidate;
}

export interface AnalysisResponse {
  markdown: string;
}

export interface Submission {
  email: string;
  timestamp: string;
  votes: VoteState;
}