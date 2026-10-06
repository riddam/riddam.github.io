---
title: "Harness Engineering: The Words for the Layer Around the Model"
description: "Skills, subagents, hooks, MCP, slash commands, plugins, scopes — what each part of an AI coding harness is actually for, organised by who pulls the trigger, and mapped across Claude Code and GitHub Copilot."
pubDate: 2026-10-06
tags: ["harness-engineering", "claude-code", "github-copilot", "ai-assisted-coding"]
cover: mirror
coverVariant: 2
draft: false
---

## When the words are wrong, the tool looks broken

Here is a failure I have watched happen to good engineers more than once.

Someone writes *always run the tests before committing* into their instructions
file. It works for a week. Then, deep into a long session, the agent commits
without running anything, and they conclude the tool is unreliable and go back to
doing it all by hand.

The tool was not unreliable. It did exactly what that layer does. An instructions
file is advisory — it is text the model reads and weighs against everything else
in its context, and on turn sixty of a complicated session it weighed it and
moved on. The instruction was filed in the wrong place. There is a layer in both
Claude Code and GitHub Copilot whose entire purpose is *this must happen every
time*, enforced by the harness rather than requested of the model, and the
sentence belonged there.

That is the shape of almost every complaint I hear about these tools. Not "the
model is not smart enough" but "I told it and it ignored me" — which is a
vocabulary problem wearing a reliability problem's clothes. You cannot file an
instruction correctly if you do not know what the filing cabinet looks like.

So this post is the filing cabinet. It rests on two claims. First, the layer
between your prompt and the model has a real structure, and it is small enough to
hold in your head once someone draws it. Second — and this is the part that makes
it worth an hour rather than a skim — that structure is now close to identical in
Claude Code and in GitHub Copilot, down to Copilot reading Claude's own files. I
checked every path and claim in this post against vendor documentation on
**6 October 2026**, and I link each one so you can check it again, because this
area moves monthly.

Three questions organise everything below, and every term arrives as an answer to
one of them:

1. **What does the model see, and when?**
2. **Who decides?**
3. **What can it reach?**

The second is the one that resolves the tests-before-commit failure, and if you
only remember one thing from this post, make it that one.

## What a harness is, and what it is not

A *harness* is everything between your prompt and the model's weights.

