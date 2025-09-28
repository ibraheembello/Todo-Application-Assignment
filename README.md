# Todo Application

A simple, secure todo application built with Node.js, Express, MongoDB, and EJS templating. This application allows users to create, manage, and organize their daily tasks with user authentication and task status management.

## Features

- **User Authentication**: Secure signup and login system
- **Personal Task Management**: Users can only see and manage their own tasks
- **Task Status Management**: Tasks can be pending, completed, or deleted
- **Task Filtering**: Sort tasks by status (all, pending, completed)
- **Responsive UI**: Clean, Bootstrap-based interface
- **Data Persistence**: MongoDB database integration
- **Error Handling**: Comprehensive global and local error handling
- **Logging**: Structured logging with Winston
- **Testing**: Automated tests with Jest and Supertest

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: EJS
- **Authentication**: Session-based with bcrypt password hashing
- **Styling**: Bootstrap 5 with Font Awesome icons
- **Testing**: Jest, Supertest
- **Logging**: Winston
- **Validation**: Joi

## Project Structure

```Design
todo-app/
├── controllers/           # Business logic controllers
│   ├── authController.js
│   └── todoController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── models/              # MongoDB models
│   ├── User.js
│   └── Task.js
├── routes/              # Express routes
│   ├── auth.js
│   └── todos.js
├── views/               # EJS templates
│   ├── auth/
│   ├── todos/
│   ├── index.ejs
│   └── error.ejs
├── tests/               # Test files
│   ├── auth.test.js
│   └── todo.test.js
├── utils/               # Utility functions
│   └── logger.js
├── public/              # Static files
├── logs/                # Log files
├── app.js               # Express app configuration
├── server.js            # Server entry point
└── package.json         # Project dependencies
```

## Database Schema (ER Diagram)

### User Entity

- `_id`: ObjectId (Primary Key)
- `username`: String (Unique, Required)
- `password`: String (Hashed, Required)
- `createdAt`: Date
- `updatedAt`: Date

### Task Entity

- `_id`: ObjectId (Primary Key)
- `title`: String (Required)
- `description`: String (Optional)
- `status`: String (enum: 'pending', 'completed', 'deleted')
- `userId`: ObjectId (Foreign Key → User.\_id)
- `createdAt`: Date
- `updatedAt`: Date

### Relationship

- One-to-Many: User → Tasks
- Each user can have multiple tasks
- Each task belongs to exactly one user

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd todo-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/todoapp
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your-super-secret-session-key
   ```

4. **Start MongoDB**

   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Update MONGODB_URI in .env

5. **Create logs directory**

   ```bash
   mkdir logs
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Access the application**
   Open your browser to `http://localhost:3000`

### Production Setup (Render)

1. **Prepare for deployment**

   - Ensure all environment variables are set in Render dashboard
   - Set `NODE_ENV=production`
   - Use MongoDB Atlas for production database

2. **Environment Variables for Render**

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoapp
   NODE_ENV=production
   SESSION_SECRET=your-production-secret-key
   PORT=10000
   ```

3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

## Usage

### Getting Started

1. **Sign Up**: Create a new account with username and password
2. **Login**: Access your personal dashboard
3. **Create Tasks**: Add new tasks with titles and descriptions
4. **Manage Tasks**: Mark tasks as completed or delete them
5. **Filter Tasks**: View all tasks, pending only, or completed only

### Task Management

- **Create**: Click "Add New Task" to create a new task
- **Complete**: Click the check button to mark a task as completed
- **Restore**: Click the undo button to mark a completed task as pending
- **Delete**: Click the trash button to permanently delete a task
- **View Details**: Click the eye button to see full task details

### User Authentication

- **Session-based**: Secure session management with encrypted cookies
- **Password Security**: Passwords are hashed using bcrypt
- **Auto-logout**: Sessions expire after 7 days of inactivity

## API Endpoints

### Authentication Routes

- `GET /auth/signup` - Render signup page
- `POST /auth/signup` - Create new user account
- `GET /auth/login` - Render login page
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - End user session

### Todo Routes (Protected)

- `GET /todos` - List user's tasks (with optional filter)
- `GET /todos/create` - Render create task page
- `POST /todos/create` - Create new task
- `GET /todos/:id` - View task details
- `PATCH /todos/:id/status` - Update task status

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

The application includes comprehensive tests for:

- User authentication (signup, login, validation)
- Task management (CRUD operations, authorization)
- Middleware functionality
- Error handling

## Error Handling

### Global Error Handler

- Catches all unhandled errors
- Provides user-friendly error messages
- Logs detailed error information
- Different behavior for development vs production

### Local Error Handling

- Input validation with Joi
- Database operation error handling
- User authorization checks
- Session management errors

## Logging

### Log Levels

- `error`: Application errors and exceptions
- `warn`: Warning messages (e.g., unauthorized access attempts)
- `info`: General application flow (login, logout, task operations)

### Log Files

- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All log levels
- `logs/exceptions.log`: Uncaught exceptions
- `logs/rejections.log`: Unhandled promise rejections

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Session Security**: Secure session cookies
- **Input Validation**: Server-side validation with Joi
- **Authorization**: Users can only access their own data
- **CSRF Protection**: Method override for safe form submissions
- **Error Information**: Sanitized error messages in production

## Development Tools

- **Nodemon**: Auto-restart during development
- **ESLint**: Code linting (can be added)
- **Prettier**: Code formatting (can be added)
- **Jest**: Testing framework
- **Winston**: Structured logging

## Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Set up environment variables in Render dashboard
3. Configure build and start commands
4. Deploy and monitor logs

### Environment Configuration

- Development: Local MongoDB, detailed logging
- Production: MongoDB Atlas, minimal logging, secure sessions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

1. Check the error logs in the `logs/` directory
2. Review the console output for development errors
3. Ensure all environment variables are properly set
4. Verify MongoDB connection is working

## Future Enhancements

Potential improvements that could be added:

- Task categories and tags
- Due dates and reminders
- Task sharing and collaboration
- Mobile application
- Real-time updates with WebSockets
- Task import/export functionality
