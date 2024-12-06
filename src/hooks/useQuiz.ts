import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Quiz, Question } from '../types';

export function useQuiz(quizId: string) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();

        if (quizError) throw quizError;

        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('created_at');

        if (questionError) throw questionError;

        setQuiz(quizData);
        setQuestions(questionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  return { quiz, questions, loading, error };
}