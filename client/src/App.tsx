import { useState, useEffect } from 'react';
import CollaborativeEditor from './components/CollaborativeEditor';
import UserModal from './components/UserModal';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    try {
      const storedUser = localStorage.getItem('collab-editor-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUserSubmit = (username: string, color: string) => {
    const newUser: User = {
      id: '',
      username,
      color
    };
    setUser(newUser);
    try {
      localStorage.setItem('collab-editor-user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Error saving user:', error);
    }
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" style={{ minHeight: '100vh' }}>
        {showModal && (
          <UserModal onSubmit={handleUserSubmit} />
        )}
        {user && !showModal && (
          <CollaborativeEditor user={user} />
        )}
        {!user && !showModal && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-gray-600">Please enter your name to continue</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Open Modal
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
