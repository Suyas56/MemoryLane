# MemoryLane Server

Backend API server for MemoryLane - A platform for creating and sharing memory events with AI-powered features.

## Features

- 🔐 User authentication (register, login, logout)
- 📝 CRUD operations for memory events
- 🖼️ Photo management for events
- 🤖 AI-powered features via Google GenAI
- ⚡ LRU Cache implementation for optimized performance
- 🔍 Search and filtering capabilities
- 📊 Event analytics (views, likes)
- 🔗 Share codes for public events

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **AI**: Google GenAI
- **Caching**: Custom LRU Cache implementation

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
GOOGLE_API_KEY=your_google_api_key
NODE_ENV=development
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `GOOGLE_API_KEY` | Google GenAI API key | Yes |
| `NODE_ENV` | Environment mode | No |

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events/:id` - Get event by ID (with LRU cache)
- `POST /api/events` - Create new event (authenticated)
- `PUT /api/events/:id` - Update event (authenticated)
- `DELETE /api/events/:id` - Delete event (authenticated)
- `GET /api/events` - List all events with filtering

### Additional Features
- View tracking
- Like system
- Public/private event sharing
- Text search indexing

## Project Structure

```
.
├── index.js          # Main server file with routes
├── models.js         # MongoDB schemas (User, MemoryEvent)
├── lru.js            # LRU Cache implementation
├── test-mongo.mjs    # MongoDB connection test
├── .env              # Environment variables (not in git)
├── .gitignore        # Git ignore rules
├── package.json      # Project dependencies
└── README.md         # This file
```

## Data Structures & Algorithms

### LRU Cache
The project implements a custom LRU (Least Recently Used) Cache with O(1) time complexity for get and put operations, used to cache frequently accessed memory events and reduce database queries.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
