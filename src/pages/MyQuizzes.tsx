import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Quiz } from '../types';

export function MyQuizzes() {
  const { user } = useAuthStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchMyQuizzes() {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMyQuizzes();
  }, [user]);

  const toggleQuizStatus = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: !quiz.is_active })
        .eq('id', quiz.id);

      if (error) throw error;

      setQuizzes(
        quizzes.map((q) =>
          q.id === quiz.id ? { ...q, is_active: !q.is_active } : q
        )
      );
    } catch (error) {
      console.error('Error updating quiz status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <Link
          to="/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first quiz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{quiz.title}</h2>
                <button
                  onClick={() => toggleQuizStatus(quiz)}
                  className={`p-2 rounded-full ${
                    quiz.is_active
                      ? 'text-green-600 hover:text-green-800'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {quiz.is_active ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </button>
              </div>
              {quiz.description && (
                <p className="text-gray-600 mb-4">{quiz.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    quiz.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {quiz.is_active ? 'Active' : 'Inactive'}
                </span>
                <Link
                  to={`/play/${quiz.id}`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  View Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}