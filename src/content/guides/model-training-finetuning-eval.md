---
title: "Model Training, Fine-Tuning & Evaluation — 2026 Guide"
description: "A practical 2026 reference covering fine-tuning techniques, alignment methods, training frameworks, data curation, distributed training, evaluation harnesses, model optimization, and the open-weight ecosystem."
pubDate: 2026-07-11
updatedDate: 2026-09-27
tags: ["fine-tuning", "llm-training", "evaluation", "machine-learning"]
cover: training
---

*A practical map of the model training and fine-tuning landscape — the techniques, tools, and trade-offs I reach for, minus the hype.*

## 01 — The Training Landscape

Model training in 2026 is a **stack of stages**, each with its own technique, data requirement, and compute profile. Understanding where each stage sits prevents the most common mistake: applying the wrong technique to the wrong problem. Training is one layer of a larger system, and [the AI architecture field guide](/guides/ai-architecture-master-guide/) is where I work out when to reach for it at all rather than prompting or RAG.

**The model training stack (stages run top → bottom):**

| Stage | Description | Cost & scale |
|---|---|---|
| **Pre-training** | Train from scratch on massive text corpus (trillions of tokens). Creates the base model. Only done by frontier labs. | $M+ · months · 1000s GPUs |
| **Continued pre-training** | Extend the base model with domain-specific corpus (medical, legal, code). Rare — needs large domain data. | $10K–100K+ · weeks |
| **Supervised fine-tuning (SFT)** | Train on (instruction, response) pairs to teach specific behavior, format, tone. The most common fine-tuning. | $100–5K · hours–days |
| **Preference alignment** | DPO / ORPO / RLHF on (chosen, rejected) pairs to refine quality, safety, style. Usually after SFT. | $100–5K · hours–days |
| **Post-training optimization** | Quantization, distillation, pruning to make the model smaller/faster/cheaper for inference. | $0–100 · minutes–hours |

> **Where you fit in:** Most practitioners work at the **SFT + alignment** layers. Pre-training and continued pre-training are frontier-lab territory (Anthropic, OpenAI, Meta). Your job as an AI architect is to know which layer solves your problem and which technique to apply at that layer.

## 02 — Fine-Tuning Techniques

The central question: **how many parameters do you actually need to change?** The answer determines your compute cost, data requirement, and quality ceiling.

| Technique | What it changes | VRAM | Data needed | When to use |
|---|---|---|---|---|
| Full fine-tuning | All model weights | Very high (~16 bytes/param ≈ 8× fp16 model size) | 10K+ examples | Deep domain adaptation; rarely needed for most tasks |
| LoRA | Small low-rank adapter matrices (0.1–1% of params) | Moderate (model + adapters) | 500–5K examples | **Default for 2026** — best quality/cost ratio |
| QLoRA | Same as LoRA but base model stays 4-bit quantized | Low (~50–70% less than LoRA) | 500–5K examples | Memory-constrained (single GPU, consumer hardware) |
| DoRA | LoRA + weight decomposition (magnitude + direction) | Slightly more than LoRA | 500–5K examples | When LoRA quality isn't quite enough; marginal improvement |

> **The 2026 default:** **QLoRA SFT** is the starting point for almost every fine-tuning project. LoRA when you have GPU headroom and need maximum throughput. Full fine-tuning only when adapters demonstrably can't close the quality gap (rare). Unsloth's optimized kernels make QLoRA only slightly slower than LoRA while using about 4x less VRAM.

### How LoRA works (the key insight)

- Instead of updating a huge weight matrix W (billions of params), LoRA freezes W and trains two small matrices A and B such that the update is **ΔW = A × B**.
- **Rank r** controls adapter size: r=8 is common, r=16–64 for harder tasks. Higher rank = more capacity but more compute.
- At inference, merge the adapter into the base model (zero overhead) or keep separate (swap adapters per task).
- QLoRA adds 4-bit NF4 quantization on the frozen base — gradients flow through dequantized weights during training, but the base never leaves 4-bit in memory.

**LoRA vs QLoRA vs full fine-tuning — VRAM for a 70B model:**