Concretely: the thing that assembles your context window, the list of tools it
tells the model exist, the loop that runs a tool call and feeds the result back,
the permission checks that sit in front of those calls, and the file and process
access that makes any of it useful. [Claude Code](https://code.claude.com/docs/en/overview)
is a harness. [GitHub Copilot](https://code.visualstudio.com/docs/copilot/customization/overview)
is a harness. So is whatever you build yourself on top of an SDK.

It is worth being precise about what it is *not*, because the two get blamed for
each other's failures. The model is the weights — what it knows, how well it
reasons, where its knowledge stops. Your code is your code. The harness is the
machinery in between, and it is the only one of the three you can change this
afternoon.

That is why the job has a new name. "Prompt engineering" described a world where
the lever that moved outcomes was the wording of a request. That world is gone:
the lever now is what is in context, who is allowed to put it there, and what the
loop may do once it starts. Anthropic's engineering team calls the discipline
[context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents),
and the wider version — context plus tools plus permissions plus the loop — is
what people mean by harness engineering.

The wording of the request still matters, and I have written up
[how I keep that side reliable](/engineering/ai-assisted-coding-playbook/)
separately. This post is about the machinery, not the sentence.

One honest note about that earlier post: it tells you to bake your
non-negotiables into an instructions file, and gives "every logic change ships
with a test" as an example. I would put that sentence somewhere else today, for
the reason the section after next explains. The advice to write the rule down
still stands. Where it goes is what I have changed my mind about.

## What the model sees, and when

The first question, and the one most people get wrong in the same direction.

A context window is a budget, not a container. Everything in it competes, every
turn, and nothing is free. Four different routes put something there:

- **Always loaded.** The system prompt, and your instruction files —
  [`CLAUDE.md`](https://code.claude.com/docs/en/memory) in Claude Code,
  [`.github/copilot-instructions.md` or `AGENTS.md`](https://code.visualstudio.com/docs/agent-customization/custom-instructions)
  in Copilot. These are in the prompt on turn one and on turn ninety.
- **Retrieved on demand.** A [skill](https://code.claude.com/docs/en/skills) is
  the clearest example: the harness always holds its name and one-line
  description, and loads the rest of the file only when the model decides it is
  relevant. A file read works the same way — it costs nothing until you need it.
- **Returned by tools.** The output of a command, the result of an MCP call, the
  contents of a page. You do not choose the size of these, which is what makes
  them dangerous.
- **Carried forward.** The conversation itself, plus whatever survives
  compaction when it gets too long. Compaction is lossy by construction. Anything
  you need to survive it belongs in a file, not in the chat.

The consequence is the single most actionable fact in this post: **everything
always-loaded taxes every turn.** A four-hundred-line `CLAUDE.md` is not a
thorough `CLAUDE.md`, it is a recurring charge on every request you will ever
make in that repo, and the model's attention to any one line of it falls as it
grows. The same arithmetic applies to tools. Nine connected MCP servers means
every one of their tool definitions sits in your prompt before you have typed a
word.

This is also the right place to understand **subagents**, which usually get filed
under delegation. Delegation is the use; the defining property is the *separate
context window*. A [subagent](https://code.claude.com/docs/en/sub-agents) starts
fresh, does its work in its own budget, and returns a report. That buys two real
things: isolation, so a long noisy search does not pollute your main thread, and
fan-out, so several of them can run at once.

It costs one real thing, and it is easy to forget. Only the report comes back.
Everything the subagent read, tried, and ruled out on the way is gone. Send one
to find out *which file handles retries* and you get an answer; send one to
*refactor the retry logic* and you lose the reasoning behind every judgement it
made. Delegate the search, keep the argument.

## Who decides

This is the spine. Every extension point in every harness answers to one of three
triggers, and almost all the confusion in this area comes from not noticing which
one you picked.

| Trigger | Parts | Guarantee | Right for |
| --- | --- | --- | --- |
| You, explicitly | Slash commands, prompt files | Runs when invoked, never otherwise | Deliberate, occasional work |
| The model, on judgement | Skills, subagents, tool calls | Usually fires, sometimes not | Expertise that applies *sometimes*, where the model can tell when |
| The harness, deterministically | Hooks, permissions, settings | Always, by construction | Anything with "always" or "never" in it |

**You, explicitly.** A [slash command](https://code.claude.com/docs/en/slash-commands)
is a saved prompt you fire by name. Copilot's equivalent is a
[prompt file](https://code.visualstudio.com/docs/agent-customization/prompt-files).
The guarantee is exact in both directions: it runs when you invoke it, and it
never runs when you do not. That precision is the whole point for work you want
to be deliberate about — a release checklist, a migration you run twice a year.
It is also the failure mode. A command you forget is a command that does nothing,
and "I keep forgetting to run it" is not a discipline problem, it is evidence you
chose the wrong trigger.

One correction before the rows, because the table makes them look like three
kinds of file and they are not. In Claude Code, custom commands
[have been merged into skills](https://code.claude.com/docs/en/slash-commands):
`.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both give you
`/deploy`. Which trigger a skill answers to is frontmatter — `user-invocable` and
`disable-model-invocation` — and Copilot's skills carry the same two fields. So
rows one and two are not different artefacts. They are the same artefact with a
different answer to *who is allowed to start this*, which is exactly why that
question is the one worth asking first.

**The model, on judgement.** A skill is a file of expertise the model pulls in
when it decides the situation calls for it; the decision is made from the skill's
name and description, which is why those two fields matter more than the body.
Subagents and ordinary tool calls work the same way. This trigger is the right
one for things that apply *sometimes*, where recognising the moment is itself a
judgement — how to write a migration in this codebase, how to debug a flaky test.
The guarantee is honest about itself: usually fires, sometimes does not. That is
not a defect. A skill that fired every time would just be a bigger system prompt,
and you would be back to paying for it on every turn.

**The harness, deterministically.** A [hook](https://code.claude.com/docs/en/hooks)
is a command the harness runs at a fixed point in the loop — before a tool call,
after an edit, when a session ends — with the ability to block the action. A
[permission rule](https://code.claude.com/docs/en/iam) is the same idea applied
to what the model may do at all. Neither involves the model's judgement. They are
code, executed by the harness, and they are the only parts of this list that come
with a guarantee rather than a tendency.

Which gives the rule this whole post exists to deliver:

> **If your instruction contains the word "always" or the word "never", the
> advisory layer is the wrong home for it.**

This is not my reading of the tools — it is what the vendors say about their own
advisory layers. Anthropic's memory documentation puts it flatly: Claude "treats
them as context, not enforced configuration," and if you want to block an action
"regardless of what Claude decides," you use a hook.

Wanting something to happen every time is a statement about determinism, and
determinism is what hooks and settings provide. Writing it into an instructions
file and hoping is the mistake, and it is a mistake that survives for weeks
because advisory layers work *most* of the time.

The honest counter-argument, because this rule is easy to over-apply: a
deterministic rule that fires too broadly gets switched off by the person it
annoys, and a disabled hook enforces nothing at all. Scope them narrowly — this
path, this file type, this tool. Prefer the hook that prints a warning to the one
that blocks, unless the thing it is stopping is genuinely unrecoverable. An
irritating guard has a half-life measured in days.

Which returns us to the engineer at the top of this post. *Always run the tests
before committing* is a row-three rule filed in row two. As a line in an
instructions file it is a suggestion competing with sixty turns of other context.
As a hook, it is a fact — and the
[spec-driven development post](/engineering/spec-driven-development-tdd-bdd-ai-agents/)
has the working version, a `Stop` hook that will not let a session finish while
the tests are red.

## What it can reach

Tools are the model's hands. Reading a file, running a command, editing code:
each one is a function the harness has described to the model and will execute on
its behalf. Everything the model does to the world, it does through one.

The [Model Context Protocol](https://modelcontextprotocol.io/) is how you lend it
somebody else's hands. An MCP server is a process exposing a set of tools over a
standard protocol — your ticket tracker, your observability platform, your cloud
provider's documentation — and both harnesses speak it:
[Claude Code](https://code.claude.com/docs/en/mcp) and
[Copilot](https://code.visualstudio.com/docs/agent-customization/mcp-servers)
both read a portable `.mcp.json` at the project root.

The cost is the part people discover late. An MCP server charges you before you
use it, because every tool it exposes has a name, a description and a parameter
schema, and all of that sits in the prompt from the first turn. A server with two
hundred tools is a large, permanent tax on a context you were already managing
carefully. The mitigations are worth knowing: toolsets, which let you enable a
subset; and deferred or searchable tools, where the harness holds only the names
and fetches a schema when the model actually wants one.

[Permissions](https://code.claude.com/docs/en/iam) are the layer that makes any of
this survivable. Allow and deny lists decide which tool calls run without asking,
which prompt, and which are refused outright. The honest framing is that an
allowlist is not a convenience setting — it is a written record of what you have
decided to stop looking at. That is a reasonable trade, and it is a trade; the
list deserves re-reading occasionally rather than growing by one entry every time
something interrupts you.

One rule I would not bend: anything touching production is read-only by default.
Give the agent the query, the logs and the dashboards; make changes land as code
through the pipeline that already has review and rollback. The harness is good at
investigation and the pipeline is good at safety, and there is no reason to make
either do the other's job.

## How it is packaged

Start with **scope**, because scope decides who else benefits from your work.
Both harnesses put the same artefact in different places depending on reach: a
skill in your home directory is yours alone, the same skill committed to the repo
belongs to everyone who clones it, and Copilot adds an organisation level that
pushes configuration across repositories. Nothing about the file changes. Where
you put it decides who gets it.

A **plugin** is a bundle of the things this post has already covered.
[In Claude Code](https://code.claude.com/docs/en/plugins) it is a directory with a
small manifest and any combination of `skills/`, `agents/`, `commands/`, `hooks/`
and MCP server declarations — and "any combination" is meant literally. Looking at
the ones installed on this machine: `superpowers` ships skills and hooks;
`code-simplifier` ships a single agent and nothing else; `code-review` ships one
command; `deploy-on-aws` ships skills, hooks and three MCP servers. Four plugins,
four different shapes. The word tells you how it was delivered, not what it does.

A [marketplace](https://code.claude.com/docs/en/plugin-marketplaces) is a git repo
with a manifest listing plugins. The official one carried 315 plugins when I
wrote this, 39 of them Anthropic-authored. Copilot has the same concept under the
name agent plugins. A team can run its own: publish your deployment runbooks and
house conventions as a plugin from a private repo, and installing it is one
command for everyone who needs it.

Which of them are actually worth installing is a question with a different shape
and its own post, coming next.

## How you work it

The last structural piece is how you drive the loop, and it is short because the
discipline lives elsewhere.

**Plan mode** separates deciding from doing: the harness reads and researches but
cannot edit, so you get a plan to approve before anything is written. **Background
tasks** let a long build or test run keep going while you work. **Parallel
subagents** fan independent work out across separate contexts, which is the
practical reason the context arithmetic from earlier matters. Claude Code's
[common workflows](https://code.claude.com/docs/en/common-workflows) documents
these; Copilot has its own plan agent, with the maturity caveats below.

The thread connecting them is where a human checkpoint goes. More autonomy is not
the goal — more *review-shaped* autonomy is. Approve the plan, then let it run;
read the diff, not the keystrokes. Where the checkpoints belong when an agent is
writing the code is the subject of my post on
[spec-driven development](/engineering/spec-driven-development-tdd-bdd-ai-agents/),
and I will not restate it here.

## The same map in Copilot

Everything above is worth learning because it is not one vendor's furniture.

The strongest evidence is not that the two harnesses have similar ideas — it is
that they have started reading each other's files.

Copilot's [agent skills](https://code.visualstudio.com/docs/agent-customization/agent-skills)
load from `.claude/skills/` and `~/.claude/skills/` as well as its own
directories. Its [custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents)
load from `.claude/agents` and `~/.claude/agents`. And both define a skill the
same way: a directory containing a `SKILL.md` whose description tells the model
when to use it.

Instructions files are the more interesting case, because the answer depends on
which agent you are running inside VS Code rather than on the editor. Copilot's
own agent host uses `.github/copilot-instructions.md` or `AGENTS.md`; the Claude
agent host uses `CLAUDE.md`; the local agent
[reads any of the three](https://code.visualstudio.com/docs/agent-customization/custom-instructions).
So "VS Code reads `CLAUDE.md`" is true, and "Copilot reads `CLAUDE.md`" is not —
a distinction worth keeping, because it tells you the convergence is happening at
the editor layer first.

All of that is documented behaviour in Copilot's own docs, checked on 6 October
2026, not a pattern I am inferring. Here is the mapping:

| Concept | Claude Code | GitHub Copilot |
| --- | --- | --- |
| Always-loaded project instructions | `CLAUDE.md` | `.github/copilot-instructions.md` or `AGENTS.md` (VS Code's local agent reads `CLAUDE.md` too) |
| Scoped instructions | `.claude/rules/*.md`, scoped by a `paths` glob | `*.instructions.md`, attached by an `applyTo` glob |
| Skills | `SKILL.md` under `.claude/skills/` | `SKILL.md` under `.github/skills/`, `.claude/skills/` or `.agents/skills/` |
| Subagents / custom agents | `.claude/agents/*.md` | `*.agent.md` under `.github/agents` or `.claude/agents` |
| User-invoked | Slash commands | `*.prompt.md` prompt files, migrating to agent skills |
| Deterministic | Hooks in settings | Hooks from `.github/hooks/*.json` (in preview) |
| External systems | MCP, `.mcp.json` | MCP, `.mcp.json` or `~/.copilot/mcp-config.json` |
| Packaging | Plugins and marketplaces | Agent plugins and a marketplace |
| Scopes | User, project, organisation | User, workspace, organisation |

Two rows deserve a note. Scoped instructions are the same idea in both, with
different spellings: Copilot's `*.instructions.md` carries an `applyTo` glob —
`applyTo: '**/*.py'` — while Claude Code's
[`.claude/rules/`](https://code.claude.com/docs/en/memory) files carry a `paths`
list in their frontmatter. Either way the file stays out of context until you
touch a file it matches, which is the cheapest win in this entire post for a repo
with several stacks in it. And Copilot's prompt files are documented as migrating
to agent skills; I am reporting that, not predicting when it finishes.

Now the limit, which matters more than the table. **The concepts port. The
configuration does not.** VS Code's documentation is explicit that supported
events, event names, matchers, command properties, tool names, payloads and
output decisions all differ between harnesses — Copilot's
[hooks](https://code.visualstudio.com/docs/agent-customization/hooks) use lower
camel case event names where the local harness uses PascalCase, and that is the
small end of the differences. You cannot copy a hook configuration across and
expect it to run. What you can copy is the judgement: knowing that this belongs in
a hook rather than an instructions file is the expensive part, and it transfers
intact.

Maturity is uneven, and worth checking rather than assuming. Custom agents,
sub-agents and the plan agent
[reached general availability in Copilot for JetBrains IDEs on 11 March 2026](https://github.blog/changelog/2026-03-11-major-agentic-capabilities-improvements-in-github-copilot-for-jetbrains-ides/);
agent hooks were still in public preview in that same release, and VS Code's
hooks documentation also carries a preview banner. Claude Code's hooks are not in
preview. If you are deciding what to build a team workflow on, that asymmetry
matters more than the table does.

The same shapes are turning up in other tools too, which is the real signal — this
is an industry converging on a vocabulary, not two products copying each other.

## Picking the right part

The whole post, as a list you can keep:

- Must happen every time → a hook or a setting.
- Should happen when relevant, and the model can tell → a skill.
- Needs its own context, or can run in parallel → a subagent.
- You will decide when → a slash command or a prompt file.
- Needs data or actions from outside the repo → an MCP server.
- True for everyone on the repo → project scope; true only for you → user scope.
- You want other teams to have it → package it.

If two rows both look plausible, the question that settles it is: what happens on
the day the model decides your instruction matters less than something else in
its context? If the answer is "something I cannot accept", you are in row one.

## What this does not fix

A good harness makes a capable model reliable. It does not make a weak model
capable, and — this is the part worth sitting with — it does not make a wrong
design right.

Everything above is machinery for getting intent executed faithfully. None of it
has an opinion about whether the intent was any good. The failure that survives
every hook, every skill and every permission rule is the one where the agent
builds exactly what you asked for and you asked for the wrong thing, quickly,
with tests. That failure gets cheaper to produce as the harness gets better, which
is an uncomfortable thing to be true.

The defence is upstream of all of this: decide what you are building, write it
down, and get the argument over with while it is still a document. That is the
subject of my post on spec-driven development, linked above, and it is the one
part of this job that has not been automated.

The vocabulary is worth an hour. It will save you the week you would otherwise
spend concluding the tool is broken.

## References and further reading

Everything below was checked on 6 October 2026. Both products ship monthly, so
treat any specific path as a pointer to the current page rather than a permanent
fact.

**Claude Code**

- [Overview](https://code.claude.com/docs/en/overview) and
  [common workflows](https://code.claude.com/docs/en/common-workflows), which
  covers plan mode and background tasks.
- [Memory and `CLAUDE.md`](https://code.claude.com/docs/en/memory) — the
  always-loaded layer.
- [Skills](https://code.claude.com/docs/en/skills) and
  [subagents](https://code.claude.com/docs/en/sub-agents) — the two parts the
  model triggers on its own judgement.
- [Slash commands](https://code.claude.com/docs/en/slash-commands) — the parts you
  trigger.
- [Hooks](https://code.claude.com/docs/en/hooks),
  [settings](https://code.claude.com/docs/en/settings) and
  [permissions](https://code.claude.com/docs/en/iam) — the deterministic layer,
  and the one most people under-use.
- [MCP](https://code.claude.com/docs/en/mcp) — connecting external systems.
- [Plugins](https://code.claude.com/docs/en/plugins) and
  [plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — how
  all of the above gets packaged and shared.
- [Output styles](https://code.claude.com/docs/en/output-styles), for the part of
  the system prompt you can shape yourself.

**GitHub Copilot**

Start with the [customization overview](https://code.visualstudio.com/docs/copilot/customization/overview),
which is the best single map of Copilot's extension points.

- [Custom instructions](https://code.visualstudio.com/docs/agent-customization/custom-instructions)
  — `copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md` and the `applyTo` glob on
  scoped instructions.
- [Agent skills](https://code.visualstudio.com/docs/agent-customization/agent-skills)
  and [custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents),
  including the `.claude/` directories both read.
- [Hooks](https://code.visualstudio.com/docs/agent-customization/hooks) — read this
  one before assuming a Claude Code hook will port.
- [MCP servers](https://code.visualstudio.com/docs/agent-customization/mcp-servers)
  — `.vscode/mcp.json`, the portable `.mcp.json`, and user-level configuration.
- [Creating custom agents for the cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)
  on GitHub Docs, and the
  [custom agents changelog](https://github.blog/changelog/2025-10-28-custom-agents-for-github-copilot/)
  for availability dates.

**Background**

- The [Model Context Protocol](https://modelcontextprotocol.io/) specification —
  the standard both harnesses implement.
- [`AGENTS.md`](https://agents.md/) — the cross-tool instructions format.
- Anthropic on
  [effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents),
  [agent skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills),
  and [Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices).
