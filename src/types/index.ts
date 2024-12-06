export interface Quiz {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  user_id: string;
  is_active: boolean;
}

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_option: number;
  points: number;
}

export interface GameSession {
  id: string;
  quiz_id: string;
  created_at: string;
  ended_at: string | null;
  current_question_index: number;
}

export interface PlayerScore {
  id: string;
  session_id: string;
  player_name: string;
  score: number;
  created_at: string;
}