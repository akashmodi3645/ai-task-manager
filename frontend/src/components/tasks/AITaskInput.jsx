import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../../services/api';
import { useTasks } from '../../hooks/useTasks';
import toast from 'react-hot-toast';
import { FiZap, FiLoader, FiTarget, FiX } from 'react-icons/fi';

const AITaskInput = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef(null);
  const { fetchTasks } = useTasks();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (input.trim().length >= 3) {
      debounceTimeout.current = setTimeout(() => {
        generateSuggestions(input);
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [input]);

  // ✅ Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateSuggestions = (text) => {
    const lower = text.toLowerCase();
    const suggestions = [];

    if (lower.includes('study') || lower.includes('learn') || lower.includes('read')) {
      suggestions.push({
        text: `${text} - Complete by tomorrow evening`,
        priority: 'Medium',
        category: 'Study',
        icon: '📚',
        time: '2 hours'
      });
      suggestions.push({
        text: `${text} and make notes`,
        priority: 'High',
        category: 'Study',
        icon: '📝',
        time: '1.5 hours'
      });
    } else if (lower.includes('assignment') || lower.includes('homework')) {
      suggestions.push({
        text: `${text} - Due this Friday`,
        priority: 'High',
        category: 'Study',
        icon: '📋',
        time: '3 hours'
      });
      suggestions.push({
        text: `${text} - Start research and outline`,
        priority: 'Medium',
        category: 'Study',
        icon: '🔍',
        time: '1 hour'
      });
    } else if (lower.includes('code') || lower.includes('program') || lower.includes('develop')) {
      suggestions.push({
        text: `${text} - Complete implementation`,
        priority: 'High',
        category: 'Work',
        icon: '💻',
        time: '3-4 hours'
      });
      suggestions.push({
        text: `${text} - Write tests and documentation`,
        priority: 'Medium',
        category: 'Work',
        icon: '🧪',
        time: '2 hours'
      });
    } else if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym')) {
      suggestions.push({
        text: `${text} - Morning session 30 mins`,
        priority: 'Medium',
        category: 'Health',
        icon: '💪',
        time: '30 min'
      });
      suggestions.push({
        text: `${text} - Evening cardio routine`,
        priority: 'Low',
        category: 'Health',
        icon: '🏃',
        time: '45 min'
      });
    } else if (lower.includes('meeting') || lower.includes('call')) {
      suggestions.push({
        text: `${text} - Prepare agenda beforehand`,
        priority: 'High',
        category: 'Work',
        icon: '📅',
        time: '1 hour'
      });
      suggestions.push({
        text: `${text} - Send follow-up email after`,
        priority: 'Medium',
        category: 'Work',
        icon: '✉️',
        time: '30 min'
      });
    } else if (lower.includes('shop') || lower.includes('buy')) {
      suggestions.push({
        text: `${text} - Make shopping list first`,
        priority: 'Low',
        category: 'Shopping',
        icon: '🛒',
        time: '1 hour'
      });
    } else {
      suggestions.push({
        text: `${text} - Complete today`,
        priority: 'Medium',
        category: 'Personal',
        icon: '✅',
        time: '1 hour'
      });
      suggestions.push({
        text: `${text} - High priority`,
        priority: 'High',
        category: 'Personal',
        icon: '⚡',
        time: '2 hours'
      });
    }

    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('now')) {
      suggestions.unshift({
        text: `${text} - URGENT: Complete immediately`,
        priority: 'Urgent',
        category: detectCategory(text),
        icon: '🔴',
        time: 'ASAP'
      });
    }

    setSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  const detectCategory = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('study') || lower.includes('learn')) return 'Study';
    if (lower.includes('work') || lower.includes('project')) return 'Work';
    if (lower.includes('shop') || lower.includes('buy')) return 'Shopping';
    if (lower.includes('exercise') || lower.includes('health')) return 'Health';
    return 'Personal';
  };

  // ✅ FIXED: Close suggestions after click
  const handleSuggestionClick = (suggestion) => {
    console.log('✅ Clicked:', suggestion.text);
    setInput(suggestion.text);
    
    // ✅ Close suggestions immediately
    setShowSuggestions(false);
    setSuggestions([]);
    
    // ✅ Show success toast
    toast.success('Task details filled! 📝', {
      duration: 2000,
      icon: '✨'
    });
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setShowSuggestions(false);
    setSuggestions([]); // ✅ Clear suggestions on submit
    
    try {
      const { data } = await aiAPI.parseTask(input);
      console.log('✅ Task created:', data);
      
      setInput('');
      await fetchTasks();
      
      toast.success(data.message || `Created ${data.tasks?.length || 1} task(s)!`, {
        duration: 4000,
        icon: '🎉'
      });
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Close suggestions manually
  const closeSuggestions = () => {
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const examples = [
    "Complete DBMS assignment by Friday evening",
    "Morning workout 30 mins and healthy breakfast",
    "Study React hooks and build practice project"
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <FiZap className="text-white text-xl animate-pulse" />
          <h3 className="text-white font-semibold text-lg">✨ AI Task Creator</h3>
        </div>
        
        <div className="relative" ref={suggestionsRef}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => input.length >= 3 && setShowSuggestions(suggestions.length > 0)}
            placeholder="Start typing your task... AI will suggest as you type! 🤖"
            className="w-full p-4 rounded-lg border-0 focus:ring-2 focus:ring-white resize-none text-gray-800"
            rows="3"
            disabled={loading}
          />

          {/* ✅ FIXED SUGGESTIONS DROPDOWN */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border-2 border-purple-200 max-h-80 overflow-y-auto"
              style={{ zIndex: 9999 }}
            >
              {/* ✅ Header with close button */}
              <div className="p-3 bg-purple-50 border-b border-purple-200 sticky top-0 flex items-center justify-between">
                <p className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                  <FiZap className="text-purple-600" />
                  AI Suggestions - Click to use
                </p>
                {/* ✅ Close button */}
                <button
                  type="button"
                  onClick={closeSuggestions}
                  className="p-1 hover:bg-purple-200 rounded-lg transition-colors"
                  title="Close suggestions"
                >
                  <FiX className="w-4 h-4 text-purple-600" />
                </button>
              </div>
              
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-4 hover:bg-purple-50 active:bg-purple-100 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{suggestion.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium break-words">
                        {suggestion.text}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                          suggestion.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          suggestion.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {suggestion.priority}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          📂 {suggestion.category}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          ⏱️ {suggestion.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-white text-purple-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FiZap />
                Create Task
              </>
            )}
          </button>
          
          <span className="text-white text-sm opacity-80">
            {input.length}/500 {input.length >= 3 && '• AI active 🤖'}
          </span>
        </div>
      </form>

      {/* Example Prompts */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <FiTarget className="text-purple-600" />
          Try these examples:
        </p>
        <div className="space-y-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setInput(example)}
              className="w-full text-left text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-2 rounded transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITaskInput;
