import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Handle root requests
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Collaborative Editor Server',
    endpoints: {
      socket: 'Socket.io connection available'
    }
  });
});

// Store document state and connected users
const documents = new Map();
const users = new Map();

// Initialize default document
documents.set('default', {
  content: '',
  version: 0,
  users: new Set()
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-document', ({ documentId = 'default', username, color }) => {
    socket.join(documentId);
    
    // Initialize document if it doesn't exist
    if (!documents.has(documentId)) {
      documents.set(documentId, {
        content: '',
        version: 0,
        users: new Set()
      });
    }

    const doc = documents.get(documentId);
    const user = {
      id: socket.id,
      username: username || `User ${socket.id.slice(0, 6)}`,
      color: color || generateColor(),
      cursor: null
    };

    users.set(socket.id, { documentId, ...user });
    doc.users.add(socket.id);

    // Send current document state to the new user
    socket.emit('document-state', {
      content: doc.content,
      version: doc.version
    });

    // Send updated user list to all clients in the document
    const userList = Array.from(doc.users).map(userId => {
      const u = users.get(userId);
      return u ? { id: u.id, username: u.username, color: u.color } : null;
    }).filter(Boolean);

    io.to(documentId).emit('users-updated', userList);

    console.log(`${user.username} joined document ${documentId}`);
  });

  socket.on('text-change', ({ documentId, changes, version }) => {
    const doc = documents.get(documentId);
    if (!doc) return;

    // Simple version control - accept changes if version matches
    if (version === doc.version) {
      doc.content = changes.content;
      doc.version += 1;

      // Broadcast to all other clients in the document
      socket.to(documentId).emit('text-change', {
        changes,
        version: doc.version,
        userId: socket.id
      });
    } else {
      // Version mismatch - send current state
      socket.emit('document-state', {
        content: doc.content,
        version: doc.version
      });
    }
  });

  socket.on('cursor-change', ({ documentId, cursor }) => {
    const user = users.get(socket.id);
    if (user && user.documentId === documentId) {
      user.cursor = cursor;
      socket.to(documentId).emit('cursor-change', {
        userId: socket.id,
        username: user.username,
        color: user.color,
        cursor
      });
    }
  });


  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const doc = documents.get(user.documentId);
      if (doc) {
        doc.users.delete(socket.id);
        
        // Notify other users
        const userList = Array.from(doc.users).map(userId => {
          const u = users.get(userId);
          return u ? { id: u.id, username: u.username, color: u.color } : null;
        }).filter(Boolean);

        io.to(user.documentId).emit('users-updated', userList);
        io.to(user.documentId).emit('user-left', { userId: socket.id });
      }
      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

function generateColor() {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316'  // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

