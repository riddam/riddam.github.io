---
title: "Self-Service With Guardrails: Managing Repos and Pipelines as Data"
description: "How to let teams own their repositories and pipelines without the platform team becoming a ticket queue — declarative registries, validation that runs first, reconciliation with drift detection, and a lifecycle that includes retirement."
pubDate: 2026-08-05
tags: ["platform-engineering", "developer-productivity", "cicd", "tooling"]
cover: gate
---

There's a stage every platform team hits. You've built something good, teams want to use it, and now you spend your week creating repositories, adding people to groups, wiring webhooks, and setting up pipelines. You've become a ticket queue with extra steps.

The obvious fix is to give teams access and let them do it themselves. That works right up until you have a few hundred repositories, no two configured the same way, and no way to answer "which of these have branch protection?" without opening several hundred browser tabs.

Self-service and consistency look like opposites. They aren't — but getting both means the thing teams edit has to be *data*, not a UI.

This is the layer above the infrastructure. [Rebuilding the platform itself](/engineering/rebuilding-ci-cd-without-changing-platforms/) — agents, scaling, upgrades — is a separate story, and worth doing first: self-service on top of a platform you're afraid to touch just distributes the fear.

## Two registries, one source of truth

Everything starts from declarations in version control rather than state in a web interface:

- **A pipeline registry** — one entry per repository that has a pipeline, naming the owning teams, the hosting platform it deploys to, and the grouping it belongs to.
- **A repository registry** — the repositories themselves, their teams, their webhooks, their branch protection.

A team wanting a pipeline opens a pull request adding a few lines. That's the whole interface. The same reasoning I've written about for [configuration as data](/engineering/config-as-data-for-infrastructure-repos/) applies to organizational structure: the moment your source of truth is a UI, you have no history, no review, and no way to ask a question across the whole estate.

What matters is that the registry is *the* source of truth and not a description of one. Which means something has to continuously make reality match it — and something has to refuse entries that would break it.

The scale this operates at is 1,383 active projects and 2,452 build configurations. At that size, nobody is going to notice a hand-made exception, which is the real argument for the registry: not elegance, but the fact that no human review process survives four figures.

## Validate before you touch anything

The validation step runs first, and it exits non-zero on the first problem. Nothing reaches the CI server until every check passes.

Some checks are the obvious schema ones — every entry validates against a JSON Schema, and duplicate entries are rejected. Two others are worth calling out, because they're the ones I'd port to any similar system.

**Entries must be in alphabetical order.** This sounds like fussiness and isn't. An unordered append-only list means every team adding a pipeline in the same week touches the same last line, and they all conflict. Enforced ordering distributes the edits across the file, so a class of merge conflict simply stops occurring. It also makes review trivial — a diff is one line in a predictable place rather than a reordering nobody can read.

**The owning team must already exist.** A pipeline entry names the teams that own it, and validation checks those teams exist in the CI server before accepting the entry. Without this, the ownership field decays into free text — someone types a team name slightly wrong, nothing complains, and eighteen months later nobody can work out who owns a failing build. The check also tells the author exactly how to fix it and lists valid values, because a guardrail that blocks you without telling you what to do next is just an obstacle.

The rest are conditional-shape rules: a mobile entry must use the mobile team field and not the general grouping field; a package entry must declare a package type. These are the rules that would otherwise live in a wiki page nobody reads.

> Validation is where a convention becomes a guarantee. Anything you merely document, you don't have.

## Reconcile, don't create

The naive version of this tooling creates things. The useful version makes reality match a declaration, which is a different job.

For pipelines, the reconciliation is a set difference. Derive a deterministic identifier for each declared entry, list what actually exists on the server, and subtract: what's declared but missing gets created, and what exists in both gets synchronized. That's it — and because the identifier is derived from the declaration rather than stored, there's no mapping table to drift out of sync.

For repositories it's more involved, because there are several independent concerns and each one needs its own answer to "has this drifted?" — team membership, webhooks, branch protection. Each concern gets a drift check before its sync, so the tooling can report *what* changed rather than blindly reapplying everything.

That distinction matters more than it sounds. Blind reapplication is safe only if every write is genuinely idempotent, and it makes your logs useless — every run reports doing everything. Checking first means an ordinary run is quiet and an interesting run is loud.

> A drift check is the difference between infrastructure as code and infrastructure as a strongly worded suggestion.

## Dry run is a feature, not a flag

