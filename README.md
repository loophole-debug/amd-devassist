# AMD DevAssist 🔴

> **Multi-Agent AI Assistant for AMD Developer Cloud** — Built for lablab.ai Hackathon

[![Live Demo](https://img.shields.io/badge/Live%20Demo-amd--devassist.vercel.app-ED1C24?style=for-the-badge&logo=vercel)](https://amd-devassist.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-loophole--debug%2Famd--devassist-181717?style=for-the-badge&logo=github)](https://github.com/loophole-debug/amd-devassist)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange?style=for-the-badge)](https://console.groq.com)

AMD DevAssist is a multi-agent AI assistant designed to help developers set up and use AMD Developer Cloud effortlessly. A user types a question like *"How do I run Llama 3 on AMD?"* and 3 AI agents collaborate in sequence to give a complete, actionable answer — with streaming, code generation, and step-by-step review.

---

## 🌐 Live Links

| | URL |
|---|---|
| **🚀 Live App** | [https://amd-devassist.vercel.app](https://amd-devassist.vercel.app) |
| **📦 GitHub Repo** | [https://github.com/loophole-debug/amd-devassist](https://github.com/loophole-debug/amd-devassist) |
| **🔍 Vercel Dashboard** | [vercel.com/priyanshukr2512-4962s-projects/amd-devassist](https://vercel.com/priyanshukr2512-4962s-projects/amd-devassist) |

---

## 🏗️ Architecture

```
User Query
   │
   ▼
┌─────────────────────────────────────┐
│  Agent 1: Search Agent              │
│  🔍 Searches AMD Knowledge Base     │
│  → Returns: relevant context        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  Agent 2: Code Agent                │
│  💻 Generates ROCm code snippets    │
│  → Returns: ready-to-run commands   │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  Agent 3: Review Agent              │
│  ✅ Reviews for ROCm issues         │
│  → Returns: clean numbered steps    │
└─────────────────────────────────────┘
                   │
                   ▼
        Streaming Response UI
        (Server-Sent Events)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS (AMD red + dark theme) |
| **UI Components** | Framer Motion, Lucide React, React Markdown |
| **Syntax Highlighting** | React-Syntax-Highlighter (vscDarkPlus) |
| **AI Orchestration** | LangChain.js |
| **LLM Inference** | Groq API (`llama-3.3-70b-versatile`) |
| **Streaming** | Server-Sent Events (Edge Runtime) |
| **Deployment** | Vercel (Production) |

---

## 🤖 Agent Architecture

### Agent 1 — Search Agent 🔍
- Searches a hardcoded AMD Developer Cloud knowledge base
- Covers: GPU Droplet creation, ROCm setup, Llama deployment, error fixes, hardware comparisons
- Status: `🔍 Searching AMD Knowledge Base...`

### Agent 2 — Code Agent 💻
- Takes search results as input
- Generates ready-to-run code snippets and CLI commands
- Output is formatted with syntax highlighting and a Copy button
- Status: `💻 Generating Code...`

### Agent 3 — Review Agent ✅
- Reviews both previous agent outputs
- Checks for ROCm-specific issues
- Produces a clean final summary with numbered steps
- Status: `✅ Reviewing & Finalizing...`

---

## 🎯 How it Uses AMD Developer Cloud

AMD DevAssist is purpose-built for the AMD Developer Cloud ecosystem. Its embedded knowledge base covers:

- **GPU Droplet Provisioning** — How to create MI210 / MI300X instances
- **ROCm Installation** — Setting up the open compute platform
- **LLM Deployment** — Running Llama 3.1 via vLLM on AMD GPUs
- **Error Troubleshooting** — Fixes for `cannot import name 'hip'`, HIP GPU detection issues
- **Hardware Insights** — AMD MI300X vs NVIDIA H100 for LLM inference

---

## 💬 Example Prompts

| Prompt | What it tests |
|---|---|
| "How do I create a GPU Droplet on AMD Developer Cloud?" | Droplet provisioning flow |
| "Set up Llama 3.1 on ROCm" | vLLM + ROCm setup |
| "Fix this ROCm import error: cannot import name 'hip'" | Error troubleshooting |
| "Compare AMD MI300X vs NVIDIA H100 for LLM inference" | Hardware comparison |

---

## 🖼️ Screenshots

### Home Page — Empty State
The landing page shows example prompts to get started instantly.

### Agent Pipeline — In Action
Each agent streams its response in real-time into a color-coded card:
- 🔵 **Blue card** — Search Agent results
- ⚫ **Dark card** — Generated code with syntax highlighting
- 🟢 **Green card** — Final reviewed summary with numbered steps

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- A free Groq API key from [console.groq.com/keys](https://console.groq.com/keys)

### 1. Clone the repository

```bash
git clone https://github.com/loophole-debug/amd-devassist.git
cd amd-devassist
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with your token
vercel --prod --yes --token YOUR_VERCEL_TOKEN

# Add GROQ_API_KEY environment variable
vercel env add GROQ_API_KEY production --value YOUR_KEY --yes --token YOUR_VERCEL_TOKEN
```

Or simply connect your GitHub repo to Vercel at [vercel.com](https://vercel.com) and add `GROQ_API_KEY` in Project Settings → Environment Variables.

---

## 📁 Project Structure

```
amd-devassist/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # 3-Agent LangChain pipeline (Edge Runtime)
│   │   ├── globals.css           # Global styles (AMD dark theme)
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main chat UI
│   └── lib/
│       └── utils.ts              # Tailwind utility helper
├── .env.local.example            # Environment variable template
├── vercel.json                   # Vercel deployment config
├── tailwind.config.ts            # Custom AMD colors
└── README.md
```

---

## 🔐 Security

- API key is stored in `.env.local` which is in `.gitignore` and **never pushed to GitHub**
- `.env.local.example` only contains a placeholder value
- Vercel environment variables are encrypted at rest

---

## 📄 License

MIT License — feel free to fork and build on top of this project.

---

## 🙏 Acknowledgements

- [AMD Developer Cloud](https://developer.amd.com/amd-developer-cloud/) for the platform
- [Groq](https://groq.com) for ultra-fast LLM inference
- [LangChain](https://js.langchain.com) for agent orchestration
- [Vercel](https://vercel.com) for deployment
- [lablab.ai](https://lablab.ai) for hosting the hackathon