| Method | VRAM | Hardware |
|---|---|---|
| Full fine-tune | ~1.1 TB VRAM (mixed-precision Adam ≈ 16 bytes/param — 2 weights + 2 grads + 8 optimizer + 4 fp32 master ≈ 8× fp16 size); ~16+ H100s, or ~400–600 GB with ZeRO-3/offload | Multi-GPU required |
| LoRA (16-bit base) | ~140 GB (base in 16-bit + small adapters + optimizer for adapters only) | 2–4 GPUs |
| QLoRA (4-bit base) | ~48 GB (base in 4-bit + adapters in 16-bit) | Single H100 (80GB) |

## 03 — Alignment & Preference Tuning

After SFT teaches the model *what* to do, alignment teaches it *how well* to do it — ranking outputs by human preference.

| Technique | How it works | Data format | When to use |
|---|---|---|---|
| RLHF | Train a reward model from preference pairs → optimize LLM with PPO against the reward | (prompt, chosen, rejected) + reward model | Frontier alignment; most complex but most expressive. Labs only. |
| DPO | Direct Preference Optimization — skips the reward model; optimizes directly on preference pairs | (prompt, chosen, rejected) | **2026 default** for preference tuning. Simpler than RLHF, competitive quality. |
| ORPO | Merges SFT and DPO into one stage — simplest pipeline | (prompt, chosen, rejected) | When you want the simplest possible pipeline and have preference data |
| KTO | Kahneman-Tversky Optimization — works with just thumbs-up/thumbs-down (no paired comparisons needed) | (prompt, response, good/bad label) | When you have binary feedback, not pairwise preferences |
| GRPO | Group Relative Policy Optimization — critic-free RL (introduced in DeepSeekMath, the method behind DeepSeek R1) using group-relative advantages; works with learned reward models *or* verifiable functions | (prompt, group of responses, reward) | General RL post-training; reasoning tasks. RLVR (verifiable rewards — math, code, logic) is one common application, not the only one |
| SimPO / IPO | Variants of DPO addressing edge cases (length bias, BT-model assumption) | Same as DPO | When vanilla DPO produces length-biased or unstable results |

> **The practical default:** For most fine-tuning projects, **SFT alone is enough**. Add **DPO/ORPO** if you have preference pairs and want to refine quality/safety. Reach for **GRPO** for critic-free RL post-training — most commonly reasoning tasks with verifiable rewards (RLVR), though it also works with a learned reward model. RLHF is the frontier lab's tool — most teams don't need it.

**Alignment technique decision tree:**

| Question | Answer |
|---|---|
| Do you have **paired preference data** (chosen vs rejected)? | → DPO (default) or ORPO (simpler) |
| Only **binary feedback** (thumbs up/down), no pairs? | → KTO |
| Want **critic-free RL** — a verifiable reward function (math, code tests) or a learned reward model? | → GRPO |
| Need **maximum alignment control**, budget for reward model training? | → RLHF (PPO) |
| No preference data at all? | → SFT only (generate synthetic preferences if needed) |

## 04 — Training Frameworks & Tools

| Framework | What it is | Best for | 2026 status |
|---|---|---|---|
| HF TRL (v1.0+) | Hugging Face's unified post-training library: SFTTrainer, DPOTrainer, GRPOTrainer, KTOTrainer, RLOOTrainer, RewardTrainer (ORPO sits in trl.experimental) | Full control over the training loop; the "standard library" for fine-tuning | v1.x (v1.0 shipped March 2026) — the default |
| Unsloth | Optimized kernels for LoRA/QLoRA — about 2x faster with up to ~70–80% less VRAM than a standard HF setup (vendor figures) | Single-GPU fine-tuning; the fastest path to a working fine-tune | Separate library that plugs into TRL's trainers |
| Axolotl | Config-driven (YAML) fine-tuning framework — supports LoRA, QLoRA, full, DPO, GRPO, ORPO, reward modeling | Multi-GPU pipelines; teams wanting declarative configs over code | v0.19 (Sep 2026); active community |
| torchtitan | PyTorch-native platform for training generative models, from the PyTorch team (pre-training plus SFT) | Teams wanting no HF dependency; pure PyTorch ecosystem | Where PyTorch is consolidating LLM training; torchtune stopped active development in 2025 |
| MLX-LM | Apple Silicon native — LoRA, QLoRA, DoRA on Mac | Local fine-tuning on Mac (a 7B model fits in 32 GB; bigger models need proportionally more unified memory) | Mature for Apple Silicon users |
| DeepSpeed | Distributed training library (from Microsoft, now a PyTorch Foundation project) — ZeRO stages 1/2/3 for memory optimization | Multi-GPU/multi-node training; large models that don't fit on one GPU | Essential for full fine-tuning at scale |
| FSDP (Fully Sharded Data Parallel) | PyTorch's native distributed training — shards model across GPUs; FSDP2 (fully_shard) is the current API | Multi-GPU training without DeepSpeed dependency | Built into PyTorch; simpler than DeepSpeed |

