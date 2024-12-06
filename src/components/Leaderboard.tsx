import React from 'react';
import { Trophy } from 'lucide-react';
import type { PlayerScore } from '../types';

interface LeaderboardProps {
  players: PlayerScore[];
}

export function Leaderboard({ players }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xl font-semibold">Leaderboard</h2>
      </div>
      
      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <span className={`font-semibold ${index === 0 ? 'text-yellow-500' : 'text-gray-600'}`}>
                #{index + 1}
              </span>
              <span className="font-medium">{player.player_name}</span>
            </div>
            <span className="font-semibold text-indigo-600">{player.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}