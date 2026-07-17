---
title: "CCAR-F: Claude Certified Architect Foundations — 2026 Blueprint"
description: "An exam-day reference for the CCAR-F certification covering all five domains, the six exam scenarios, anti-patterns, trade-offs, and scenario triggers."
pubDate: 2026-07-04
tags: ["claude", "certification", "study-guide", "ai-architecture"]
---

*Everything I'd want a teammate to walk into the Claude Certified Architect exam knowing — the five domains, the scenarios that trip people up, and the reasoning behind each answer.*

| Questions | Duration | Fee | Pass mark | Scenarios | Proctored |
|---|---|---|---|---|---|
| 60 | 120 min | $125 USD | 720 / 1000 | 4 of 6 | Yes, closed-book |

## Exam Format & Domains

Launched March 12, 2026, the CCAR-F (sometimes informally written CCA-F) is Anthropic's first proctored technical certification. It validates that you can **design and ship production-grade Claude applications at enterprise scale**. Every question is scenario-based — a realistic production system with a problem, and you pick the architecturally correct fix among plausible alternatives. No simple recall questions.

### Five domains & weighting

| Domain | Weight | Core concepts |
|---|---|---|
| **1.** Agentic Architecture & Orchestration | 27% | Agentic loop, stop_reason, hub-and-spoke, subagents, hooks, task decomposition, session state |
| **2.** Tool Design & MCP Integration | 18% | MCP servers (resources/tools/prompts), JSON Schema, stdio vs SSE, tool descriptions, tool_choice |
| **3.** Claude Code Configuration & Workflows | 20% | CLAUDE.md hierarchy, skills, slash commands, plan mode, path-specific rules, CI/CD (-p flag) |
| **4.** Prompt Engineering & Structured Output | 20% | PRECISE (community mnemonic), few-shot, XML tags, JSON schemas, tool_use for extraction, validation-retry, Batch API |
| **5.** Context Management & Reliability | 15% | Context window, prompt caching, token budgets, CALM (informal study aid), escalation, error propagation, human-in-the-loop |

> **Scoring:** Scaled 100–1000, pass at **720**. Domain-weighted — you can't pass by acing one domain and ignoring others. 4 of 6 published scenarios are randomly selected per exam; each provides the context for ~15 questions.

## The 6 Exam Scenarios

You get **4 of these 6** on exam day — randomly selected. Study all six so you're not caught off guard. Each is a realistic production system that spans multiple domains.

### Scenario 1 — Customer Support Resolution Agent

- **What it tests:** Agent SDK + MCP tools + escalation triggers + error propagation
- **Key decisions:** When to escalate to a human, how to structure the agentic loop, how to handle policy gaps and ambiguity

### Scenario 2 — Code Generation with Claude Code

- **What it tests:** CLAUDE.md config + plan mode + slash commands + built-in tools
- **Key decisions:** Autonomous PR review/generation, skills with context: fork, how to structure project instructions

### Scenario 3 — Multi-Agent Research System

- **What it tests:** Coordinator-subagent orchestration + context isolation + structured passing
- **Key decisions:** Hub-and-spoke vs pipeline, parallel vs sequential, preventing context pollution

### Scenario 4 — Developer Productivity with Claude

- **What it tests:** Built-in tools + MCP servers + tool descriptions + tool distribution
- **Key decisions:** When to use existing MCP servers vs build custom, IDE integration patterns

### Scenario 5 — Claude Code for CI/CD

- **What it tests:** Non-interactive mode (`-p` flag) + structured output + independent review
- **Key decisions:** Headless pipeline design, `--output-format json`, when to use `--json-schema`

### Scenario 6 — Structured Data Extraction

- **What it tests:** JSON schemas + tool_use for extraction + validation-retry loops + batch processing
- **Key decisions:** Nullable fields to reduce hallucination, single-pass vs multi-pass, Message Batches API

## §1 — Agentic Architecture & Orchestration (27%)

