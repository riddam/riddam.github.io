---
title: "Running the Code in These Posts"
description: "Every snippet in the AI Foundations series runs on an ordinary laptop with no GPU, no API key and no cloud account. Here is the ten-minute setup, what gets downloaded, where it lands, and how to get the disk space back."
pubDate: 2026-10-17
tags: ["ai-foundations", "local-models", "llm", "ai-assisted-coding"]
cover: bootstrap
coverVariant: 3
draft: true
---

*A prerequisite post. Seven posts in this series print numbers from a model
running on my laptop. This is how you get the same thing running on yours.*

## TL;DR

- You need two things: [uv](/engineering/uv-one-tool-to-rule-your-python/) and an
  internet connection for the first run. That is the whole setup.
- You do **not** need a GPU, an API key, a cloud account, or a Python
  environment you have to maintain.
- One command runs any snippet in the series:
  `uv run --with transformers --with torch python yourfile.py`.
- The first run downloads roughly 1.5 GB and takes a few minutes. Every run
  after that is seconds, and works offline.
- The model is Qwen2.5-0.5B. Every printed number in the series came from it, so
  you can check my working.

## Why run anything at all

You can read this series without running a line of it. But the numbers are the
point. When you see for yourself that the model gives Amsterdam 61 per cent and
not 100, something shifts that reading about it does not do.

The barrier is usually not difficulty. It is the suspicion that "run a language
model locally" means a graphics card, a weekend, and a conda environment you
will be fighting in six months. It does not. The model used throughout this
series is small enough to run on the laptop you are reading this on.

## What you actually need

**A laptop.** Mac, Linux or Windows. No GPU. Everything here runs on the
ordinary processor, and the snippets finish in seconds.

**About 2 GB of free disk.** More on where it goes below.

**uv.** A single tool that installs Python, fetches libraries and runs your
script, all in one command.
[uv, one tool to rule your Python](/engineering/uv-one-tool-to-rule-your-python/)
covers what it is and why it replaced four other tools for me. If you just want
the install line:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Nothing else.** You do not install Python yourself. You do not create a
virtual environment, activate it, or remember to deactivate it. You do not
`pip install` anything. uv does all of that per-run and caches the result.

## Your first run

Save this as `check.py` anywhere you like:

```python
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B")
print("vocabulary size:", len(tok))
print("strawberry ->", [tok.decode([i]) for i in tok("strawberry")["input_ids"]])
```

Then run it:

```sh
uv run --with transformers python check.py
```

You should get:

```text
vocabulary size: 151665
strawberry -> ['str', 'aw', 'berry']
```

You will probably also see a line saying PyTorch was not found. That is
expected, not a failure: this check only needs the tokeniser, and the library
says so out loud. The snippets that need PyTorch ask for it with `--with torch`.

That is the whole setup. If those two lines appeared, every snippet in the
series will run for you.

The `--with` flags are the interesting part. They say "make this library
available for this one run". uv builds a throwaway environment, caches what it
downloaded, and throws the environment away. Nothing is installed on your
system, and nothing is left behind to go stale. A snippet that also needs
PyTorch simply adds another flag:

```sh
uv run --with transformers --with torch python next-token.py
```

## What just got downloaded, and where

Two separate things land in two separate caches, and knowing which is which
saves you guessing later.

**The libraries** go to uv's cache, at `~/.cache/uv`. PyTorch is the heavy one:
about 550 MB once unpacked. This is why the first run feels slow and every run
afterwards does not.

**The model** goes to Hugging Face's cache, at `~/.cache/huggingface/hub`. For
Qwen2.5-0.5B that is one file of 988 MB — the weights — plus about 11 MB of
tokeniser files. It downloads once, the first time a script names that model,
and is reused by every script after it.

So: a shade over 1.5 GB total, split across two caches, downloaded once. After
that, the full next-token script from
[what a model actually is](/engineering/what-a-model-actually-is/) takes about
four seconds end to end on my machine, most of which is loading the model into
memory.

Once both caches are warm, all of this works with the wifi off.

## Why this model

