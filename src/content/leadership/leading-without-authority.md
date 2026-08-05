---
title: "Leading Without Authority: Lessons from the Staff Engineer's Chair"
description: "What it takes to lead engineers when you have no reports — earning a mandate, writing ADRs that land, building a bench of complementary working styles, spending your vetoes, and encoding influence into defaults."
pubDate: 2026-08-05
tags: ["leadership", "staff-engineer", "influence", "communication"]
cover: lever
---

> The org chart tells you who has to listen to you. It says nothing about who will.

I've written before that [leadership is influence rather than authority](/leadership/core-principles-every-corporate-leader-should-know/). That's easy to say and easy to agree with. It's also the kind of claim usually illustrated with chief executives — people who had plenty of authority and chose to lead with something better.

The senior individual-contributor track is where the claim gets tested honestly. You're promoted for impact across an organization and given nobody to direct. Nobody's performance review is in your hands. You can't reassign anyone, you can't set anyone's priorities, and when you're right and get ignored, there is no lever to pull.

Here's what I've found actually works.

## 1. 🧭 Authority is a shortcut you no longer have

A manager can spend authority. Not often, and not for free, but the option exists. Without it, you earn a mandate one decision at a time — and the way you earn it is by doing the work that makes the answer hard to argue with.

A CI/CD platform decision taught me this better than anything else. The organization ran a self-hosted CI server, and the question was whether to move to a hosted platform. We looked seriously at GitHub Actions and GitLab CI. I ran the numbers.

What came back, in 2021, was that Actions got expensive quickly under per-minute billing at our volume. The security and dependency-scanning story was subtler: the capabilities weren't missing, they were priced separately. Code scanning and secret scanning on private repositories sat behind Advanced Security, licensed per committer on top of everything else — so every time we solved the feature question, the cost question reopened. GitLab CI had a genuinely broad feature set, but under proof of concept the specific pieces we needed turned out to be incomplete. Set against migration effort, billing, a security posture that pointed to on-premises hosting, and the fact that the incumbent bundled with products the business already licensed — the answer was to stay where we were.

> **The mandate came from the arithmetic, not the argument.** I wasn't the most senior person in that decision. But I was the one holding the cost model, the POC results, and the migration estimate, and that is very difficult to out-talk.

But staying on the same platform was never the same as doing nothing, and that's the half that made the recommendation defensible rather than lazy. The tool wasn't the problem. The legacy setup around it was — and a migration would have carried every one of those gaps onto a new platform, with a migration bill on top. So the plan was to keep the tool and rebuild everything around it.

Containerized builds instead of long-lived agents carrying hand-installed toolchains. Pipelines as code rather than clicked together in a UI. Automation absorbing the setup so teams stopped hand-rolling the same scaffolding. Build capacity on spot, because builds are short and retryable. And the platform's own infrastructure deployed from a *different* system — because if the thing that rebuilds your pipeline system *is* your pipeline system, you have a circular dependency, and you discover it on the worst possible day.

I've written that rebuild up properly in [Rebuilding CI/CD Without Changing Platforms](/engineering/rebuilding-ci-cd-without-changing-platforms/), including the parts I'd do differently.

What that bought, on both sides of the fence: developers got real control of their own build setup, including their own container images, without having to understand how any of it reached the cloud. And from the platform side, hardcoded credentials went away in favor of short-lived, per-environment ones — while moving the server's state off the server itself, into a managed database cluster and shared storage, turned upgrades from an event into an instance replacement.

> **"Keep the tool, fix the setup" is only credible if you actually do the second half.** Otherwise it's deferral with a cost model stapled to it.

Note also what the headline recommendation was: *don't migrate.* Nobody proposes that to look impressive. If your analysis only ever concludes that the organization should do something large and new, that's worth noticing about your analysis.

## 2. 🌱 Start where you're the missing piece

All of that assumes people already listen to you, which is not much help if you've just arrived. Influence comes from a track record, and a track record needs influence to get started. So how do you begin?

You look for the thing the team demonstrably doesn't have, and you bring that.

