import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  Send, 
  Sparkles, 
  Code, 
  Bug, 
  Lightbulb, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  currentFile?: string;
  selectedCode?: string;
  onCodeInsert: (code: string) => void;
  className?: string;
}

export const AIAssistant = ({ currentFile, selectedCode, onCodeInsert, className }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you with:\n\n• Code explanations\n• Bug fixes\n• Feature implementations\n• Code refactoring\n• Best practices\n\nWhat would you like to work on?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(inputValue, currentFile, selectedCode),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query: string, file?: string, code?: string): string => {
    // This is a mock response. In a real implementation, you'd call an AI API
    const responses = [
      `I can help you with that! Based on your question about "${query}", here are some suggestions:\n\n\`\`\`javascript\n// Example code solution\nfunction example() {\n  return "This is a sample response";\n}\n\`\`\`\n\nWould you like me to explain this further or help with something else?`,
      
      `Great question! For the file ${file || 'your current file'}, I recommend:\n\n1. **Code Structure**: Consider breaking this into smaller functions\n2. **Performance**: This could be optimized using memoization\n3. **Best Practices**: Add proper error handling\n\nWould you like me to show you a specific implementation?`,
      
      `I see you're working on "${query}". Here's how I would approach this:\n\n\`\`\`typescript\n// Improved version\nconst solution = async () => {\n  try {\n    // Your implementation here\n    return result;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n};\n\`\`\`\n\nThis approach provides better error handling and type safety.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickAction = (action: string) => {
    const actions: Record<string, string> = {
      explain: `Explain this code: ${selectedCode || 'the current file'}`,
      refactor: `Refactor this code to make it more efficient: ${selectedCode || 'the current function'}`,
      debug: `Help me debug this code: ${selectedCode || 'find issues in the current file'}`,
      optimize: `Optimize this code for better performance: ${selectedCode || 'the current implementation'}`,
      test: `Write unit tests for: ${selectedCode || 'the current function'}`,
      document: `Add documentation for: ${selectedCode || 'this code'}`
    };

    setInputValue(actions[action] || action);
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const extractCodeFromMessage = (content: string): string | null => {
    const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : null;
  };

  return (
    <div className={`flex flex-col h-full bg-muted/30 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {currentFile ? `Working on: ${currentFile.split('/').pop()}` : 'Ready to help you code'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs"
            onClick={() => handleQuickAction('explain')}
          >
            <Code className="h-3 w-3 mr-1" />
            Explain
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs"
            onClick={() => handleQuickAction('debug')}
          >
            <Bug className="h-3 w-3 mr-1" />
            Debug
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs"
            onClick={() => handleQuickAction('refactor')}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refactor
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start text-xs"
            onClick={() => handleQuickAction('optimize')}
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[85%] p-3 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {message.type === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => copyToClipboard(message.content, message.id)}
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    
                    {extractCodeFromMessage(message.content) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          const code = extractCodeFromMessage(message.content);
                          if (code) onCodeInsert(code);
                        }}
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Insert
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-background p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  AI is thinking...
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Ask AI anything about your code..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedCode && (
          <div className="text-xs text-muted-foreground mt-1">
            Selected: {selectedCode.substring(0, 50)}...
          </div>
        )}
      </div>
    </div>
  );
};