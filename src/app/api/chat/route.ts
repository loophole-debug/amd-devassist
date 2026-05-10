import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

const AMD_KB = `
AMD Developer Cloud Knowledge Base:
- Creating GPU Droplets: To create a GPU droplet on AMD Developer Cloud, go to the dashboard, click 'Create Resource', select 'GPU Instance', choose your desired MI-series GPU (like MI210 or MI300X), select an OS image with ROCm pre-installed, and click 'Deploy'.
- ROCm Setup: AMD ROCm is the open software platform for GPU computing. If not pre-installed, install it via 'amdgpu-install --usecase=rocm'.
- Running Llama 3 on AMD: Use vLLM or Hugging Face Transformers with ROCm support. Command: 'python3 -m vllm.entrypoints.openai.api_server --model meta-llama/Meta-Llama-3-8B-Instruct --tensor-parallel-size 1'. Ensure you have the 'torch-rocm' package installed.
- Common Error Fixes:
  - "cannot import name 'hip'": Ensure your Python environment is using the ROCm version of PyTorch. Run 'pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0'.
  - "No HIP GPUs available": Check if your GPU is recognized using 'rocm-smi'. If not, reboot or reinstall the amdgpu-dkms driver.
- Hardware Comparison: AMD MI300X offers 192GB of HBM3 memory, making it highly competitive against NVIDIA H100 (80GB) for LLM inference, allowing larger models to fit on a single GPU.
`;

export async function POST(req: Request) {
  const { message } = await req.json();

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const writeChunk = async (type: string, agent: number, content: string) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify({ type, agent, content })}\n\n`));
  };

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    streaming: true,
  });

  const parser = new StringOutputParser();

  (async () => {
    try {
      // AGENT 1: Search Agent
      await writeChunk("status", 1, "🔍 Searching AMD Knowledge Base...");
      const searchPrompt = PromptTemplate.fromTemplate(`
You are the Search Agent for AMD DevAssist.
Extract only the relevant information from the knowledge base below to answer the user's query.
If the information is not in the knowledge base, provide the closest relevant information or state what you know generally about AMD ROCm.

Knowledge Base:
{kb}

User Query: {query}
Relevant Information:
`);
      const searchChain = searchPrompt.pipe(model).pipe(parser);
      let searchOutput = "";
      const searchStream = await searchChain.stream({ kb: AMD_KB, query: message });
      for await (const chunk of searchStream) {
        searchOutput += chunk;
        await writeChunk("chunk", 1, chunk);
      }
      await writeChunk("done", 1, "");

      // AGENT 2: Code Agent
      await writeChunk("status", 2, "💻 Generating Code...");
      const codePrompt = PromptTemplate.fromTemplate(`
You are the Code Agent for AMD DevAssist.
Based on the Search Agent's findings and the user's query, provide ready-to-run code snippets or CLI commands.
Ensure code is well-commented and accurate for AMD ROCm environments. DO NOT provide long explanations, just the code.

Search Agent Findings:
{search_output}

User Query: {query}
Code:
`);
      const codeChain = codePrompt.pipe(model).pipe(parser);
      let codeOutput = "";
      const codeStream = await codeChain.stream({ search_output: searchOutput, query: message });
      for await (const chunk of codeStream) {
        codeOutput += chunk;
        await writeChunk("chunk", 2, chunk);
      }
      await writeChunk("done", 2, "");

      // AGENT 3: Review Agent
      await writeChunk("status", 3, "✅ Reviewing & Finalizing...");
      const reviewPrompt = PromptTemplate.fromTemplate(`
You are the Review Agent for AMD DevAssist.
Take the search findings and the code, and write a clean, final summary with numbered steps for the user.
Check for any ROCm-specific issues and highlight them.

Search Findings:
{search_output}

Code Output:
{code_output}

User Query: {query}
Final Summary:
`);
      const reviewChain = reviewPrompt.pipe(model).pipe(parser);
      const reviewStream = await reviewChain.stream({
        search_output: searchOutput,
        code_output: codeOutput,
        query: message,
      });
      for await (const chunk of reviewStream) {
        await writeChunk("chunk", 3, chunk);
      }
      await writeChunk("done", 3, "");
    } catch (error: unknown) {
      console.error(error);
      await writeChunk("error", 0, "An error occurred while processing the request.");
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
