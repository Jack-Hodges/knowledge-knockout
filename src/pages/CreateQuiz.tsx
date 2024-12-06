import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface QuestionForm {
  question: string;
  options: string[];
  correct_option: number;
  points: number;
}

export function CreateQuiz() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correct_option: 0,
      points: 100,
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correct_option: 0,
        points: 100,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updatedQuestions = [...questions];
    if (field === 'options') {
      const [optionIndex, optionValue] = value;
      updatedQuestions[index].options[optionIndex] = optionValue;
    } else {
      updatedQuestions[index][field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([
          {
            title,
            description,
            user_id: user.id,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (quizError) throw quizError;

      const { error: questionsError } = await supabase.from('questions').insert(
        questions.map((q) => ({
          quiz_id: quiz.id,
          question: q.question,
          options: q.options,
          correct_option: q.correct_option,
          points: q.points,
        }))
      );

      if (questionsError) throw questionsError;

      navigate('/my-quizzes');
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Question {index + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(index, 'question', e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={question.correct_option === optionIndex}
                        onChange={() =>
                          updateQuestion(index, 'correct_option', optionIndex)
                        }
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          updateQuestion(index, 'options', [
                            optionIndex,
                            e.target.value,
                          ])
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Points
                  </label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(index, 'points', parseInt(e.target.value))
                    }
                    className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
          >
            <Plus className="h-5 w-5" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-5 w-5" />
            <span>Save Quiz</span>
          </button>
        </div>
      </form>
    </div>
  );
}