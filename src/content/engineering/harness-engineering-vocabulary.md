---
title: "Harness Engineering: The Words for the Layer Around the Model"
description: "Skills, subagents, hooks, MCP, slash commands, plugins, scopes — what each part of an AI coding harness is actually for, organised by who pulls the trigger, and mapped across Claude Code and GitHub Copilot."
pubDate: 2026-10-06
tags: ["harness-engineering", "claude-code", "github-copilot", "ai-assisted-coding"]
cover: mirror
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

## What it can reach

## How it is packaged

## How you work it

## The same map in Copilot

## Picking the right part

## What this does not fix

## References and further reading
