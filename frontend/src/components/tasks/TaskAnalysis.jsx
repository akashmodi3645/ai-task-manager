import { useState } from 'react';
import { FiClock, FiTrendingUp, FiZap, FiAlertCircle } from 'react-icons/fi';

const TaskAnalysis = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }

  if (!analysis) return null;

  const difficultyColors = {
    'Easy': 'text-green-600 bg-green-100',
    'Medium': 'text-yellow-600 bg-yellow-100',
    'Hard': 'text-red-600 bg-red-100'
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        🤖 AI Analysis
      </h3>

      {/* Time Estimate */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <FiClock className="text-blue-600" />
          <h4 className="font-semibold text-gray-700">Time Estimate</h4>
        </div>
        <p className="text-2xl font-bold text-blue-600">{analysis.timeEstimate}</p>
        
        {analysis.timeBreakdown && (
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>📝 Preparation: {analysis.timeBreakdown.preparation}</p>
            <p>⚡ Execution: {analysis.timeBreakdown.execution}</p>
            <p>✅ Review: {analysis.timeBreakdown.review}</p>
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <FiTrendingUp className="text-purple-600" />
          <h4 className="font-semibold text-gray-700">Difficulty Level</h4>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full font-semibold ${difficultyColors[analysis.difficulty]}`}>
          {analysis.difficulty}
        </span>
        {analysis.difficultyReason && (
          <p className="mt-2 text-sm text-gray-600">{analysis.difficultyReason}</p>
        )}
      </div>

      {/* Steps */}
      {analysis.steps && analysis.steps.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            📋 Step-by-Step Guide
          </h4>
          <ol className="space-y-2">
            {analysis.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Prerequisites */}
      {analysis.prerequisites && analysis.prerequisites.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-2">📦 What You Need</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            {analysis.prerequisites.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Best Time */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <FiZap className="text-orange-600" />
          <h4 className="font-semibold text-gray-700">Best Time to Work</h4>
        </div>
        <p className="text-gray-700">{analysis.bestTime}</p>
        {analysis.focusRequired && (
          <p className="mt-2 text-sm text-gray-600">
            Focus Required: <span className="font-semibold">{analysis.focusRequired}</span>
          </p>
        )}
      </div>

      {/* Tips */}
      {analysis.tips && analysis.tips.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-2">💡 Pro Tips</h4>
          <ul className="space-y-2">
            {analysis.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Potential Blockers */}
      {analysis.potentialBlockers && analysis.potentialBlockers.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertCircle className="text-red-600" />
            <h4 className="font-semibold text-gray-700">Potential Obstacles</h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            {analysis.potentialBlockers.map((blocker, idx) => (
              <li key={idx}>{blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Motivation */}
      {analysis.motivation && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
          <p className="font-medium text-center">💪 {analysis.motivation}</p>
        </div>
      )}
    </div>
  );
};

export default TaskAnalysis;
