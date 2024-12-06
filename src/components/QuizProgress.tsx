import React from 'react';
import type { Question } from '../types';

interface QuizProgressProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  timeLeft?: number;
}

export function QuizProgress({ currentQuestionIndex, totalQuestions, score, timeLeft }: QuizProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h2>
          {timeLeft !== undefined && (
            <p className="text-sm text-gray-600">Time left: {timeLeft}s</p>
          )}
        </div>
        <span className="text-lg font-semibold text-indigo-600">Score: {score}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}