[Qwen2.5-0.5B](https://huggingface.co/Qwen/Qwen2.5-0.5B) is a deliberate choice,
and the reasons are worth a paragraph because they are the same reasons you
might pick a small model at work.

It is **small enough to be honest about**. Half a billion parameters fits in
memory on anything, so nobody needs special hardware to check my numbers.

It is **open and ungated**. No access request, no licence to accept, no token to
paste. The download just works.

It is **a base model**, which matters more than it sounds. It has not been
trained to be a chat assistant, so what you see is closer to the raw mechanism.
Its own model card says plainly that base models are not recommended for
conversation — which is exactly the distinction
[reading a model card without guessing](/engineering/reading-a-model-card-without-guessing/)
is about.

And it is **the same model throughout**. Every probability, every token count,
every table in this series came from it. If your output differs from mine, that
is a real difference worth chasing, not a difference in setup.

## When it goes wrong

**The first run sits there doing nothing.** It is downloading, usually PyTorch.
Give it a few minutes on a normal connection. There is no progress bar for the
library download, only for the model.

**It cannot reach the internet.** On a corporate network, both uv and Hugging
Face go through the standard proxy environment variables. If `curl` works and
these do not, the proxy settings are the first place to look.

**Your numbers differ slightly from mine.** Check the precision first. Models do
their arithmetic with fewer decimal places than your laptop can handle, and some
of the snippets convert back to full precision with `.float()` before doing
sums. Dropping that is the usual cause of small drifts.

**Your numbers differ a lot from mine.** Then the library versions have moved.
These posts were written against uv 0.9, PyTorch 2.14 and Transformers 5.19 on
Python 3.11. If something has changed shape underneath, pin the versions:
`uv run --with "transformers==5.19.0" --with "torch==2.14.1" python yourfile.py`.

**You are out of disk.** See below.

## Getting the space back

Nothing here installs itself into your system, so there is nothing to uninstall.
There are only two caches, and deleting either is safe — the next run just
downloads again.

```sh
# the models
rm -rf ~/.cache/huggingface/hub/models--Qwen--Qwen2.5-0.5B

# everything uv has cached
uv cache clean
```

If you want the caches somewhere other than your home directory — a different
disk, say — set `HF_HOME` for the models and `UV_CACHE_DIR` for the libraries.

## Which posts need this

Seven posts in the series print output from a model running locally. These are
the ones where this setup pays for itself:

- [What a model actually is](/engineering/what-a-model-actually-is/) — the
  next-token probabilities and the tokeniser.
- [Embeddings, and why retrieval beats memorising](/engineering/embeddings-and-why-retrieval-beats-memorising/)
  — adds `sentence-transformers` to the `--with` list.
- [How it learned to follow instructions](/engineering/how-it-learned-to-follow-instructions/)
  — base model against instruction-tuned, side by side.
- [Reading a model card without guessing](/engineering/reading-a-model-card-without-guessing/)
- *Where the Context Comes From*, *How a Skill Gets Found and Loaded* and
  *Who Is Allowed to Do What* — all three arrive with track 2 on 24 October.

Each of them states its own `uv run` line above the first snippet. The only
thing that changes between them is which libraries follow `--with`.

## References and further reading

- [uv, one tool to rule your Python](/engineering/uv-one-tool-to-rule-your-python/)
  — what uv is, and the four tools it replaced. Read it if the single-command
  setup above felt like it was hiding something.
- [Qwen2.5-0.5B model card](https://huggingface.co/Qwen/Qwen2.5-0.5B) — the model
  every number in this series came from.
- [Hugging Face cache documentation](https://huggingface.co/docs/huggingface_hub/guides/manage-cache)
  — the official word on where models are stored and how to prune them, including
  the Windows paths.
- [The AI vocabulary](/engineering/the-ai-vocabulary/) — one-line definitions for
  every term the snippets print: token, tokeniser, weights, temperature.
- [AI Foundations: start here](/engineering/ai-foundations-start-here/) — the map
  of the whole series, if you landed on this page first.

## Final thoughts

The setup is one command because it should be. For years, "try this yourself"
in a post about machine learning meant an afternoon of environment wrangling,
and most readers sensibly declined. That tax is gone, and a surprising number of
people have not noticed yet.

Which means the real cost of checking a claim in this series is about four
seconds and a gigabyte of disk. If a number here looks wrong to you, run it. I
would rather be corrected than believed.