When I joined a platform team, I came from a development background, and the gap was visible almost immediately. The team was strong on infrastructure, stability, and security — genuinely strong. But design patterns and modular architecture weren't part of the working vocabulary, because they'd never needed to be.

So my first project wasn't a proposal. I took one of the automation tools and refactored it into something reusable and maintainable. Not as a critique of anyone's work — as a worked example of what the alternative looked like in our own codebase, on a tool people already used.

Then I made it repeatable rather than personal: training on Python and development practices, and documentation so the ideas didn't depend on me being in the room.

Only after that did I start putting opinions into the roadmap. And by then I'd understood something I'd have gotten wrong on day one — that platform engineers and product developers are optimizing for genuinely different things. Platform thinking starts from infrastructure stability and security. Development thinking starts from performance and customer experience. Neither is the correct one. But turn up with the wrong set of instincts and confident opinions, and you'll be the new person who doesn't understand how things work here.

> **Do it, then teach it, then steer it.** Reverse that order and you're just the new person with opinions.

## 3. 🔍 Do the reading nobody else did

The cheapest durable influence available to you is being the only person in the room who actually read the thing. The incident timeline. The contract. The code.

I came up through development, then testing, then DevOps and operations. Same systems, three vantage points — and they fail differently depending on where you're standing. Development shows you why the shortcut was taken. Testing shows you which assumptions were never true. Operations shows you what happens at 3am when both of those meet real traffic.

That breadth is what lets you name the blocker two quarters before it arrives. And naming it early, correctly, once, is what makes people turn to you the next time. Being right in public is a slow way to build influence, but it compounds and it doesn't decay.

## 4. 📝 Write it down so it travels without you

You cannot attend every meeting where your work is discussed. A written decision record can.

So I write the ADR. Always. When a decision crosses domains, I put every viable path in front of the relevant domain owners with the impact of each spelled out, present it properly, and then take the vote. Not to manufacture consensus theatre — to make sure the people who'll live with the consequence had a real chance to shape it.

Most decision records fail for the same three reasons:

- **The decision is buried.** State it in the first two lines. A reader who stops there should still know what you chose.
- **The alternatives are strawmanned.** If a reader can tell you were never serious about option B, they'll assume you weren't serious about the analysis either.
- **The cost is missing.** Every real decision has one. A document that presents a choice as free is not credible, and worse, it's useless the day the cost shows up.

> **A record that argues the other side honestly beats one that pretends there was no trade-off.** The first survives contact with the engineer who inherits it. The second gets rewritten from scratch.

## 5. 🤝 Go and collect the perspectives you don't have

The design review is not where you should first hear the serious objection. By then it's expensive — for the proposal and for you.

So go find it beforehand, deliberately, from people who don't think like you. People differ along lines you can actually observe: some want to try it on Monday, others need the plan from stage one to stage *n*; some optimize for speed and some for completeness; some have been burned by this exact class of change and some never have.

That last group is the one worth hunting down. The objection you cannot generate yourself is the one that kills the project six months in. This is tactical empathy applied to engineering — much the same instinct as the [calibrated questions in *Never Split the Difference*](/book-notes/never-split-the-difference-voss/): you're not trying to win the conversation, you're trying to find out what you're missing while it's still cheap to be wrong.

## 6. 🧩 Build the bench, not just the headcount

You rarely get to choose your team. But you almost always get input on the next hire — and when people leave, you get a rare chance to rebuild the shape you *need* rather than the shape you had.

A team of one archetype fails predictably. The mix I look for:

- **People who will just try it.** High risk appetite, quick to move. They're who you want on a proof of concept, and who you want in an outage — where a decision made now genuinely beats a better one made later.
- **People who plan before they act.** They're how a proof of concept becomes a product without gaps in the flow or half-finished paths. This matters most in customer-facing systems, where an incomplete implementation isn't an internal embarrassment — it's something a customer walks into.
- **Translators.** People who turn high-level designs into low-level ones, or business requirements into technical ones. This is a scarce, distinct skill. It is not junior design work.
- **Steady executors and explorers.** Some people reliably deliver a well-defined scope without relitigating it. Others go looking for what nobody asked them to find. You need both.