> **Starter recommendation:** **Unsloth + TRL** for single-GPU QLoRA fine-tuning (fastest, easiest). **Axolotl** for multi-GPU or when you want YAML configs. **DeepSpeed/FSDP** when models don't fit on a single GPU. **torchtitan** if you want pure PyTorch without HF abstractions.

### Supporting tools

| Tool | Function |
|---|---|
| Hugging Face Transformers | Model loading, tokenization, inference — the foundation everything else builds on |
| Hugging Face PEFT | LoRA/QLoRA/DoRA adapter management (save, load, merge adapters) |
| bitsandbytes | 4-bit/8-bit quantization for loading large models on limited VRAM |
| Weights & Biases (W&B) | Experiment tracking, hyperparameter sweeps, model comparison dashboards |
| MLflow | Experiment tracking + model registry (open-source alternative to W&B) |
| Hugging Face Hub | Model hosting, sharing, versioning — the "GitHub for models" |

## 05 — Data Preparation & Curation

Data quality is the single biggest determinant of fine-tuning success. **5K well-curated examples consistently outperform 50K noisy ones.**

### Data formats by training type

| Training type | Data format | Example |
|---|---|---|
| SFT (instruction tuning) | `{"instruction": "...", "response": "..."}` or chat format with system/user/assistant turns | `{"instruction": "Summarize this email", "response": "The email discusses..."}` |
| DPO / ORPO | `{"prompt": "...", "chosen": "...", "rejected": "..."}` | Two responses to the same prompt, one preferred |
| GRPO | `{"prompt": "...", "response": "...", "reward": 0.85}` | Response + verifiable reward score |
| Continued pre-training | Raw text documents (no instruction format) | Domain-specific corpus (medical literature, legal filings) |

### Data quality checklist

- **Deduplication:** remove exact and near-duplicate examples — duplicates cause memorization, not generalization.
- **Contamination check:** ensure evaluation data is not in the training set. This is the #1 cause of inflated metrics.
- **Quality filtering:** remove low-quality, off-topic, or contradictory examples. Use an LLM judge to score quality if manual review is impractical.
- **Mix base data (5–20%):** include general instruction data during domain SFT to prevent catastrophic forgetting — the model losing its general capabilities.
- **Balance:** ensure class/topic distribution matches what you want the model to learn, not just what's easiest to collect.
- **Privacy:** PII redaction before training. Differential privacy if fine-tuning on user data.

### Synthetic data (the 2026 shortcut)

Use a frontier model (Claude Opus 5.5, GPT-6 Astra) to generate training data — instruction-response pairs, preference comparisons, or domain examples. **Standard practice in 2026**, but requires evaluation: always validate synthetic data quality before training on it.

> **Common mistake:** Fine-tuning on synthetic data generated by the same model you're fine-tuning → model collapse (the model learns to imitate its own biases). Use a **stronger** model to generate training data for a **weaker** model (distillation pattern).

## 06 — Distributed Training

When a model doesn't fit on one GPU, or you need faster training, you distribute across multiple GPUs/nodes.

