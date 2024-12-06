import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Quiz } from '../types';

export function Home() {
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveQuizzes() {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setActiveQuizzes(data || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveQuizzes();

    const subscription = supabase
      .channel('public:quizzes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quizzes',
        },
        () => {
          fetchActiveQuizzes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Active Quizzes</h1>
      {activeQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active quizzes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Wait for a quiz master to start a new quiz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
              {quiz.description && (
                <p className="text-gray-600 mb-4">{quiz.description}</p>
              )}
              <Link
                to={`/play/${quiz.id}`}
                className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
              >
                <Play className="h-5 w-5" />
                <span>Join Quiz</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}