Every operation supports a dry run, and it's the default rather than an afterthought.

This is easy to dismiss as a nicety. It isn't — it's the reason anyone lets you run the thing at all. Tooling that reconciles an entire organization's repositories has a genuinely frightening blast radius: it can close pull requests, remove people from teams, and rewrite branch protection. Nobody should approve that on the promise that the logic is correct.

With a dry run, the change becomes reviewable before it's real. You get the same output you'd get from an apply, with every mutation described and none performed. It also makes the tooling *testable in production*, which is where the surprising inputs live.

The property worth designing for is that dry run isn't a separate code path. If it is, it will diverge from the real one and lie to you. It should be the same path with the writes suppressed at the boundary.

## Compliance as a report before it's a gate

There's a strong temptation, once you can check things automatically, to start blocking on them. That's usually the wrong first move.

The compliance checks run across every declared repository and answer a fixed set of questions: does it have a license file, does the default branch have protection, does it require at least one reviewer, has its team configuration drifted from the declaration, have its webhooks drifted, does it have unresolved critical dependency alerts, and has anyone committed to it in the last year. The output is a table for humans and JSON for anything else.

Reporting first does two things. It tells you how bad the situation actually is, which is almost never what you assumed. And it gives teams a chance to fix things before non-compliance starts failing their builds — which is the difference between a platform team that raised the bar and a platform team that broke everyone's Tuesday.

Once the report is mostly green, turning individual checks into gates is uncontroversial. Turning them into gates first is how platform tooling gets a reputation.

The enforcement did arrive, and where it landed is the part I'd repeat: inside the pipelines teams already own, rather than in a central gatekeeper. Policy-as-code for the rules that have to hold organization-wide, template linting for infrastructure definitions, language-specific linters and code-quality checks, and test pipelines that actually gate a merge.

> The same check feels like part of your build when it runs in your pipeline, and like an audit when it runs in someone else's cron job. Identical logic, opposite reception.

## Retirement is part of the lifecycle

Almost all platform tooling creates things. Very little of it retires them, which is why every organization accumulates repositories nobody has touched in three years and nobody is willing to delete.

So the same tooling detects staleness — no commits for a configurable window, excluding already-archived repositories — and sorts by how long it's been, with a recommendation attached based on whether anything is still open against it. A repository with no commits in two years and no open work is a different case from one with no commits and fourteen open pull requests.

And when something is retired, there's an actual sequence rather than a single archive call: close the open issues, close the open pull requests, remove branch protection, and leave a note in the README explaining what happened and where the work went. Archiving without that leaves a repository that looks abandoned rather than deliberately closed — and the person who finds it in two years can't tell the difference.

> Every tool that creates resources should know how to retire them. Otherwise you've automated accumulation.

## The unglamorous parts that make it usable

Three things that no design document ever includes and every real system needs.

**An audit log.** Every action records who ran it, what it targeted, what changed, whether it was a dry run, and whether it succeeded — as structured JSON, with the notable actions also posted to a chat channel. When someone asks why a webhook changed last Thursday, you want an answer that isn't archaeology. Recording the dry-run flag matters too, so a rehearsal is never mistaken for the real thing.

**Rate-limit awareness.** Anything that walks several hundred repositories through a provider API will hit rate limits. Knowing your remaining budget before starting a long reconciliation is the difference between a clean run and a job that dies two-thirds through having done two-thirds of the work.

**Account hygiene.** Enforcing multi-factor authentication and pruning outside collaborators are the least interesting features here and probably the highest-value per line of code. They're also the checks nobody performs manually, because doing so means reading a members list — which is exactly the sort of task that only ever happens if something scheduled does it.

## What this actually buys

Teams change a few lines of YAML in a pull request and get a working pipeline, and the platform team isn't in that path at all. That's the visible win, and it's the one people ask for.

The one worth more is that the estate becomes queryable. "Which repositories lack branch protection?" and "who owns this pipeline?" and "what has nobody touched in a year?" go from an afternoon of clicking to a command. You can't improve a property you can't measure across the whole estate, and a UI-shaped source of truth means you can never measure anything.

If I were starting this again, the order I'd build it in is: the registry, then validation, then dry run, then reconciliation, then reporting, and only then any gating. Every step in that order makes the next one safe. Done in the other direction, you get a tool that changes things nobody asked it to change — and once you've done that once, you'll never be allowed to run it again.
