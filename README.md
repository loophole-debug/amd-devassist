# AMD DevAssist

AMD DevAssist is a multi-agent AI assistant designed to help developers set up and use AMD Developer Cloud effortlessly. It leverages a team of collaborative AI agents to provide search context, generate accurate ROCm/AMD code snippets, and review the final outputs.

## Architecture

```text
User Query
   |
   v
[ Agent 1: Search ] -----> Extracts relevant AMD Knowledge Base info
   |
   v
[ Agent 2: Code ] -------> Generates ready-to-run ROCm code & commands
   |
   v
[ Agent 3: Review ] -----> Reviews for ROCm-specific issues & finalizes
   |
   v
Final Response with Streaming UI
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **UI Components**: shadcn/ui patterns, Framer Motion, Lucide React
- **Syntax Highlighting**: React-Syntax-Highlighter
- **AI Orchestration**: LangChain.js
- **LLM Inference**: Groq API (llama-3.3-70b-versatile)
- **Deployment**: Vercel-ready

## Setup Instructions

1. **Clone the repository:**
   \`\`\`bash
   git clone <your-repo-url>
   cd amd-devassist
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Environment Variables:**
   Rename \`.env.local.example\` to \`.env.local\` and add your Groq API key:
   \`\`\`env
   GROQ_API_KEY=your_groq_api_key_here
   \`\`\`

4. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it uses AMD Developer Cloud

AMD DevAssist acts as an interactive companion specifically tailored for the AMD Developer Cloud ecosystem. It features an embedded knowledge base that covers:
- Provisioning GPU Droplets (MI210, MI300X)
- Setting up ROCm
- Running LLaMA models on AMD infrastructure
- Troubleshooting common HIP and PyTorch-ROCm errors

## Screenshots

*(Placeholder for Screenshots)*
- [x] Home Page
- [x] Agent Collaboration Stream
- [x] Code Snippet with Copy Button

## License

MIT License