> **Steady execution is not a lower rung.** Predictable throughput is what lets everyone else take risks. A team of nothing but explorers ships nothing.

Notice that all of these are working styles — how someone approaches a problem. They're observable, they're the thing that actually predicts fit, and they have nothing to do with who anyone is.

## 7. 🪜 Take the work that matters, then go find the people who can do it

Take on what genuinely matters — the thing that moves customer satisfaction or the financial picture — even when it sits outside your expertise. You're not required to know everything. You're required to close the gap.

On observability and monitoring work, I didn't have deep expertise in the platform. So the split was deliberate: the **migration** went to domain experts, and **exploring the platform's feature surface** went to fast-learning juniors who wanted to build that expertise.

That split wasn't arbitrary, and it's the part I'd pass on. Match the work to the consequence of getting it wrong. A migration is risky and mostly one-way, so it goes to people who have done one before. Feature exploration is low-risk and high-learning — which makes it the best thing you can possibly hand someone who wants to grow.

Senior engineers hoard exactly that second category, usually without meaning to, because it's the fun part. It's also the part that grows people. Give it away.

It worked better than I planned. One of those juniors grew into the domain expert — mid-level now, the person everyone goes to for that platform, picking up user stories in it independently. I don't oversee that area at all any more; I just hand it over.

> **The delegation worked at the point I became unnecessary.** If you're still the bottleneck a year later, you didn't delegate the work — you lent it out.

This is where trust gets built, and trust is the base of the pyramid — everything in [*The Five Dysfunctions of a Team*](/book-notes/five-dysfunctions-of-a-team-lencioni/) stacks on top of it.

## 8. ⚔️ Pick the hill, then carry what it costs

You get a small number of vetoes. Senior engineers lose theirs by spending one on everything — naming, formatting, library choice, the shape of a function — until "they always object" becomes the summary of your opinion and people route around you.

Save them for decisions that are expensive to reverse. When the licensing landscape around our in-memory cache shifted, the choice between moving to a newer Redis version and moving to Valkey was worth real review time, because the cost of changing your mind later lands on every service that touches the cache.

Technically, the two had diverged more than the shared ancestry suggests. Redis was putting its energy into AI and vector capabilities; Valkey was putting its energy into the core caching path. And on the managed-service side, AWS had moved decisively toward Valkey on the back of the licensing change, which mattered a great deal for anything we ran managed.

So the technical answer came out reasonably clear. The opposition wasn't technical at all.

The development teams didn't want another migration. They were fluent in the Redis way of working, they had features to ship, and from where they sat, a licensing dispute they had no part in was arriving as their sprint work. That isn't obstruction. It's an accurate read of who pays.

That's the part worth generalizing. **When people resist a decision you're confident about, the objection is usually cost rather than merit — and unlike merit, cost is something you can actually move.** Arguing harder does nothing to it.

So I ran the migration as an [AI-assisted workflow](/engineering/ai-assisted-coding-playbook/): Copilot agents generated the changes and opened them as pull requests, so the teams reviewed and merged instead of migrating. Around 180 cache stacks moved that way. Their share of the work went from weeks of project time to an afternoon of code review.

> **Spending a veto means taking on the work it creates.** Win the argument and hand someone else the bill, and you haven't led anything — you've added to their backlog with extra steps.

Then the ground moved again: in May 2025, Redis added AGPLv3 back as a licensing option, after the fork it had triggered. It would be easy to read that as the review having been wasted effort. It's the opposite. A decision reached in an afternoon on licensing sentiment alone gives you nothing to think with when the situation changes — whereas the work of actually understanding your exposure, your upgrade path, and what every dependent service would need is exactly what you reuse to evaluate the next shift.

> **One-way doors are worth real review time precisely because the landscape keeps moving.** The analysis outlives the decision it was built for.

Reversible decisions deserve a quick opinion. One-way doors deserve a fight. Knowing which one you're looking at is most of the skill.

## 9. 🔁 Make the good path the easy path

Everything above is retail influence — one room, one decision, one document at a time. This is the wholesale version, and it's the only one that scales past you.