The heaviest domain and the one most candidates find hardest. It covers the full lifecycle of the **agentic loop**, multi-agent coordination, hooks, task decomposition, and session management.

### The agentic loop — the single most important concept

The agentic loop lifecycle:

```
1. Send request (history + tools)
   → 2. Receive response
   → 3. Check stop_reason        ← the key step
   → 4. Execute tools (if tool_use)
   → 5. Append results (to history)
   → Loop back to 1
```

- `stop_reason === "tool_use"` → Claude wants to call tools → execute them → append results → loop back.
- `stop_reason === "end_turn"` → Claude is finished → **terminate the loop**.
- The `stop_reason` field is a **structured API signal** — the *only* reliable termination mechanism.

> **Anti-patterns (exam favorites):**
>
> - Parsing natural language to detect "done" / "task complete" — non-deterministic, fails silently.
> - Arbitrary iteration cap as the *primary* stopping mechanism — fragile, not semantically meaningful.
> - Checking assistant text content like `response.content[0].text.includes('complete')` — brittle string matching.

### Multi-agent orchestration — hub-and-spoke

The hub-and-spoke (coordinator-subagent) pattern:

```
            Coordinator (hub)
           /       |        \
  Web search   Doc analysis   Synthesis
   subagent      subagent      subagent
```

- The **coordinator** manages all inter-subagent communication, error handling, and routing. Subagents never talk to each other directly.
- **Context isolation:** each subagent gets only the context it needs — never the coordinator's full context (prevents context pollution).
- **Structured passing:** when handing findings between subagents, pass structured data (JSON with source, date, content), not plain text blobs — preserves attribution.
- **Minimal footprint:** subagents should be scoped to a single responsibility and return a focused result.

> **Anti-pattern:** Sharing the coordinator's full conversation history with every subagent. This causes **context pollution** — subagents get confused by irrelevant context and waste tokens.

### Agent SDK hooks

Hooks are **programmatic enforcement points** — Python/TypeScript functions invoked by the Agent SDK at specific loop points. They are *not* invoked by Claude (the model never sees them).

| Hook type | When it fires | Use for |
|---|---|---|
| `Pre-tool` | Before a tool is executed | Validate inputs, check permissions, block dangerous actions |
| `Post-tool` | After a tool returns | Log results, sanitize output, enforce PII rules |
| `Pre-message` | Before Claude's response is sent to the user | Content filtering, compliance checks, redaction |

> **Trade-off — hooks vs prompt-based guardrails:** **Hooks** = programmatic, deterministic, enforced by code, can't be jailbroken → use for *hard constraints* (compliance, PII blocking, permission checks). **Prompt instructions** = flexible, natural-language guidance, can be circumvented → use for *soft guidelines* (tone, style, preference). Default to hooks for anything safety-critical.

### Task decomposition & execution patterns

| Pattern | When to use | Trade-off |
|---|---|---|
| **Sequential** | Steps depend on prior results; order matters | Slower but safer; each step informed by the last |
| **Parallel** | Independent subtasks with no dependencies | Faster but costs more tokens; harder to debug |
| **Dynamic planning** | Task scope unclear upfront; agent decides next steps | Most flexible but needs guardrails to prevent drift |