| Strategy | What it does | Use when |
|---|---|---|
| Data Parallel (DDP) | Each GPU has a full model copy; data is split across GPUs. Gradients averaged. | Model fits on one GPU but you want faster training |
| FSDP (Fully Sharded) | Shards model weights, gradients, and optimizer states across GPUs | Model doesn't fit on one GPU; PyTorch native |
| DeepSpeed ZeRO-1/2/3 | Progressive memory optimization — ZeRO-3 shards everything | Very large models; maximum memory efficiency |
| Tensor Parallelism | Splits individual layers across GPUs (within a node) | Very large layers that don't fit on one GPU even sharded |
| Pipeline Parallelism | Splits model layers sequentially across GPUs | Very deep models; used alongside tensor parallelism |

### Key training optimizations

- **Mixed precision (bf16/fp16):** train in half precision — 2x throughput, half memory, minimal quality loss. bf16 preferred (no loss scaling needed).
- **Gradient checkpointing:** recompute activations during backward pass instead of storing them — saves a large share of activation memory at roughly a 20% speed cost.
- **Flash Attention (2/3/4):** memory-efficient attention computation — essential for long sequences. Built into most frameworks. **FlashAttention-2** is still the stable default; **FlashAttention-3** (Hopper, FP8 forward pass) and **FlashAttention-4** (Hopper and Blackwell) are the newer kernels, both still in beta.
- **Gradient accumulation:** simulate larger batch sizes by accumulating gradients over multiple micro-batches before updating.
- **Checkpointing:** save model state regularly during training — critical when using spot/preemptible GPUs that can be interrupted.

## 07 — Evaluation Harnesses & Benchmarks

**The eval harness must exist before training starts.** Without it, you cannot tell if a checkpoint is better than the last. This is the most under-invested area in most fine-tuning projects.

### Evaluation frameworks

| Framework | What it does | Best for |
|---|---|---|
| lm-evaluation-harness (EleutherAI) | Standardized benchmark suite: MMLU, GSM8K, HumanEval, HellaSwag — 60+ benchmarks with hundreds of subtasks | Base model benchmarking; academic comparison. No substitute. |
| DeepEval | pytest-native LLM eval — 50+ metrics: hallucination, bias, toxicity, RAG faithfulness, agentic and multi-turn | CI/CD integration; broad application eval; quality gates that block deploys |
| RAGAS | RAG-specific evaluation: context precision, context recall, faithfulness, response relevancy | RAG pipeline evaluation; a widely used choice for retrieval quality |
| Promptfoo | YAML-driven multi-model comparison + red-teaming (150+ attack plugins); now part of OpenAI, still MIT open source | Prompt/model selection; security testing; CLI-first workflow |
| LLM-as-judge | Use a stronger model to evaluate a weaker model's output against rubrics | Scalable proxy for human eval; runs on 5–10% of production traces |
| Human evaluation | Domain experts rate outputs on rubrics (accuracy, helpfulness, safety) | Gold standard; expensive; use for final validation |

> **The evaluation stack for fine-tuning:** Before training: **lm-evaluation-harness** baseline on the base model. After each checkpoint: **task-specific metrics** (exact match, JSON validity, tool-call accuracy) + **LLM-as-judge** (faithfulness, instruction following, tone). Before production: **human eval** on a sample + **Promptfoo red-teaming**. In production: **RAGAS** for RAG quality + **DeepEval** as CI gate.

### Key benchmarks to know

| Benchmark | What it measures |
|---|---|
| MMLU | Broad knowledge across 57 subjects. Historically the headline general-capability metric, but **saturated by 2026** — **MMLU-Pro** and **GPQA** replaced it, and GPQA is now near its ceiling too; frontier launches lead with **Humanity's Last Exam** and agentic suites (Terminal-Bench, OSWorld) instead |
| GSM8K | Grade-school math reasoning |
| HumanEval / MBPP | Code generation and programming ability |
| MTEB | Embedding model quality (the benchmark for RAG embedding models) |
| MT-Bench / Arena-Hard-Auto | Conversation quality on multi-turn and hard prompts (LLM-as-judge scored); MT-Bench is no longer maintained, Arena-Hard-Auto v2 is its successor |
| IFEval | Instruction following accuracy (does the model do exactly what you asked?) |
| TruthfulQA | Whether the model repeats common misconceptions and falsehoods instead of the true answer (now largely retired from leaderboards) |

