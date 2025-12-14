# Real-Time Collaborative Editor

A beautiful, modern real-time collaborative text editor built with React, TypeScript, Socket.io, and Tailwind CSS. Multiple users can edit the same document simultaneously with live synchronization, user presence indicators, and cursor tracking.

## Features

✨ **Real-Time Collaboration** - See changes from other users instantly
👥 **User Presence** - See who's currently editing
🎨 **Beautiful UI** - Modern, clean design with smooth animations
🎯 **Cursor Tracking** - Visual indicators showing where other users are typing
💾 **Save & Copy** - Export your document or copy to clipboard
🔌 **Connection Status** - Real-time connection indicator
📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express
- **Real-time**: Socket.io
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install all dependencies** (root, server, and client):
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

### Running the Application

1. **Start both server and client** (recommended):
   ```bash
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Start the server
   npm run server
   # Server runs on http://localhost:3001

   # Terminal 2 - Start the client
   npm run client
   # Client runs on http://localhost:5173
   ```

2. **Open your browser** and navigate to `http://localhost:5173`

3. **Enter your name** and choose a color in the welcome modal

4. **Start editing!** Open multiple browser tabs/windows to see real-time collaboration in action

## Usage

- **Type** in the editor - changes sync automatically to all connected users
- **See other users** in the sidebar with their chosen colors
- **Track cursors** - colored indicators show where others are typing
- **Save** your document using the Save button
- **Copy** content to clipboard with the Copy button
- **Toggle user list** by clicking the users button in the header

## Project Structure

```
collaborative/
├── server/
│   ├── server.js          # Express + Socket.io server
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types.ts       # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## How It Works

1. **Connection**: Clients connect to the server via WebSocket (Socket.io)
2. **Document Sync**: When a user types, changes are sent to the server
3. **Broadcast**: Server broadcasts changes to all other connected clients
4. **Version Control**: Simple versioning system prevents conflicts
5. **Presence**: User join/leave events update the user list
6. **Cursors**: Cursor positions are tracked and shared in real-time

## Customization

- **Change colors**: Edit the color palette in `client/src/components/UserModal.tsx`
- **Modify port**: Update ports in `server/server.js` and `client/vite.config.ts`
- **Styling**: Customize Tailwind classes or extend the theme in `tailwind.config.js`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment options:
- **Frontend**: Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- **Backend**: Deploy to [Railway](https://railway.app) or [Render](https://render.com)

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

