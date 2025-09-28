const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

// Import middleware
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

app.use(flash());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash();
  next();
});

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/todos');
  }
  res.render('index', { title: 'Todo App' });
});

app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;