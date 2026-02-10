<div align="center">

# 🤖 AI Database Assistant Manager

**A modern, AI-powered database management tool with intelligent query assistance**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-black?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

</div>

<br>

<div align="center">

### 🚀 **Get Started in Minutes** • 💡 **AI-Powered Queries** • 🗄️ **Multi-Database Support**

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Installation](#-installation)

</div>

<br>
<br>

---

## 🎯 Overview

**AI Database Assistant Manager** is a powerful, modern web application that simplifies database management through AI-powered assistance. Connect to multiple database types, write and execute SQL queries with intelligent AI support, and visualize results in a beautiful, responsive interface.

<br>

### ✨ Key Highlights

<div align="center">

| 🗄️ **Multi-Database** | 🤖 **AI-Powered** | 💻 **Modern UI** | ⚡ **Fast & Efficient** | 🔒 **Secure** |
|:---:|:---:|:---:|:---:|:---:|
| SQLite, PostgreSQL, MySQL | Natural language to SQL | Beautiful, responsive design | Real-time execution | Safe connection handling |

</div>

<br>
<br>

---

## ✨ Features

<br>

### 🔌 Multi-Database Support

Connect seamlessly to multiple database types with a unified interface:

- **SQLite** - File-based database connections
- **PostgreSQL** - Full PostgreSQL support with connection pooling
- **MySQL** - MySQL/MariaDB compatibility

<br>

### 📝 Advanced Query Editor

Professional SQL editing experience:

- **Monaco Editor** - Industry-standard SQL editor with syntax highlighting
- **Keyboard Shortcuts** - `Ctrl+Enter` to execute queries instantly
- **Query History** - Track your executed queries
- **Error Handling** - Clear error messages and debugging support

<br>

### 🤖 AI Assistant

Intelligent query assistance powered by advanced AI models:

- **Generate Queries** - Convert natural language to SQL automatically
- **Optimize Queries** - Improve query performance with AI suggestions
- **Explain Queries** - Understand complex SQL with detailed explanations
- **Multiple AI Models** - Support for GPT-4, Claude, and more via OpenRouter

<br>

### 📊 Results Visualization

Beautiful and informative result displays:

- **Tabular Display** - Clean, organized result tables
- **Execution Metrics** - Query execution time tracking
- **Export Options** - Easy data export capabilities

<br>

### 🎨 Modern User Interface

Designed for productivity and aesthetics:

- **Responsive Design** - Works perfectly on all screen sizes
- **Gradient Themes** - Beautiful, modern visual design
- **Intuitive Layout** - Easy-to-use interface that gets out of your way

<br>
<br>

---

## 🚀 Quick Start

<br>

<div align="center">

### **Get up and running in 3 simple steps**

</div>

<br>

### Step 1: Install Dependencies

```bash
npm run install-all
```

<br>

### Step 2: Configure Environment

```bash
cd server
echo "PORT=5000" > .env
echo "OPENROUTER_API_KEY=your_key_here" >> .env
echo "OPENROUTER_MODEL=openai/gpt-4o-mini" >> .env
echo "APP_URL=http://localhost:3000" >> .env
cd ..
```

> **💡 Tip:** Get your free API key at [openrouter.ai/keys](https://openrouter.ai/keys)

<br>

### Step 3: Start the Application

```bash
npm run dev
```

<br>

<div align="center">

### 🎉 **You're all set!**

**Frontend:** http://localhost:3000  
**Backend API:** http://localhost:5000

</div>

<br>
<br>

---

## 📥 Installation

<br>

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | 18.0 or higher | Runtime environment (native fetch support) |
| npm or yarn | Latest | Package manager |
| OpenRouter API Key | - | Optional, for AI features |

> **Note:** Node.js v18+ is required for native `fetch` API support.

<br>

### Detailed Installation Steps

#### 1. Clone or Navigate to Project

```bash
git clone <repository-url>
cd db-manager-ai
```

<br>

#### 2. Install Dependencies

Install all dependencies for both server and client:

```bash
npm run install-all
```

This will install:
- Root workspace dependencies
- Server dependencies (Express, database drivers)
- Client dependencies (React, Monaco Editor, Axios)

<br>

#### 3. Environment Configuration

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

<br>
<br>

---

## ⚙️ Configuration

<br>

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Backend server port |
| `APP_URL` | No | `http://localhost:3000` | Frontend application URL |
| `OPENROUTER_API_KEY` | Optional | - | API key for AI features |
| `OPENROUTER_MODEL` | Optional | `openai/gpt-4o-mini` | AI model to use |

<br>

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

<br>
<br>

---

## 🏃 Running the Application

<br>

### Development Mode (Recommended)

Start both server and client simultaneously:

```bash
npm run dev
```

This command:
- Starts the Express server on port `5000`
- Starts the React development server on port `3000`
- Enables hot-reload for both

<br>

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

<br>

### Production Build

Build the client for production:

```bash
npm run build
```

The production build will be in `client/build/`.

<br>
<br>

---

## 📖 Usage Guide

<br>

### 1. Connect to a Database

<div align="center">

**Select your database type and enter connection details**

</div>

<br>

#### SQLite

- **Type**: File-based database
- **Path**: Optional (defaults to `server/database.db`)
- **Auto-create**: Database file created if it doesn't exist

**Example:**
```
Database Type: SQLite
Path: ./mydatabase.db
```

<br>

#### PostgreSQL

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

<br>

#### MySQL / MariaDB

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

<br>

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

<br>

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

<br>
<br>

---

## 🗄️ Database Support

<br>

<div align="center">

### **Full support for the most popular database systems**

</div>

<br>

| Database | Status | Features |
|----------|--------|----------|
| **SQLite** | ✅ Full Support | File-based, auto-create, lightweight |
| **PostgreSQL** | ✅ Full Support | Connection pooling, full feature set |
| **MySQL** | ✅ Full Support | MySQL/MariaDB compatible |

<br>
<br>

---

## 📁 Project Structure

<br>

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

<br>
<br>

---

## 🛠️ Technologies

<br>

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| [React](https://reactjs.org/) | 18.2 | UI framework |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | 4.6 | SQL code editor |
| [Axios](https://axios-http.com/) | 1.6 | HTTP client |
| React Scripts | 5.0 | Build tooling |

<br>

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

<br>

### AI Integration

| Service | Purpose |
|---------|---------|
| [OpenRouter](https://openrouter.ai/) | AI model API gateway |
| Multiple Models | GPT-4, Claude, Gemini support |

<br>
<br>

---

## 📝 Additional Notes

<br>

<div align="center">

| Feature | Description |
|:---:|:---|
| 🔐 **Secure connections** | Proper connection handling and error management |
| 🤖 **AI features** | Optional but powerful when enabled |
| 💾 **Database files** | SQLite databases stored in `server/` folder (gitignored) |
| 🔄 **Hot reload** | Automatic refresh during development |
| 📊 **Query metrics** | Track execution time and performance |

</div>

<br>
<br>

---

## 📄 License

<br>

<div align="center">

This project is licensed under the **MIT License**.

</div>

<br>

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

<br>
<br>

---

<div align="center">

[⬆ Back to Top](#-ai-database-assistant-manager)

</div>
