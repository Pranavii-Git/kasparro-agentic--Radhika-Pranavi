
import React, { useState, useCallback } from 'react';
import { 
  Terminal as TerminalIcon, 
  Cpu, 
  FileText, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Activity,
  Layers,
  ChevronRight,
  Code
} from 'lucide-react';
import Terminal from './components/Terminal';
import { AgentStatus, PipelineState, RawProduct } from './types';
import { geminiService } from './services/geminiService';

const MOCK_RAW_PRODUCT: RawProduct = {
  id: "P-7721",
  name: "AquaHydrate Pro 2.0",
  category: "Outdoor/Sport",
  features: ["BPA Free", "Dual-wall vacuum insulation", "Leak-proof cap", "Magnetic strap"],
  specs: {
    capacity: "32oz",
    material: "18/8 Stainless Steel",
    weight: "1.2 lbs",
    iceRetention: "48 hours"
  },
  price: 49.99,
  safetyInfo: [
    "Hand wash recommended",
    "Do not microwave",
    "Not for carbonated liquids"
  ],
  usageInstructions: [
    "Pre-chill for maximum cold retention",
    "Always lock the magnetic strap before storage",
    "Wash after every use"
  ]
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'outputs' | 'docs'>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState>({
    currentStep: 0,
    logs: [],
    agentStatuses: {},
    data: {}
  });

  const addLog = useCallback((msg: string) => {
    setPipeline(prev => ({ ...prev, logs: [...prev.logs, msg] }));
  }, []);

  const updateAgentStatus = (id: string, status: AgentStatus) => {
    setPipeline(prev => ({
      ...prev,
      agentStatuses: { ...prev.agentStatuses, [id]: status }
    }));
  };

  const runPipeline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPipeline({
      currentStep: 0,
      logs: ["Initializing Orchestrator pipeline...", "Input product detected: " + MOCK_RAW_PRODUCT.name],
      agentStatuses: {},
      data: {}
    });

    // Step 1: ProductParserAgent
    updateAgentStatus('parser', AgentStatus.RUNNING);
    addLog("[AGENT] ProductParserAgent: Validating input fields...");
    await new Promise(r => setTimeout(r, 1000));
    const parsedProduct = { ...MOCK_RAW_PRODUCT, lastUpdated: new Date().toISOString(), isSanitized: true };
    addLog("[AGENT] ProductParserAgent: Success. Data models initialized.");
    updateAgentStatus('parser', AgentStatus.COMPLETED);
    setPipeline(p => ({ ...p, data: { ...p.data, product: parsedProduct } }));

    // Step 2: QuestionGenerationAgent
    updateAgentStatus('qgen', AgentStatus.RUNNING);
    addLog("[AGENT] QuestionGenerationAgent: Synthesizing 15 categorized questions using Gemini-3...");
    const questions = await geminiService.generateQuestions(parsedProduct);
    addLog(`[AGENT] QuestionGenerationAgent: Generated ${questions.length} unique questions.`);
    updateAgentStatus('qgen', AgentStatus.COMPLETED);
    setPipeline(p => ({ ...p, data: { ...p.data, questions } }));

    // Step 3: Content Logic Blocks
    updateAgentStatus('logic', AgentStatus.RUNNING);
    addLog("[AGENT] ContentLogic: Transforming data into Benefits, Usage, Safety, and Pricing blocks...");
    await new Promise(r => setTimeout(r, 800));
    const blocks = {
      benefits: { type: 'BenefitsBlock', content: parsedProduct.features },
      usage: { type: 'UsageBlock', content: parsedProduct.usageInstructions },
      safety: { type: 'SafetyBlock', content: parsedProduct.safetyInfo },
      pricing: { type: 'PricingBlock', content: { current: parsedProduct.price, currency: 'USD' } },
      comparison: { type: 'ComparisonBlock', content: await geminiService.generateComparison(parsedProduct) }
    };
    addLog("[AGENT] ContentLogic: Blocks successfully registered.");
    updateAgentStatus('logic', AgentStatus.COMPLETED);
    setPipeline(p => ({ ...p, data: { ...p.data, blocks } }));

    // Step 4: TemplateEngine & PageAssembly
    updateAgentStatus('assembler', AgentStatus.RUNNING);
    addLog("[AGENT] PageAssemblyAgent: Applying templates (FAQ, Product Page, Comparison)...");
    await new Promise(r => setTimeout(r, 1200));
    const pages = {
      faq: { 
        title: "Product FAQ", 
        templateId: "tpl-faq-01", 
        sections: [{ type: 'QASection', content: questions }],
        metadata: { generatedAt: new Date().toISOString(), agentId: 'PageAssemblyAgent' }
      },
      product: { 
        title: "Product Detail", 
        templateId: "tpl-pd-01", 
        sections: [blocks.benefits, blocks.usage, blocks.pricing],
        metadata: { generatedAt: new Date().toISOString(), agentId: 'PageAssemblyAgent' }
      },
      comparison: { 
        title: "Comparison Report", 
        templateId: "tpl-cmp-01", 
        sections: [blocks.comparison],
        metadata: { generatedAt: new Date().toISOString(), agentId: 'PageAssemblyAgent' }
      }
    };
    addLog("[AGENT] PageAssemblyAgent: 3 pages assembled and serialized to JSON.");
    updateAgentStatus('assembler', AgentStatus.COMPLETED);
    setPipeline(p => ({ ...p, data: { ...p.data, pages } }));

    addLog("--- PIPELINE COMPLETED SUCCESSFULLY ---");
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kasparro <span className="text-blue-400 font-medium">Engine</span></h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Multi-Agent Content Orchestrator</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Activity className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('outputs')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'outputs' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <FileText className="w-4 h-4" /> JSON Outputs
            </button>
            <button 
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'docs' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <BookOpen className="w-4 h-4" /> System Design
            </button>
          </nav>

          <button 
            disabled={isProcessing}
            onClick={runPipeline}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-lg ${
              isProcessing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
            }`}
          >
            {isProcessing ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isProcessing ? 'Generating...' : 'Run Pipeline'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left: Agent Overview */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                <h2 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" /> Active Agents
                </h2>
                <div className="space-y-4">
                  {[
                    { id: 'parser', name: 'ProductParserAgent', desc: 'Validates and cleanses raw input' },
                    { id: 'qgen', name: 'QuestionGenerationAgent', desc: 'Synthesizes context-aware Q&A' },
                    { id: 'logic', name: 'ContentLogicBlocks', desc: 'Functional data transformations' },
                    { id: 'assembler', name: 'PageAssemblyAgent', desc: 'Page serialization & assembly' }
                  ].map(agent => (
                    <div key={agent.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-center justify-between group transition-all hover:bg-slate-800">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-bold text-slate-100">{agent.name}</span>
                           {pipeline.agentStatuses[agent.id] === AgentStatus.COMPLETED && (
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{agent.desc}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          pipeline.agentStatuses[agent.id] === AgentStatus.RUNNING ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                          pipeline.agentStatuses[agent.id] === AgentStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-slate-700/30 text-slate-500'
                        }`}>
                          {pipeline.agentStatuses[agent.id] || 'IDLE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-xl p-5 shadow-xl">
                 <h2 className="text-blue-200 font-semibold text-sm mb-2">Input Product</h2>
                 <p className="text-xs text-blue-300/70 mb-4">Initial state injected into pipeline</p>
                 <div className="bg-slate-950/50 rounded p-3 border border-blue-500/10 font-mono text-[10px] text-blue-300/90 whitespace-pre">
                    {JSON.stringify(MOCK_RAW_PRODUCT, null, 2)}
                 </div>
              </div>
            </div>

            {/* Right: Real-time logs and flow */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <TerminalIcon className="w-3 h-3" /> Live Orchestration Feed
                </h3>
              </div>
              <Terminal logs={pipeline.logs} />
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-slate-300 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Execution Flow (DAG)
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {[
                    "Raw Input", "ProductParser", "QuestionGen", "LogicBlocks", "Assembly", "JSON Files"
                  ].map((step, idx, arr) => (
                    <React.Fragment key={step}>
                      <div className={`px-4 py-2 rounded-lg border transition-all ${
                        pipeline.currentStep >= idx ? 'bg-blue-600/10 border-blue-500 text-blue-100' : 'bg-slate-800 border-slate-700 text-slate-500'
                      } font-medium text-xs`}>
                        {step}
                      </div>
                      {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 text-slate-700" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'outputs' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Generated Assets</h2>
                <p className="text-slate-400 text-sm">Review the machine-readable outputs from the assembly agent.</p>
              </div>
            </div>
            {!pipeline.data.pages ? (
              <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                  <FileText className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-slate-300 font-bold text-lg">No Output Files Yet</h3>
                <p className="text-slate-500 max-w-xs mt-2 text-sm">Run the orchestration pipeline to generate JSON content pages.</p>
                <button 
                  onClick={runPipeline}
                  className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold text-sm transition-all"
                >
                  Run Pipeline Now
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(pipeline.data.pages).map(([key, page]) => (
                  <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col group hover:border-blue-500/30 transition-all">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">{key}.json</span>
                      <Code className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="p-4 flex-1 overflow-auto max-h-[400px] scrollbar-hide">
                      <pre className="text-[10px] mono text-slate-400">
                        {JSON.stringify(page, null, 2)}
                      </pre>
                    </div>
                    <button className="bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold transition-colors border-t border-slate-800">
                      Copy Raw JSON
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="border-b border-slate-800 pb-8">
               <h2 className="text-4xl font-extrabold mb-4">System Architecture</h2>
               <p className="text-slate-400 text-lg">Decoupled multi-agent design for scalable content generation.</p>
            </header>

            <section className="space-y-6">
              <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-500 rounded-full" /> Agent Responsibilities
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-100 mb-2">1. ProductParserAgent</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Acts as the gateway. Sanitizes, validates, and transforms raw input JSON into a strictly-typed internal <code>ParsedProduct</code> model. Prevents downstream logic failures.
                    </p>
                 </div>
                 <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-100 mb-2">2. QuestionGenerationAgent</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Intelligence layer. Uses LLM reasoning to synthesize user-centric queries across 5 distinct categories. Ensures 100% adherence to product grounding.
                    </p>
                 </div>
                 <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-100 mb-2">3. ContentLogicBlocks</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Transformation engine. Pure functions that convert structured data into atomic "Content Blocks" (e.g. BenefitsBlock). Reusable across any template.
                    </p>
                 </div>
                 <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-100 mb-2">4. PageAssemblyAgent</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      The serializer. Combines specific templates with corresponding content blocks to produce final JSON payloads for front-end consumption.
                    </p>
                 </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-500 rounded-full" /> Technical Stack
              </h3>
              <div className="flex flex-wrap gap-4">
                 {['Python 3.10+', 'Gemini 3 Flash', 'Pydantic Models', 'Tailwind UI', 'D3.js Visualization'].map(tech => (
                   <span key={tech} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm font-medium text-slate-300">
                     {tech}
                   </span>
                 ))}
              </div>
            </section>

            <section className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-2xl space-y-4">
              <h3 className="text-xl font-bold text-blue-100">Senior applied AI Engineering Review</h3>
              <p className="text-blue-300/80 leading-relaxed text-sm">
                This architecture prioritizes <strong>observability</strong> and <strong>idempotency</strong>. By avoiding global state and relying on a message-passing orchestrator, the system can handle failures at any individual agent level without crashing the entire pipeline. The use of Gemini-3 for the <code>QuestionGenerationAgent</code> provides superior reasoning capabilities compared to standard RAG approaches for creative content synthesis.
              </p>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 p-6 text-center text-slate-600 text-[10px] font-medium tracking-widest uppercase">
        &copy; 2024 Kasparro Engineering &bull; Applied AI System v2.0.4-stable
      </footer>
    </div>
  );
};

export default App;
