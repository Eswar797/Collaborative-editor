import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, CursorPosition } from '../types';
import UserList from './UserList';
import { FiUsers, FiSave, FiCopy } from 'react-icons/fi';

interface CollaborativeEditorProps {
  user: User;
}

export default function CollaborativeEditor({ user }: CollaborativeEditorProps) {
  const [content, setContent] = useState('');
  const [version, setVersion] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [cursorPositions, setCursorPositions] = useState<Map<string, CursorPosition>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [showUsers, setShowUsers] = useState(true);
  const [socketId, setSocketId] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<Map<string, { username: string; color: string }>>(new Map());
  
  const socketRef = useRef<Socket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastChangeRef = useRef<string>('');
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalChangeRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    // Connect to server
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketId(socket.id);
      socket.emit('join-document', {
        documentId: 'default',
        username: user.username,
        color: user.color
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setIsConnected(false);
      // Auto-reconnect is handled by socket.io
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      // Rejoin document after reconnection
      socket.emit('join-document', {
        documentId: 'default',
        username: user.username,
        color: user.color
      });
    });

    socket.on('reconnect_attempt', () => {
      console.log('Attempting to reconnect...');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    socket.on('document-state', ({ content: docContent, version: docVersion }) => {
      if (!isLocalChangeRef.current) {
        setContent(docContent);
        setVersion(docVersion);
        lastChangeRef.current = docContent;
      }
    });

    socket.on('text-change', ({ changes, version: newVersion, userId }) => {
      if (userId !== socket.id && !isLocalChangeRef.current) {
        setContent(changes.content);
        setVersion(newVersion);
        lastChangeRef.current = changes.content;
      }
    });

    socket.on('users-updated', (users: User[]) => {
      setConnectedUsers(users);
    });

    socket.on('cursor-change', ({ userId, username, color, cursor }) => {
      if (userId !== socket.id && cursor !== null) {
        setCursorPositions(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, {
            userId,
            username,
            color,
            position: cursor.position
          });
          return newMap;
        });
      }
    });

    socket.on('user-left', ({ userId }) => {
      setCursorPositions(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    });

    // Typing indicators
    socket.on('user-typing', ({ userId, username, color }) => {
      if (userId !== socket.id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, { username, color });
          return newMap;
        });
      }
    });

    socket.on('user-stopped-typing', ({ userId }) => {
      if (userId !== socket.id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    isLocalChangeRef.current = true;

    // Emit typing start
    if (!isTypingRef.current && socketRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit('typing-start', {
        documentId: 'default'
      });
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing stop timeout (after 2 seconds of no typing)
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && isTypingRef.current) {
        isTypingRef.current = false;
        socketRef.current.emit('typing-stop', {
          documentId: 'default'
        });
      }
    }, 2000);

    // Debounce changes
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    changeTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && newContent !== lastChangeRef.current) {
        socketRef.current.emit('text-change', {
          documentId: 'default',
          changes: { content: newContent },
          version
        });
        lastChangeRef.current = newContent;
        setVersion(prev => prev + 1);
      }
      isLocalChangeRef.current = false;
    }, 100);
  }, [version]);

  const handleCursorChange = useCallback(() => {
    if (textareaRef.current && socketRef.current) {
      const position = textareaRef.current.selectionStart;
      socketRef.current.emit('cursor-change', {
        documentId: 'default',
        cursor: { position }
      });
    }
  }, []);

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Collaborative Editor
              </h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUsers(!showUsers)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiUsers />
                <span className="hidden sm:inline">{connectedUsers.length} users</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <FiCopy />
                <span className="hidden sm:inline">Copy</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors"
              >
                <FiSave />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">Document</h2>
                  <div className="flex items-center gap-4">
                    {/* Typing Indicators - Stamp Style */}
                    {typingUsers.size > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                        <div className="flex -space-x-2">
                          {Array.from(typingUsers.values()).slice(0, 3).map((user, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
                              style={{ backgroundColor: user.color }}
                              title={user.username}
                            >
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-700">
                            {typingUsers.size === 1
                              ? `${Array.from(typingUsers.values())[0].username} is typing`
                              : typingUsers.size === 2
                              ? `${Array.from(typingUsers.values())[0].username} and ${Array.from(typingUsers.values())[1].username} are typing`
                              : `${Array.from(typingUsers.values())[0].username} and ${typingUsers.size - 1} others are typing`}
                          </span>
                          <span className="flex gap-0.5">
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                        </div>
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      {content.length} characters • {content.split('\n').length} lines
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 relative overflow-auto scrollbar-thin">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  onSelect={handleCursorChange}
                  onClick={handleCursorChange}
                  onKeyUp={handleCursorChange}
                  placeholder="Start typing... Your changes will be synced in real-time with other users!"
                  className="w-full h-full p-6 text-gray-800 placeholder-gray-400 resize-none outline-none font-mono text-sm leading-relaxed"
                  style={{ 
                    caretColor: user.color,
                    minHeight: '100%'
                  }}
                />
                
                {/* Cursor indicators - Note: This is a simplified visualization */}
                {Array.from(cursorPositions.values()).map((cursor) => (
                  <div
                    key={cursor.userId}
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: '0px',
                      top: '0px',
                    }}
                  >
                    <div
                      className="px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
                      style={{ backgroundColor: cursor.color }}
                    >
                      {cursor.username} • Position: {cursor.position}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Sidebar */}
        {showUsers && (
          <div className="w-64 border-l border-gray-200 bg-white/50 backdrop-blur-sm">
            <UserList users={connectedUsers} currentUser={user} currentSocketId={socketId} />
          </div>
        )}
      </div>
    </div>
  );
}