> **Session management:** Know: `fork_session` creates an isolated branch (subagent work doesn't pollute the main conversation). Sessions can be **resumed** with conversation history. State can be **in-context** (conversation history) or **external** (database/file); external is more durable for long-running agents.

## §2 — Tool Design & MCP Integration (18%)

Tests your ability to design tool interfaces, write schemas Claude can reliably use, and build/integrate MCP servers.

### MCP (Model Context Protocol) — three primitives

| Primitive | What it is | Analog |
|---|---|---|
| `Tools` | Functions Claude can *call* — input schema, returns a result | POST / RPC |
| `Resources` | Data Claude can *read* — files, DB records, URIs | GET / read-only |
| `Prompts` | Reusable prompt templates exposed by the server | Templates |

### Tool schema design

- **JSON Schema** defines tool inputs. Every tool needs `name`, `description`, and `input_schema`.
- **Descriptions** are how Claude decides which tool to use. They must be precise, use distinct verbs, and have narrow scope. "Two good matches" and "no good match" are both failures of description quality.
- **Nullable fields** (e.g. `"type": ["string", "null"]`) reduce hallucination — Claude can explicitly return null instead of inventing a value.

> **Anti-patterns:**
>
> - Vague descriptions ("does stuff with data") — Claude can't select the right tool.
> - Overlapping tools with similar descriptions — Claude oscillates between them.
> - Missing required fields in the JSON Schema — Claude hallucinates the structure.
> - Giant monolithic tools that do many things — hard to select, hard to debug.

### Transport: stdio vs SSE

**stdio (standard I/O):**

- Subprocess on the same machine
- Lower latency, simpler setup
- Best for local development, CLI tools

**SSE (Server-Sent Events):**

- HTTP-based, works across network boundaries
- Supports real-time streaming
- Best for remote/cloud servers, team sharing
- **Note:** the standalone HTTP+SSE transport is **deprecated in favor of Streamable HTTP**, which is now the recommended remote transport. Treat "SSE" here as shorthand for HTTP-based remote transport.

> **Scenario trigger:** "Stream large file contents across a network" → **SSE**. "Local subprocess, same machine" → **stdio**. "Share MCP server across a team" → **SSE** (or Streamable HTTP).

### tool_choice parameter

| Value | Behavior | Use when |
|---|---|---|
| `auto` | Claude decides whether/which tool to call | Default; most scenarios |
| `any` | Claude must call a tool (any one) | Force tool use; extraction pipelines |
| `tool` (specific) | Claude must call this exact tool | Deterministic extraction; structured output |
| `none` | Claude cannot use any tools | Force text-only response |

### Structured error responses

- **Transient errors** (network timeout, rate limit) → retry with backoff.
- **Business errors** (record not found, invalid input) → return structured error to Claude so it can reason about next steps.
- **Permission errors** → escalate or inform the user; don't retry silently.

## §3 — Claude Code Configuration & Workflows (20%)

Tests your ability to configure **Claude Code** (Anthropic's agentic CLI/IDE tool) for production projects and team workflows.

### CLAUDE.md hierarchy & scoping

| Level | Location | Scope |
|---|---|---|
| `Enterprise` | Set by admin (operator) | All users in the org — hard constraints |
| `User / global` | `~/.claude/CLAUDE.md` | Personal preferences across all projects |
| `Project` | `./CLAUDE.md` (repo root) | Shared team conventions, committed to VCS |
| `Path-specific rules` | `.claude/rules/*.md` with YAML frontmatter | Activated only when editing matching file paths |

- Higher levels override lower: Enterprise > User > Project.
- An **operator** (enterprise admin) can set constraints that **users cannot override** — this is the trust hierarchy.
- `.claude/rules/` with path-scoped YAML frontmatter is the **recommended** approach over a monolithic CLAUDE.md — reduces irrelevant context.

### Skills, commands & built-in tools

| Concept | What it is |
|---|---|
| `Custom slash commands` | Defined in `.claude/commands/`; reusable workflows invoked by `/command-name` |
| `Skills (SKILL.md)` | Project- or user-scoped instructions for specific tasks (e.g. "how to create a docx"); `context: fork` in frontmatter runs the skill in an isolated sub-agent |
| `Built-in tools` | Read, Write, Edit, Bash, Search, List — Claude Code's native file/code tools |
| `MCP servers in Claude Code` | Configured in `.claude/mcp.json` (project) or `~/.claude/mcp.json` (user) |

> **Scenario trigger:** `context: fork` = the skill runs as an isolated sub-agent, preventing verbose output from polluting the main session. Use it for tasks that generate large output (code generation, data processing).

### Execution modes

| Mode | How it works | Use when |
|---|---|---|
| `Plan mode` | Claude plans the approach before executing; shows the plan for review | Complex tasks; want to review before committing |
| `Direct execution` | Claude executes immediately | Simple / well-understood tasks |
| `Non-interactive (-p flag)` | Headless mode, no user prompts; outputs to stdout | **CI/CD pipelines**; add `--output-format json` for structured output |

> **CI/CD (scenario 5):** For CI/CD: use `claude -p "review this PR" --output-format json --json-schema schema.json`. This gives deterministic, machine-parseable output. Remember: `-p` = non-interactive / print mode.

## §4 — Prompt Engineering & Structured Output (20%)

### The PRECISE mnemonic

A community mnemonic — not official Anthropic terminology — for a structured approach to designing system prompts. Know the acronym and what each component does:

| Letter | Component | What it does |
|---|---|---|
| P | **Persona** | Who Claude is ("You are a senior code reviewer") |
| R | **Role** | The function it performs |
| E | **Explicit instructions** | Clear, direct guidance |
| C | **Context** | Background information |
| I | **Instructions** | Step-by-step task rules |
| S | **Steps** | Ordered process to follow |
| E | **Examples** | Few-shot demonstrations of ideal output |

> **Key insight:** The **Examples** component is the behavioral anchor — it shows Claude what a correct response looks like in terms of length, tone, and structure. Without examples, Claude interpolates from pre-training, producing variance. This is often the fastest fix for inconsistent output.

### Core techniques

- **Few-shot prompting:** 2–3 input/output examples to anchor behavior. Place them after the instructions, before the actual task.
- **XML tags** for context structure: `<document>`, `<instructions>`, `<example>` — Claude respects these boundaries for parsing and retrieval.
- **Chain-of-thought / extended thinking:** for complex reasoning, let Claude think step-by-step before producing the final answer.
- **Prefilled assistant responses:** start the assistant turn with a partial response to steer format/structure.

### Structured output via tool_use

The exam's preferred pattern for extracting structured data: define a tool whose `input_schema` matches your desired JSON structure, then set `tool_choice` to force Claude to call it. This gives you validated, schema-conforming output.

> **Trade-off — tool_use extraction vs raw JSON prompting:** **tool_use with JSON Schema** = schema-validated, deterministic structure, nullable fields reduce hallucination → preferred for production. **Prompting for JSON** = simpler to set up, but output can drift from schema, requires post-processing validation → acceptable for prototyping only.

### Validation-retry loops

- After extraction, validate the output programmatically against the schema.
- If validation fails, send the error back to Claude with the original input and ask it to fix the specific issue.
- Cap retries (2–3) to avoid infinite loops on truly malformed input.

### Batch processing — Message Batches API

- For high-volume extraction (hundreds/thousands of documents), use the **Message Batches API** — asynchronous, 50% cheaper than real-time, 24-hour processing window.
- Trade-off: latency (not real-time) for cost savings — ideal for overnight/batch ETL.
- **Per-item error isolation:** if one item in a batch fails, the rest still succeed. Design for this.

## §5 — Context Management & Reliability (15%)

The lightest domain by weight but consistently underestimated. These questions are often the **easiest marks available** once you know the patterns — and the easiest to lose if you don't.

### Context window fundamentals

- **Context window = input tokens + output tokens.** Know the model limits: Opus (4.6/4.7/4.8), Sonnet (4.6/5), and Fable 5 = 1M-token context; only Haiku 4.5 = 200K.
- System prompt + conversation history + tool definitions + tool results all consume input tokens. They add up fast in agentic loops.
- **Progressive summarization:** as conversation grows, periodically summarize older turns and replace the raw history → keeps context under budget without losing critical information.
- **Conversation compaction:** similar idea, applied at the system level — compress older context to make room for new.

### Prompt caching

- Use `cache_control` breakpoints on large, static content blocks (system prompts, reference docs, tool definitions) that don't change between turns.
- **Cached reads are 90% cheaper** than uncached — massive savings in multi-turn agentic loops where the system prompt is repeated every turn.
- Cache has a **5-minute TTL by default**, with a **1-hour TTL option** also available — if the next request comes within the TTL window, you get the cached price.
- Trade-off: write cost to populate cache is 25% more than a normal read, so caching only pays off if you're making multiple requests against the same prefix.

> **Trade-off — when caching pays off:** Cache if: multi-turn conversation, repeated system prompt, agentic loop (many iterations). Don't cache if: one-shot request with unique content. The break-even is roughly **2+ requests** with the same cached prefix within 5 minutes.

### The CALM mnemonic

**Context-Aware LLM Management** — an informal study aid, not an official Anthropic concept — for managing what goes into the context window:

- **Curate:** only include information Claude actually needs for this turn.
- **Arrange:** put the most important information at the start and end of context (primacy/recency bias).
- **Limit:** enforce token budgets; summarize or truncate when approaching limits.
- **Monitor:** track token usage, cache hit rates, and quality over time.

### Error handling & escalation

| Error type | Pattern |
|---|---|
| Tool failure (transient) | Retry with exponential backoff; return structured error to Claude if retries exhausted |
| Reasoning failure | Self-evaluation / confidence scoring; if confidence below threshold → escalate |
| Environment failure | Graceful degradation; fall back to cached/stale data or inform user |
| Policy gap / ambiguity | **Human-in-the-loop** escalation — don't guess, ask |

> **Anti-pattern:** Using **self-reported confidence scores** as the sole escalation signal. Claude's self-assessed confidence is unreliable — it may be confidently wrong. Combine with programmatic validation (schema checks, business-rule assertions) for robust escalation.

## Model Selection & API Essentials

| Model | Strength | Use when |
|---|---|---|
| `Opus (largest)` | Highest reasoning, complex tasks, nuanced judgment | Hard reasoning, complex orchestration, low-volume high-stakes |
| `Sonnet (mid)` | Best balance of capability and cost; fast | Default for most production workloads, agentic loops, coding |
| `Haiku (smallest)` | Fastest, cheapest, good for simple tasks | Classification, routing, simple extraction, high-volume low-complexity |

> **Trade-off — model selection:** Bigger = better reasoning but slower and costlier. **Right-size to the task:** use Haiku for routing/classification, Sonnet for the main workload, Opus for the hardest reasoning steps. In multi-agent systems, subagents can use smaller models than the coordinator.

### API concepts the exam assumes

- **Messages API:** the core endpoint. Send a list of messages (system, user, assistant), receive a response with `content` blocks and `stop_reason`.
- **Streaming:** `stream: true` for real-time token delivery. Use for user-facing responses.
- **Extended thinking:** `thinking` blocks that let Claude reason before responding. Useful for complex tasks; costs extra tokens.
- **System / Operator / User hierarchy:** operator instructions (set by the app developer) can restrict what user prompts can override. Users can't elevate their own permissions beyond what the operator allows.

## Anti-Pattern Master List

The exam *loves* presenting anti-patterns as plausible answer choices. Memorize these — they're the wrong answers that look right.

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| Parse NL to detect loop end | Non-deterministic; Claude may paraphrase | Check `stop_reason === "end_turn"` |
| Arbitrary iteration cap as primary stop | Not semantically meaningful | Use `stop_reason`; iteration cap as safety net only |
| Share full coordinator context with subagents | Context pollution; wasted tokens | Pass only relevant, structured context |
| Vague / overlapping tool descriptions | Claude misroutes tool calls | Distinct verbs, narrow scope, precise descriptions |
| Self-reported confidence as sole escalation trigger | Claude can be confidently wrong | Combine with programmatic validation |
| Prompt-only guardrails for hard safety constraints | Can be jailbroken / circumvented | Use hooks for hard constraints |
| Monolithic CLAUDE.md with all rules | Irrelevant context for most edits | `.claude/rules/` with path-specific scoping |
| JSON via prompting alone in production | Output drifts from schema | `tool_use` with JSON Schema for structured extraction |
| Retry on all errors equally | Wastes tokens on permanent failures | Classify errors: transient → retry; business → return; permission → escalate |
| No token budget monitoring | Silent degradation as context grows | Track usage; progressive summarization; prompt caching |

## Trade-off Master List

Decisions the exam tests repeatedly. Know the trigger phrase → right answer.

| Decision | Option A | Option B | Pick A when | Pick B when |
|---|---|---|---|---|
| Loop termination | `stop_reason` | Iteration cap | Always primary | Safety net only |
| Guardrails | `Hooks (code)` | Prompt instructions | Hard safety constraints | Soft style/tone guidance |
| Execution | `Sequential` | Parallel | Steps depend on prior results | Independent subtasks |
| Transport | `stdio` | SSE | Local, same machine | Remote, team sharing, streaming |
| Structured output | `tool_use + schema` | Prompt for JSON | Production extraction | Quick prototyping only |
| Model size | `Haiku` | Opus | Simple / routing / high-volume | Complex reasoning / high-stakes |
| Caching | `Cache (90% cheaper reads)` | No cache | Multi-turn / agentic loop | One-shot unique requests |
| Batch vs real-time | `Batches API (50% off)` | Real-time Messages | Bulk ETL, overnight jobs | User-facing, low-latency |
| Context strategy | `Progressive summarization` | Full history | Long conversations / budgets | Short conversations / precision |
| CLAUDE.md structure | `Path-scoped rules` | Monolithic file | Large repos, mixed stacks | Tiny projects |
| Execution mode | `Plan mode` | Direct execution | Complex / high-risk changes | Simple / well-understood tasks |
| Skill isolation | `context: fork` | Inline execution | Verbose output / risk of pollution | Simple, brief tasks |

## Exam-Day Tips

- **Study all 6 scenarios** — you get 4 randomly. Map each to its primary domains: Customer Support → agentic loop + escalation; Code Gen → Claude Code config; Multi-Agent → hub-and-spoke + context isolation; CI/CD → `-p` flag + structured output; Data Extraction → tool_use + validation-retry.
- **stop_reason is the answer** for any loop-termination question. If an option says "parse the text for 'done'" — eliminate it.
- **Two answer choices will "work"** — pick the architecturally superior one. The exam rewards the production-grade, scalable, safe choice over the quick hack.
- **Hooks for hard constraints, prompts for soft guidance.** This distinction appears across multiple scenarios.
- **Context isolation is a theme.** Any time a subagent gets "too much" context, or a coordinator shares everything, it's the wrong answer.
- **Structured > unstructured.** Passing structured JSON between agents beats plain text. tool_use extraction beats prompting for JSON. Schema-validated output beats unvalidated.
- **Right-size the model.** Using Opus for classification or Haiku for complex reasoning are both wrong in scenario questions.
- **Prompt caching math:** 90% cheaper reads, 25% more expensive writes, 5-min default TTL (1-hour option available), break-even at ~2 requests. Know this for cost-optimization questions.
- **2 min/question average.** Don't overthink — recognize the pattern (it maps to one of the anti-patterns or trade-offs above), pick the answer, and move on. Flag and return if unsure.

> **Preparation resources (free):** **Anthropic Academy** (anthropic.skilljar.com): 13+ free courses covering all domains. Key courses: *Building Applications with the Claude API* (8+ hrs), *Claude Code in Action*, *Introduction to MCP*, *AI Fluency Framework*. Also: the official **Exam Guide PDF** (12 sample questions with explanations) and the official **60-question practice exam** on Skilljar. Score 850+ on the practice before booking the real exam. Note: Anthropic Academy remains the home for training courses, but as of mid-2026 the real exam is **scheduled and proctored via Pearson VUE (OnVUE)** — not booked through Skilljar/Anthropic Academy.

---

*Claude Certified Architect — Foundations (CCAR-F), 2026 Blueprint. Built from the official exam guide, Anthropic Academy materials, and community sources. Independent study aid — not affiliated with or endorsed by Anthropic. Verify current exam details at anthropic.skilljar.com.*
