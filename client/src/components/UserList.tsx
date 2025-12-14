import { User } from '../types';
import { FiUser } from 'react-icons/fi';

interface UserListProps {
  users: User[];
  currentUser: User;
  currentSocketId: string;
}

interface UserWithCurrent extends User {
  isCurrent?: boolean;
}

export default function UserList({ users, currentUser, currentSocketId }: UserListProps) {
  // Combine all users, ensuring current user is included
  const allUsers: UserWithCurrent[] = users.length > 0 
    ? users.map(u => ({ ...u, isCurrent: u.id === currentSocketId }))
    : [{ ...currentUser, id: currentSocketId, isCurrent: true }];
  
  // If current user is not in the list, add them
  if (!allUsers.some(u => u.isCurrent)) {
    allUsers.push({ ...currentUser, id: currentSocketId, isCurrent: true });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FiUser />
          Active Users ({allUsers.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {allUsers.map((user) => (
          <div
            key={user.id || 'current'}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              user.isCurrent
                ? 'bg-primary-50 border-2 border-primary-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm"
              style={{ backgroundColor: user.color }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 truncate">
                {user.username}
                {user.isCurrent && (
                  <span className="ml-2 text-xs text-primary-600 font-normal">(You)</span>
                )}
              </div>
              <div className="text-xs text-gray-500">Active now</div>
            </div>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
              style={{ backgroundColor: user.color }}
            />
          </div>
        ))}
        
        {allUsers.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <FiUser className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No other users</p>
          </div>
        )}
      </div>
    </div>
  );
}

