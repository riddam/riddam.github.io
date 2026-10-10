---
title: "AI Foundations: Start Here"
description: "Four short series explaining how these systems actually work — what the model is doing, what your coding tool is doing around it, how to work with it day to day, and how to ship it in your own product. Which one to read depends on what surprised you."
pubDate: 2026-11-01
tags: ["ai-foundations", "model-internals", "harness-engineering"]
cover: personas
coverVariant: 2
draft: false
---

*This page exists because two posts went out that named a whole layer nobody had
written down, and the people who said they could not follow them were right.*

## Start from what surprised you

Pick the line that sounds like your week. Each goes straight to the post that
answers it. Each of those four also opens by naming what it assumes — usually
one earlier post — so you will know within a paragraph whether to read that one
first. Start where the question is; back up only when the post tells you to.

- **It said something confidently wrong** →
  [Why It Sounds Certain When It's Wrong](/engineering/why-it-sounds-certain-when-its-wrong/)
- **It forgot something I told it** →
  [The Context Window Is the Entire Memory](/engineering/the-context-window-is-the-entire-memory/)
- **It did something I did not expect** →
  [What Actually Happens When You Press Enter](/engineering/what-happens-when-you-press-enter/)
- **I do not know what MCP is** →
  [MCP, Explained Without the Spec](/engineering/mcp-explained-without-the-spec/)

If none of those is it, the four tracks below are sorted by who they are for,
not by difficulty. Read the one that matches you and stop.

## Track 1 — what the model is doing

**For any engineer who uses AI and has never looked inside.** Assumes you can
code and have used a chat assistant; nothing else. It is the broadest entry
point, and the other three tracks lean on it.

1. [What a Model Actually Is](/engineering/what-a-model-actually-is/) — tokens,
   one guess at a time, and why it never looks anything up.
2. [Why It Sounds Certain When It's Wrong](/engineering/why-it-sounds-certain-when-its-wrong/)
   — hallucination as the mechanism working as designed, plus what temperature does.
3. [The Context Window Is the Entire Memory](/engineering/the-context-window-is-the-entire-memory/)
   — stateless model, whole conversation resent every turn, and what "it forgot" means.
4. [How It Learned to Follow Instructions](/engineering/how-it-learned-to-follow-instructions/)
   — pretraining versus post-training, and why a system prompt works at all.
5. [Embeddings, and Why Retrieval Beats Memorising](/engineering/embeddings-and-why-retrieval-beats-memorising/)
   — vectors by hand, retrieval in thirty lines, then broken on purpose.
6. [Reading a Model Card Without Guessing](/engineering/reading-a-model-card-without-guessing/)
   — parameters, context length, price, speed, and benchmarks that mislead.

## Track 2 — what your coding tool is doing

**For developers using an AI coding tool daily who hit behaviour they cannot
explain** — the readers who got lost. Assumes track 1, or a willingness to
follow its links. Each post explains the mechanism in general terms first, then
shows the same thing concretely in Claude Code.

1. [What Actually Happens When You Press Enter](/engineering/what-happens-when-you-press-enter/)
   — the loop end to end, in about forty lines you can run.
2. [A Tool Call Is a Request, Not an Action](/engineering/a-tool-call-is-a-request-not-an-action/)
   — the model never runs anything; your harness decides whether to honour it.
3. [MCP, Explained Without the Spec](/engineering/mcp-explained-without-the-spec/)
   — what a server offers, which side your editor is on, what crosses the wire.
4. [Build a Small MCP Server and Watch the Wire](/engineering/build-a-small-mcp-server/)
   — a hundred lines, two read-only tools, every message logged.
5. [What Can Go Wrong With an MCP Server](/engineering/what-can-go-wrong-with-an-mcp-server/)
   — the attack classes the specification itself names, and what to check before installing one.
6. [Where the Context Comes From](/engineering/where-the-context-comes-from/)
   — your message is the smallest part of the request; compaction throws some of the rest away.
7. [Who Is Allowed to Do What](/engineering/who-is-allowed-to-do-what/)
   — asking an agent not to, versus actually stopping it.
8. [How a Skill Gets Found and Loaded](/engineering/how-a-skill-gets-found-and-loaded/)
   — the name and the description together are the trigger, and two similar ones fight.
9. [Subagents: Why Isolation Is the Point](/engineering/subagents-why-isolation-is-the-point/)
   — a fresh context with a narrow brief; parallelism is the side effect.
10. [The Whole Thing, Annotated](/engineering/the-whole-thing-annotated/) — one
    real session, first prompt to landed commits, every mechanism labelled where it fires.

## Track 3 — using it well, day to day

**For working developers, and the tech leads deciding whether this is worth it.**
Assumes nothing, and a non-engineer can follow it. Two posts:

1. [Is It Actually Making You Faster?](/engineering/is-it-actually-making-you-faster/)
   — what to measure, what the numbers hide, and how to run the comparison
   honestly for two weeks.
2. [Rolling It Out to a Team](/engineering/rolling-it-out-to-a-team/) — which
   configuration belongs to the repository rather than the person, who owns the
   shared skills, and the adoption failures that turn out to be social.

The track is short because most of its ground was already published, and those
two link out to it rather than restate it. Already written:

- [Making AI Coding Assistants Reliable: My Playbook](/engineering/ai-assisted-coding-playbook/)
  — how to prompt, ground and correct it. The prompting technique lives here and
  is never re-explained elsewhere.
- [Spec-Driven Development](/engineering/spec-driven-development-tdd-bdd-ai-agents/)
  — writing the spec first, and how that differs from TDD and BDD when an agent
  does the typing.
- [Learning to Build Software When AI Writes the Code](/leadership/learning-to-build-software-when-ai-writes-the-code/)
  — for anyone early in their career, and for whoever is reviewing their work.
- [Claude Code Plugins: What I Actually Use](/engineering/claude-code-plugins-what-i-actually-use/)
  — what to install, and what a plugin even is.

## Track 4 — putting AI in your own product

**For engineers shipping a feature with a model behind it.** A different reader
from the other three: not somebody using an AI tool on their work, but somebody
putting a model inside something other people will use. Assumes tracks 1 and 2.
It is the only track whose code you keep: an agent loop and an eval harness, both
written by hand, both short enough to read in one sitting.

All four are written and go live together; until they do, this is what is
coming, so you know whether to wait for it.

1. **Writing the Agent Loop Yourself** — a step budget, an approval gate,
   reasoning printed each turn, and the four ways it actually went wrong.
2. **Knowing Whether It Works** — twenty cases where the assertion is "good
   enough" rather than equality, and a real regression the suite catches.
3. **Making the Model Yours — and When Not To** — a real fine-tune, before and
   after, and what happened when I tried to teach it a fact instead of a manner.
4. **Running It in Production** — streaming, the two cost levers, a ceiling that
   trips, injection against a service, and what you may legally send.

The three guides —
[AI architecture](/guides/ai-architecture-master-guide/),
[training, fine-tuning and evaluation](/guides/model-training-finetuning-eval/)
and [MLOps and production operations](/guides/mlops-production-guide/) — are the
breadth-first catalogues this track points into. They assume you already know the
shape of the problem; these four posts are where you get it.

## The reference pages

Two pages here are not rungs on any ladder. They are meant to sit open in a
second tab while you read the rest.

- [The AI Vocabulary: Forty Terms That Unlock Everything Else](/engineering/the-ai-vocabulary/)
  — one sentence and one concrete example each, grouped by what you are trying to
  understand rather than alphabetically. Sendable on its own.
- [Harness Engineering: The Words for the Layer Around the Model](/engineering/harness-engineering-vocabulary/)
  — the same job for the layer *around* the model: skill, hook, subagent, plugin,
  permission mode, organised by who pulls the trigger. Track 2 uses these words
  without redefining them.

## What this series is not

It explains mechanisms and where they break. It is not a security assessment, not
a compliance framework, and not legal advice. If you are making a deployment
decision — whether a model may touch customer data, what has to be logged, who
signs it off — start instead with
[NIST AI 600-1](https://doi.org/10.6028/NIST.AI.600-1), the Generative AI Profile
of the AI Risk Management Framework (July 2024), and with
[a CISO's guide to agentic AI](https://claude.com/resources/articles/ciso-guide-to-agentic-ai)
(Anthropic, July 2026) for the organisational version of the same question.
Understanding the machine is a prerequisite for those conversations, not a
substitute for them.

## References and further reading

- [The AI Vocabulary](/engineering/the-ai-vocabulary/) — open this the first time
  a word in any post here stops you. It is the only page in the series designed
  to be read out of order.
- [Harness Engineering: The Words for the Layer Around the Model](/engineering/harness-engineering-vocabulary/)
  — one of the two posts whose readers asked for this series. Read it again after
  track 2 and it reads differently.
- [Claude Code Plugins: What I Actually Use](/engineering/claude-code-plugins-what-i-actually-use/)
  — the other one. It is a shopping list that assumes you know what the shop sells;
  track 2 is the shop.
- [Making AI Coding Assistants Reliable: My Playbook](/engineering/ai-assisted-coding-playbook/)
  — open this when you want technique rather than mechanism. Nothing in the four
  tracks repeats it.
- [Spec-Driven Development: How It Differs from TDD and BDD, and How to Run It with AI Agents](/engineering/spec-driven-development-tdd-bdd-ai-agents/)
  — open this for the workflow the tracks assume and never re-explain: how a
  spec, a plan and a task brief get an agent to build the thing you meant.
- [Learning to Build Software When AI Writes the Code](/leadership/learning-to-build-software-when-ai-writes-the-code/)
  — open this if the person you are handing this map to is early in their career,
  or is the one reviewing the output.
