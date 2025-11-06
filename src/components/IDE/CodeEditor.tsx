import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import type { FileContent } from '@/services/fileSystemManager';

interface CodeEditorProps {
  file: FileContent | null;
  onContentChange: (path: string, content: string) => void;
  className?: string;
}

export const CodeEditor = ({ file, onContentChange, className }: CodeEditorProps) => {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Configure Monaco Editor
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0a0a',
        'editor.foreground': '#ffffff',
        'editorLineNumber.foreground': '#6b7280',
        'editor.selectionBackground': '#374151',
        'editor.inactiveSelectionBackground': '#1f2937',
        'editorCursor.foreground': '#ffffff',
      }
    });

    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editorLineNumber.foreground': '#6b7280',
        'editor.selectionBackground': '#e5e7eb',
        'editor.inactiveSelectionBackground': '#f3f4f6',
        'editorCursor.foreground': '#000000',
      }
    });

    // Set theme based on current theme
    monaco.editor.setTheme(theme === 'dark' ? 'custom-dark' : 'custom-light');

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showIssues: true,
        showUsers: true
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (file) {
        onContentChange(file.path, editor.getValue());
      }
    });

    // Add AI assistance shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      // Trigger AI assistance
      console.log('AI assistance triggered');
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (file && value !== undefined) {
      onContentChange(file.path, value);
    }
  };

  // Update theme when it changes
  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      const monaco = (window as any).monaco;
      if (monaco) {
        monaco.editor.setTheme(theme === 'dark' ? 'custom-dark' : 'custom-light');
      }
    }
  }, [theme, isEditorReady]);

  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted/30 ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">No File Selected</h3>
          <p className="text-sm">Select a file from the file tree to start coding</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <Editor
        height="100%"
        language={file.language}
        value={file.content}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
        options={{
          readOnly: false,
          domReadOnly: false,
          selectOnLineNumbers: true,
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined',
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          renderWhitespace: 'selection',
          renderControlCharacters: false,
          renderLineHighlight: 'line',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          }
        }}
      />
    </div>
  );
};