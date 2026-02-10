<div align="center">

# 🤖 AI Database Assistant Manager

**A modern, AI-powered database management tool with intelligent query assistance**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-black?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Usage Guide](#-usage-guide)
- [Database Support](#-database-support)
- [Project Structure](#-project-structure)
- [Technologies](#-technologies)
- [License](#-license)

---

## 🎯 Overview

**AI Database Assistant Manager** is a powerful, modern web application that simplifies database management through AI-powered assistance. Connect to multiple database types, write and execute SQL queries with intelligent AI support, and visualize results in a beautiful, responsive interface.

### Key Highlights

✨ **Multi-Database Support** - SQLite, PostgreSQL, and MySQL  
🚀 **AI-Powered Assistance** - Natural language to SQL conversion  
💻 **Modern UI** - Beautiful, responsive design with syntax highlighting  
⚡ **Fast & Efficient** - Real-time query execution and results  
🔒 **Secure** - Safe database connection handling  

---

## ✨ Features

### 🔌 Multi-Database Support
- **SQLite** - File-based database connections
- **PostgreSQL** - Full PostgreSQL support with connection pooling
- **MySQL** - MySQL/MariaDB compatibility

### 📝 Advanced Query Editor
- **Monaco Editor** - Industry-standard SQL editor with syntax highlighting
- **Keyboard Shortcuts** - `Ctrl+Enter` to execute queries
- **Query History** - Track your executed queries
- **Error Handling** - Clear error messages and debugging

### 🤖 AI Assistant
- **Generate Queries** - Convert natural language to SQL
- **Optimize Queries** - Improve query performance with AI suggestions
- **Explain Queries** - Understand complex SQL with detailed explanations
- **Multiple AI Models** - Support for GPT-4, Claude, and more via OpenRouter

### 📊 Results Visualization
- **Tabular Display** - Clean, organized result tables
- **Execution Metrics** - Query execution time tracking
- **Export Options** - Easy data export capabilities

### 🎨 Modern User Interface
- **Responsive Design** - Works on all screen sizes
- **Gradient Themes** - Beautiful, modern visual design
- **Intuitive Layout** - Easy-to-use interface

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | 18.0 or higher | Runtime environment (native fetch support) |
| npm or yarn | Latest | Package manager |
| OpenRouter API Key | - | Optional, for AI features |

> **Note:** Node.js v18+ is required for native `fetch` API support.

---

## 🚀 Quick Start

Get up and running in minutes:

```bash
# 1. Clone or navigate to the project
cd db-manager-ai

# 2. Install dependencies
npm run install-all

# 3. Create environment file
cd server
echo "PORT=5000" > .env
echo "OPENROUTER_API_KEY=your_key_here" >> .env
echo "OPENROUTER_MODEL=openai/gpt-4o-mini" >> .env
echo "APP_URL=http://localhost:3000" >> .env

# 4. Start the application
cd ..
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 📥 Installation

### Step 1: Clone or Navigate to Project

```bash
git clone <repository-url>
cd db-manager-ai
```

### Step 2: Install Dependencies

Install all dependencies for both server and client:

```bash
npm run install-all
```

This will install:
- Root workspace dependencies
- Server dependencies (Express, database drivers)
- Client dependencies (React, Monaco Editor, Axios)

### Step 3: Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

Add the following configuration:

```env
# Server Configuration
PORT=5000
APP_URL=http://localhost:3000

# OpenRouter AI Configuration (Optional)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

> **Get your API key**: Visit [openrouter.ai/keys](https://openrouter.ai/keys) to get a free API key.

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Backend server port |
| `APP_URL` | No | `http://localhost:3000` | Frontend application URL |
| `OPENROUTER_API_KEY` | Optional | - | API key for AI features |
| `OPENROUTER_MODEL` | Optional | `openai/gpt-4o-mini` | AI model to use |

### AI Model Selection

The application supports multiple AI models via OpenRouter. Choose based on your needs:

#### 💰 Cost-Effective Models (Recommended)

| Model | Cost (per 1M tokens) | Speed | Use Case |
|-------|---------------------|-------|----------|
| `openai/gpt-4o-mini` | ~$0.15 | Fast | **Recommended default** |
| `openai/gpt-3.5-turbo` | ~$0.50 | Very Fast | Quick queries |
| `anthropic/claude-3-haiku` | ~$0.25 | Fast | Alternative option |

#### 🚀 Powerful Models (Higher Cost)

| Model | Cost (per 1M tokens) | Speed | Use Case |
|-------|---------------------|-------|----------|
| `openai/gpt-4o` | ~$2.50-5.00 | Medium | Complex queries |
| `openai/gpt-4` | ~$30.00 | Slow | Advanced analysis |
| `anthropic/claude-3-opus` | ~$15.00 | Medium | Deep understanding |

> **View all models**: [openrouter.ai/models](https://openrouter.ai/models)

---

## 🏃 Running the Application

### Development Mode (Recommended)

Start both server and client simultaneously:

```bash
npm run dev
```

This command:
- Starts the Express server on port `5000`
- Starts the React development server on port `3000`
- Enables hot-reload for both

### Run Separately

#### Backend Only

```bash
npm run server
# or
cd server && npm run dev
```

#### Frontend Only

```bash
npm run client
# or
cd client && npm start
```

### Production Build

Build the client for production:

```bash
npm run build
```

The production build will be in `client/build/`.

---

## 📖 Usage Guide

### 1. Connect to a Database

1. **Select Database Type**
   - Choose from SQLite, PostgreSQL, or MySQL

2. **Enter Connection Details**
   - **SQLite**: Provide file path (or leave empty for default)
   - **PostgreSQL**: Host, port, database, username, password
   - **MySQL**: Host, port, database, username, password

3. **Click "Connect"**
   - Connection status will be displayed
   - Once connected, you can start querying

### 2. Write and Execute Queries

1. **Open Query Editor**
   - The Monaco Editor provides SQL syntax highlighting
   - Auto-completion and IntelliSense support

2. **Write Your Query**
   ```sql
   SELECT * FROM users WHERE age > 25;
   ```

3. **Execute Query**
   - Press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
   - Or click the "Execute" button

4. **View Results**
   - Results appear in the Results Panel
   - Execution time is displayed
   - Errors are shown with helpful messages

### 3. Use AI Assistant

1. **Select Action Type**
   - **Generate**: Create SQL from natural language
   - **Optimize**: Improve existing query performance
   - **Explain**: Get detailed query explanation

2. **Enter Your Request**
   ```
   Generate: Show me all users who are admins
   Optimize: SELECT * FROM users WHERE name LIKE '%john%'
   Explain: SELECT u.*, o.total FROM users u JOIN orders o ON u.id = o.user_id
   ```

3. **Get AI Response**
   - Click "Ask AI" to submit
   - AI will generate the response
   - Click "Use Query" to insert into editor

---

## 🗄️ Database Support

### SQLite

**Connection Details:**
- **Type**: File-based database
- **Path**: Optional (defaults to `server/database.db`)
- **Auto-create**: Database file created if it doesn't exist

**Example:**
```
Database Type: SQLite
Path: ./mydatabase.db
```

### PostgreSQL

**Connection Details:**
- **Host**: Database server address (default: `localhost`)
- **Port**: Server port (default: `5432`)
- **Database**: Database name
- **Username**: Database user
- **Password**: User password

**Example:**
```
Host: localhost
Port: 5432
Database: myapp_db
Username: postgres
Password: ********
```

### MySQL / MariaDB

**Connection Details:**
- **Host**: Database server address (default: `localhost`)
- **Port**: Server port (default: `3306`)
- **Database**: Database name
- **Username**: Database user
- **Password**: User password

**Example:**
```
Host: localhost
Port: 3306
Database: myapp_db
Username: root
Password: ********
```

---

## 📁 Project Structure

```
db-manager-ai/
│
├── 📂 server/                 # Backend Express server
│   ├── 📄 index.js            # Main server file (API routes, DB connections)
│   ├── 📄 package.json        # Server dependencies
│   ├── 📄 .env                # Environment variables (create this)
│   ├── 📄 database.db         # Default SQLite database (gitignored)
│   └── 📄 sample_database.db  # Sample database (gitignored)
│
├── 📂 client/                 # Frontend React application
│   ├── 📂 public/             # Static assets
│   │   └── index.html        # HTML template
│   ├── 📂 src/                # Source code
│   │   ├── 📂 components/     # React components
│   │   │   ├── ConnectionPanel.js    # Database connection UI
│   │   │   ├── QueryEditor.js        # SQL editor component
│   │   │   ├── ResultsPanel.js       # Query results display
│   │   │   └── AIAssistant.js        # AI assistant interface
│   │   ├── App.js            # Main App component
│   │   ├── App.css           # App styles
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   └── 📄 package.json       # Client dependencies
│
├── 📄 package.json            # Root package.json (workspace config)
├── 📄 package-lock.json       # Dependency lock file
├── 📄 .gitignore             # Git ignore rules
└── 📄 README.md              # This file
```

---

## 🛠️ Technologies

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| [React](https://reactjs.org/) | 18.2 | UI framework |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | 4.6 | SQL code editor |
| [Axios](https://axios-http.com/) | 1.6 | HTTP client |
| React Scripts | 5.0 | Build tooling |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Node.js](https://nodejs.org/) | 18+ | Runtime environment |
| [Express](https://expressjs.com/) | 4.18 | Web framework |
| [SQLite3](https://www.sqlite.org/) | 5.1 | SQLite driver |
| [pg](https://node-postgres.com/) | 8.11 | PostgreSQL driver |
| [mysql2](https://github.com/sidorares/node-mysql2) | 3.6 | MySQL driver |
| [CORS](https://github.com/expressjs/cors) | 2.8 | Cross-origin support |
| [dotenv](https://github.com/motdotla/dotenv) | 16.3 | Environment variables |

### AI Integration

| Service | Purpose |
|---------|---------|
| [OpenRouter](https://openrouter.ai/) | AI model API gateway |
| Multiple Models | GPT-4, Claude, Gemini support |

---

## 📝 Notes

-  **Real database connections** - Connect to actual production databases
- 🔐 **Secure connections** - Proper connection handling and error management
- 🤖 **AI features** - Optional but powerful when enabled
- 💾 **Database files** - SQLite databases stored in `server/` folder (gitignored)
- 🔄 **Hot reload** - Automatic refresh during development
- 📊 **Query metrics** - Track execution time and performance

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Made with ❤️ using React, Express, and AI**

[⬆ Back to Top](#-ai-database-assistant-manager)

</div>
#   d b _ m a n a g e r _ a i  
 