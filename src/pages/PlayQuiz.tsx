import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useGameSession } from '../hooks/useGameSession';
import { Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function PlayQuiz() {
  const { id } = useParams<{ id: string }>();
  const { quiz, questions, loading: quizLoading } = useQuiz(id!);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    try {
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert([
          {
            quiz_id: quiz.id,
            current_question_index: 0,
          },
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      await supabase.from('player_scores').insert([
        {
          session_id: session.id,
          player_name: playerName,
          score: 0,
        },
      ]);

      setGameStarted(true);
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const handleAnswer = async (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correct_option;
    const points = isCorrect ? currentQuestion.points : 0;

    setScore((prev) => prev + points);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        setShowResults(true);
      }
    }, 2000);
  };

  if (quizLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Quiz not found</h2>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">{quiz.title}</h1>
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enter your name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Join Game
          </button>
        </form>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-md mx-auto text-center">
        <Trophy className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
        <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
        <p className="text-xl mb-8">Your score: {score} points</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Play Again
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Question {currentQuestionIndex + 1}</h2>
          <span className="text-lg">Score: {score}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl mb-6">{currentQuestion.question}</h3>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedOption !== null}
              className={`w-full p-4 text-left rounded-lg border ${
                selectedOption === null
                  ? 'hover:bg-gray-50'
                  : selectedOption === index
                  ? index === currentQuestion.correct_option
                    ? 'bg-green-100 border-green-500'
                    : 'bg-red-100 border-red-500'
                  : index === currentQuestion.correct_option
                  ? 'bg-green-100 border-green-500'
                  : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}