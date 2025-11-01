import { useState, useRef } from 'react';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { Upload, FileText, Brain, BookOpen, Lightbulb, Moon, Sun, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  explanation: string;
}

interface QuizResults {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'quiz' | 'notes'>('explanation');
  
  // AI Results
  const [explanation, setExplanation] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [notes, setNotes] = useState('');
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  const [quizResults, setQuizResults] = useState<QuizResults[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openai = createOpenAI({
    baseURL: 'https://api.youware.com/public/v1/ai',
    apiKey: 'sk-YOUWARE'
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setInputText(text);
      };
      reader.readAsText(file);
    }
  };

  const generateExplanation = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    console.log('🚀 Starting explanation generation:', { 
      inputLength: inputText.length,
      scene: 'simple_explanation'
    });

    const config = globalThis.ywConfig?.ai_config?.simple_explanation;
    if (!config) {
      console.error('❌ API Error - Configuration not found: simple_explanation');
      setIsProcessing(false);
      return;
    }

    try {
      const { text } = await generateText({
        model: openai(config.model),
        messages: [
          { role: 'system', content: config.system_prompt },
          { role: 'user', content: `Please explain this educational content clearly and concisely for a student audience:\n\n${inputText}` }
        ],
        temperature: config.temperature,
        maxTokens: config.maxTokens
      });

      console.log('✅ AI API Response:', {
        model: config.model,
        scene: 'simple_explanation',
        outputLength: text.length,
        processingTime: `${Date.now() - startTime}ms`
      });

      // Clean any markdown symbols from explanation
      const cleanText = text
        .replace(/#{1,6}/g, '') // Remove ### headers
        .replace(/\*\*/g, '') // Remove ** bold
        .replace(/\*/g, '') // Remove * italic
        .replace(/\[([^\]]+)\]/g, '$1') // Remove [text] brackets
        .replace(/`([^`]+)`/g, '$1') // Remove `code` backticks
        .trim();
      
      setExplanation(cleanText);
      setActiveTab('explanation');
    } catch (error) {
      console.error('❌ API Error - Explanation generation failed:', {
        model: config.model,
        scene: 'simple_explanation',
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: `${Date.now() - startTime}ms`
      });
      alert('Error generating explanation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const generateQuiz = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    console.log('🚀 Starting quiz generation:', { 
      inputLength: inputText.length,
      scene: 'quiz_generator'
    });

    const config = globalThis.ywConfig?.ai_config?.quiz_generator;
    if (!config) {
      console.error('❌ API Error - Configuration not found: quiz_generator');
      setIsProcessing(false);
      return;
    }

    try {
      const { text } = await generateText({
        model: openai(config.model),
        messages: [
          { role: 'system', content: config.system_prompt },
          { role: 'user', content: `Create multiple-choice questions based on this educational content:\n\n${inputText}` }
        ],
        temperature: config.temperature,
        maxTokens: config.maxTokens
      });

      console.log('✅ AI API Response:', {
        model: config.model,
        scene: 'quiz_generator',
        outputLength: text.length,
        processingTime: `${Date.now() - startTime}ms`
      });

      const quizData = JSON.parse(text);
      // Clean any markdown symbols from quiz data
      const cleanQuizData = {
        ...quizData,
        questions: quizData.questions?.map(q => ({
          ...q,
          explanation: q.explanation
            .replace(/#{1,6}/g, '') // Remove ### headers
            .replace(/\*\*/g, '') // Remove ** bold
            .replace(/\*/g, '') // Remove * italic
            .replace(/\[([^\]]+)\]/g, '$1') // Remove [text] brackets
            .replace(/`([^`]+)`/g, '$1') // Remove `code` backticks
            .trim()
        }))
      };
      
      setQuiz(cleanQuizData.questions || []);
      setQuizAnswers({});
      setQuizResults([]);
      setShowQuizResults(false);
      setActiveTab('quiz');
    } catch (error) {
      console.error('❌ API Error - Quiz generation failed:', {
        model: config.model,
        scene: 'quiz_generator',
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: `${Date.now() - startTime}ms`
      });
      alert('Error generating quiz: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNotes = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    console.log('🚀 Starting notes generation:', { 
      inputLength: inputText.length,
      scene: 'notes_generator'
    });

    const config = globalThis.ywConfig?.ai_config?.notes_generator;
    if (!config) {
      console.error('❌ API Error - Configuration not found: notes_generator');
      setIsProcessing(false);
      return;
    }

    try {
      const { text } = await generateText({
        model: openai(config.model),
        messages: [
          { role: 'system', content: config.system_prompt },
          { role: 'user', content: `Create study notes from this educational content:\n\n${inputText}` }
        ],
        temperature: config.temperature,
        maxTokens: config.maxTokens
      });

      console.log('✅ AI API Response:', {
        model: config.model,
        scene: 'notes_generator',
        outputLength: text.length,
        processingTime: `${Date.now() - startTime}ms`
      });

      // Clean any markdown symbols from notes
      const cleanNotes = text
        .replace(/#{1,6}/g, '') // Remove ### headers
        .replace(/\*\*/g, '') // Remove ** bold
        .replace(/\*/g, '') // Remove * italic
        .replace(/\[([^\]]+)\]/g, '$1') // Remove [text] brackets
        .replace(/`([^`]+)`/g, '$1') // Remove `code` backticks
        .trim();
      
      setNotes(cleanNotes);
      setActiveTab('notes');
    } catch (error) {
      console.error('❌ API Error - Notes generation failed:', {
        model: config.model,
        scene: 'notes_generator',
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: `${Date.now() - startTime}ms`
      });
      alert('Error generating notes: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const submitQuiz = () => {
    const results: QuizResults[] = quiz.map((question, index) => {
      const userAnswer = quizAnswers[index] || '';
      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect: userAnswer === question.correct_answer,
        explanation: question.explanation
      };
    });
    setQuizResults(results);
    setShowQuizResults(true);
  };

  const generateAll = async () => {
    await Promise.all([
      generateExplanation(),
      generateQuiz(),
      generateNotes()
    ]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">AI Study Buddy</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Input Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Your Study Material
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Paste your text or upload a file:</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your homework, notes, or any text here..."
                className={`w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Upload File</span>
              </button>
              
              {uploadedFile && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  ✓ {uploadedFile.name}
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={generateExplanation}
                disabled={!inputText.trim() || isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Explain Clearly</span>
              </button>
              
              <button
                onClick={generateQuiz}
                disabled={!inputText.trim() || isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Generate Quiz</span>
              </button>
              
              <button
                onClick={generateNotes}
                disabled={!inputText.trim() || isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Create Notes</span>
              </button>
              
              <button
                onClick={generateAll}
                disabled={!inputText.trim() || isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Brain className="w-4 h-4" />
                <span>Generate All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>AI is working its magic...</span>
          </div>
        )}

        {/* Results Section */}
        {(explanation || quiz.length > 0 || notes) && !isProcessing && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
            <div className="flex space-x-1 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('explanation')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'explanation'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Lightbulb className="w-4 h-4 inline mr-2" />
                Explanation
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'quiz'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Quiz
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Notes
              </button>
            </div>

            {/* Explanation Tab */}
            {activeTab === 'explanation' && explanation && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Clear Explanation
                </h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <p className="whitespace-pre-wrap">{explanation}</p>
                </div>
              </div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && quiz.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                  Practice Quiz
                </h3>
                
                {!showQuizResults ? (
                  <div className="space-y-6">
                    {quiz.map((question, index) => (
                      <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                        <p className="font-medium mb-3">{index + 1}. {question.question}</p>
                        <div className="space-y-2">
                          {Object.entries(question.options).map(([option, text]) => (
                            <label key={option} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={option}
                                checked={quizAnswers[index] === option}
                                onChange={(e) => setQuizAnswers({...quizAnswers, [index]: e.target.value})}
                                className="text-green-600 focus:ring-green-500"
                              />
                              <span>{option}. {text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Quiz
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Quiz Results</h4>
                      <span className="text-lg font-semibold">
                        {quizResults.filter(r => r.isCorrect).length}/{quizResults.length} Correct
                      </span>
                    </div>
                    
                    {quizResults.map((result, index) => (
                      <div key={index} className={`p-4 rounded-lg ${
                        result.isCorrect 
                          ? darkMode ? 'bg-green-900' : 'bg-green-100 border-green-300' 
                          : darkMode ? 'bg-red-900' : 'bg-red-100 border-red-300'
                      } border`}>
                        <div className="flex items-start space-x-2">
                          {result.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium mb-2">{result.question}</p>
                            <p className="text-sm mb-1">
                              Your answer: <span className="font-medium">{result.userAnswer || "Not answered"}</span>
                            </p>
                            {!result.isCorrect && (
                              <p className="text-sm mb-2">
                                Correct answer: <span className="font-medium text-green-600">{result.correctAnswer}</span>
                              </p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-300">{result.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizResults([]);
                        setShowQuizResults(false);
                      }}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Retake Quiz
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Study Notes
                </h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                  <div className="whitespace-pre-wrap">{notes}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