> **Eval traps to avoid:**
>
> - Evaluating only on the task you fine-tuned for — check for **catastrophic forgetting** on general benchmarks too.
> - Training data contaminating eval set — always hold out eval data *before* any training begins.
> - Trusting a single metric — use task metrics + LLM judge + human eval together.
> - Evaluating once — evaluate at every checkpoint and after every data change.

## 08 — Model Optimization (Post-Training)

After training, make the model **smaller, faster, and cheaper** for inference.

| Technique | What it does | Speed-up | Quality impact |
|---|---|---|---|
| Quantization (INT8) | Reduce weight precision from 16-bit to 8-bit | ~2x throughput, ~50% memory | Minimal (< 1% accuracy loss typically) |
| Quantization (INT4 / GPTQ / AWQ) | Reduce to 4-bit with calibration | Up to ~3x faster decoding, ~75% memory | Slight (~1–3% loss); good enough for most production |
| GGUF (llama.cpp format) | Optimized quantized format for CPU/local inference | Runs on CPU/Mac | Varies by quant level (Q4_K_M is the sweet spot) |
| Distillation | Train a small model to mimic a large model's outputs | 10–100x smaller/faster | Depends on task; can retain 90%+ of quality on narrow domains |
| Pruning | Remove unnecessary weights/neurons | 1.5–3x faster | Moderate; less common than quantization in 2026 |
| Speculative decoding | Small model drafts tokens, large model verifies — net faster generation | 2–3x generation speed | Identical output (verification ensures quality) |

> **Trade-off — quantization level:** **INT8:** nearly lossless, 2x savings — the safe default. **INT4 (GPTQ/AWQ):** 4x savings with slight quality loss — production-viable for most tasks. **Aggressive (2-3 bit):** large quality drop — only for latency-critical, accuracy-tolerant use cases. Always evaluate your specific task after quantization — generic benchmarks don't predict domain-specific impact.

## 09 — Open-Weight Ecosystem

The base models you'll fine-tune. "Open weights" means you download the weights and run/fine-tune them yourself.