I try to make standards and guidelines so easy to use that developers never notice they're on a track at all. In an automation framework, that means absorbing the hard operational setup and abstracting it away, so product teams stay on feature work instead of learning the infrastructure underneath. The same instinct runs through how I think about [configuration as data](/engineering/config-as-data-for-infrastructure-repos/) and [path-filtered CI for infra monorepos](/engineering/path-filtered-ci-cd-for-infra-monorepos/): put the correct choice in the default, the template, the pipeline.

> **A guideline nobody reads and everybody follows beats a policy everybody has read and nobody follows.** The first is built into the tooling. The second is built into a wiki.

Influence encoded into a default keeps working while you're on holiday. Influence that lives in your advocacy stops the moment you're busy.

## 10. 🩹 Your estimate measures what you don't know yet

Everything so far is about being right in ways that earn attention. Here's the other half, because you won't always be right — and how you handle that determines whether anyone trusts the next number you give them.

I estimated two weeks to migrate from Amazon Linux 2 to Amazon Linux 2023. It took five.

The migration itself was never the problem. What I'd missed was everything sitting on top of it. AL2023 is a substantially different base: OpenSSL moves from the 1.0.2 and 1.1.1 era to OpenSSL 3, Python 2 is gone entirely, and the default versions for Python, .NET, PHP, and Node all jump forward. Our applications were running well behind those versions — years of deferred maintenance nobody had needed to confront, because the old base image kept quietly supporting them.

So the moment the OS moved, everything above it broke at once. I hadn't estimated an OS migration. I'd unknowingly estimated a maintenance backlog I had never counted.

> **A platform migration estimate is really an estimate of how current everything above the platform is.** Skip that measurement and you haven't estimated anything — you've guessed with confidence.

The fix isn't "add buffer." It's the thing section three argues for and I simply hadn't done: read the estate first. An inventory of runtime versions and library dependencies across the applications would have taken a few days, and would have turned a wrong number into a right one before anyone was relying on it.

Two and a half times over is a bad miss. But an estimate that's wrong and revised early is a planning problem, while an estimate that's wrong and defended quietly is a trust problem. Only one of those follows you around.

That migration is also where I stopped being a developer who worked on infrastructure and became a platform engineer — not because of the OS, but because it was the first time I had to hold the entire estate in my head at once, every application and runtime and dependency together, instead of one codebase at a time.

## 11. 🧯 When you get overruled anyway

Sometimes you do all of this and the decision still goes the other way. This is the part most leadership writing skips, and it's the part you'll need most.

First, listen properly and make sure you actually understand the other position. A surprising share of the time, the disagreement dissolves here — you were missing a constraint.

If you still think the call is wrong or carries too much risk, write it down: the decision, an honest risk assessment, and mitigations where you know them. Where you don't know the mitigation, flag the risk anyway rather than quietly hoping. Then commit, properly — no sabotage, no I-told-you-so held in reserve.

The written record isn't there to vindicate you. It's there so that when the first risk actually lands, the team can move straight to the alternative instead of re-arguing the whole thing from memory. That's the difference between a documented disagreement and a grudge.

The recurring ones, in my experience, are smaller than you'd expect: naming conventions, and whether cloud accounts follow a full DTAP separation or collapse into production and non-production. Both feel like preference arguments. Both are extremely annoying to undo two years later.

## Final thoughts

Leading without authority is slower than leading with it. You don't get to shortcut anything, and every mandate is earned one decision at a time.

But it's more durable, because it isn't attached to a title. It moves with you between teams, companies, and roles, and it works on people who don't report to you — which, as you get more senior, is nearly everyone who matters.

At the top of this post I said that when you're right and get ignored, there's no lever to pull. That's true on your first day. Everything since has been about building one: the analysis nobody else did, the record that keeps working in rooms you're not in, the people you grew past needing you, the default that makes the right thing effortless. None of it requires anyone's permission.

If you're on this track: do the reading, write the record, spend your vetoes carefully, say so early when your number was wrong, and put your best thinking into the defaults rather than the debates.

What's worked for you? I'd genuinely like to hear it — [find me on LinkedIn](https://www.linkedin.com/in/riddam/).