| Family | Provider | Sizes | Strengths | License |
|---|---|---|---|---|
| Llama 4 | Meta | Scout (109B MoE), Maverick (400B MoE), 17B active each | Huge fine-tuning ecosystem; since overtaken on capability (Meta's newest open model is the 30B Muse Glimmer, Apache 2.0) | Llama 4 Community License |
| gpt-oss | OpenAI | 20B, 120B (MoE) | Reasoning; 120B runs on a single 80 GB GPU | Apache 2.0 |
| Qwen 3.5 / 3.8 | Alibaba | 0.8B–397B (3.5); 27B dense up to 2.4T MoE (3.8) | Widest size range; thinking mode | Apache 2.0 (most sizes; the largest 3.8 models use Qwen's own licenses) |
| Gemma 4 | Google | E2B, E4B, 12B, 26B MoE, 31B | Efficient; multimodal (vision, plus audio on E2B, E4B and 12B) | Apache 2.0 |
| Mistral 3 family | Mistral AI | Ministral 3 (3B/8B/14B), Small 4 (119B MoE), Large 3 (675B MoE) | EU-hosted; multilingual; fast inference | Apache 2.0 (Medium 3.5: modified MIT) |
| DeepSeek V4 | DeepSeek | V4-Flash (284B MoE), V4-Pro (1.6T MoE) | Reasoning modes built in; 1M context; cost-efficient | MIT |
| Phi-4 | Microsoft | 14B | Small but punches above weight; good for edge | MIT |

> **How to choose a base model for fine-tuning:** **Start with the smallest model that does well on your task with good prompting.** Fine-tuning a 7B model is 10x cheaper and faster than fine-tuning a 70B. If 7B SFT isn't good enough, try 14B before jumping to 70B. Benchmark the base model with prompting first — if it's already 90% there, fine-tuning the last 10% is much cheaper than starting from a weak base.

## 10 — The Complete Training Workflow

**End-to-end fine-tuning workflow:**

1. **Define task** — set success metrics
2. **Build eval harness** — *before* training
3. **Curate data** — 500–5K examples
4. **Baseline** — evaluate the base model
5. **SFT (QLoRA)** — train + checkpoint
6. **Evaluate** — vs baseline
7. **Alignment?** — DPO if preference data
8. **Evaluate again** — plus catastrophic forgetting check
9. **Merge adapter** — and quantize (INT4/8)
10. **Deploy** — vLLM / cloud endpoint
11. **Monitor** — drift + quality → retrain as needed

Steps 10 and 11 are where this guide hands off: serving, drift detection, and the retraining loop are the subject of [MLOps and AI production operations](/guides/mlops-production-guide/).

> **The golden rule:** Steps 2 and 6 (evaluation) are the most important. Training without evaluation is like flying without instruments — you have no idea if you're improving or crashing. Build the eval harness **before** you write a single line of training code.

## 11 — Cloud Training Services

| Service | Provider | Best for |
|---|---|---|
| SageMaker AI Training | AWS | Managed training jobs + HyperPod for fault-tolerant large runs; deepest GPU selection |
| Gemini Enterprise Agent Platform Managed Training (formerly Vertex AI Training) | GCP | Managed training + TPU access; tight BigQuery integration |
| Azure ML compute | Azure | Managed training; ND-series GPUs (H100 through GB300); reservations and savings plans |
| Lambda Cloud / RunPod / Vast.ai | GPU clouds | Cheapest GPU hourly rates; no managed MLOps (you manage everything) |
| Google Colab Pro | Google | Quick experiments; T4/L4/A100-class GPUs for prototyping (types vary by plan and availability); not for production training |
| Managed fine-tuning APIs | Together, Fireworks, Gemini tuning (Agent Platform) | Upload data → get fine-tuned model endpoint; zero infra management |

> **Trade-off — managed fine-tuning API vs self-managed:** **Managed API** (Together, Fireworks, Gemini tuning) = upload data, get model, zero infra — but limited control over hyperparameters, training loop, and model architecture. (OpenAI is winding its fine-tuning platform down: closed to new organizations since May 2026, no new jobs for anyone from January 2027.) **Self-managed** (Unsloth on cloud GPU) = full control, cheaper per hour — but you own the entire training stack. Start with managed for validation; switch to self-managed for production optimization.

## 12 — Trade-off Master Reference

| Decision | Option A | Option B | Default |
|---|---|---|---|
| Fine-tuning method | QLoRA (memory-efficient) | LoRA (higher throughput) | QLoRA unless you have GPU headroom |
| Full fine-tune vs adapter | Full (all params) | LoRA/QLoRA (adapters only) | Adapters unless proven insufficient |
| Alignment technique | DPO (pairs needed) | SFT only (no pairs) | SFT alone; add DPO if you have preference data |
| Training framework | Unsloth + TRL (easiest) | Axolotl (YAML, multi-GPU) | Unsloth for single-GPU; Axolotl for multi-GPU |
| Data quality vs quantity | 5K curated examples | 50K noisy examples | Quality wins — always curate first |
| Base model size | 7B (cheapest to fine-tune) | 70B (most capable) | Smallest model that works on your task |
| Quantization level | INT8 (nearly lossless) | INT4 (more savings) | INT8 default; INT4 if memory/cost critical |
| Synthetic vs real data | Synthetic (frontier-generated) | Real (human-created) | Mix both; always validate synthetic quality |
| Eval approach | Automated (LLM judge) | Human evaluation | Automated for iteration; human for final validation |
| Distributed strategy | FSDP (PyTorch native) | DeepSpeed ZeRO | FSDP for simplicity; DeepSpeed for maximum memory efficiency |
| Open weights vs API fine-tuning | Self-hosted (full control) | API (Together/Fireworks/Gemini) | API for validation; self-hosted for production control |
| Training hardware | Cloud GPU (H100/B200) | Cloud TPU (Trillium/Ironwood) | GPU for flexibility; TPU for large-scale cost efficiency |

---

*Built from current frameworks, research papers, and production practice. Independent reference — not affiliated with any vendor. Framework versions and model availability change rapidly; verify before starting a training run.*
