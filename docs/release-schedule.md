# AI Foundations release schedule

Four tracks, one a week, each pushed by hand on its date. Nothing is scheduled
by the site: it renders whatever is in `main` with `draft: false`, so a release
is a push, and `pubDate` only sets the order posts appear in.

| Release | Track | Posts | `pubDate` | Shipped |
| --- | --- | --- | --- | --- |
| 12 Oct 2026 | The AI vocabulary, on its own | 1 | 11 Oct | yes |
| 17 Oct 2026 | Track 1 — what the model is doing | 6 + start-here, running-the-code | 17 Oct | yes |
| 24 Oct 2026 | Track 2 — what your coding tool is doing | 10 | 24 Oct | yes |
| 31 Oct 2026 | Track 3 — using it well, day to day | 2 | 31 Oct | |
| 7 Nov 2026 | Track 4 — putting AI in your own product | 4 | 7 Nov | |

Every post in a track carries that track's release date. The earlier plan
staggered them across the week before, so that a track arrived as a week of
posts rather than a wall of six — but a reader cannot see a stagger that only
exists in the dates. All they see is a post dated before the day it appeared.
One date per track, matching what the start-here map promises, is honest about
what actually happened.

A track sharing one date leaves nothing for a listing to sort on, so
`src/utils/post-order.ts` breaks the tie on each post's position in its series.
Add a track to `SERIES` in `src/consts.ts` and every listing, the feed and the
previous/next pair read it in order.

## How a release works

Everything for every track is already written and committed. Every track still
waiting carries `draft: true`, which keeps it off the built site and out of the
feeds while leaving it in the repository, cross-linked and reviewable.

The vocabulary page went out first, on its own, because it is the reference the
rest of the series leans on and it links to nothing that is still drafted.

On the morning of a release:

1. Set `draft: false` on that track's posts.
2. Restore the links into that track. A published post may not link a drafted
   one — `npm test` fails on it — so while a track waits, the posts that point
   into it name it in bold or italics instead. Search the repo for the track's
   titles to find them, and for the release date, since a waiting reference
   usually promises one. Tracks 1 and 2 are both restored. The ones still
   waiting: track 3's are in `ai-foundations-start-here.md` only, and track 4's
   are in `ai-foundations-start-here.md` and
   `reading-a-model-card-without-guessing.md`.
3. On the start-here map, turn that track's bold names back into links, and drop
   the "go live together on …" line for the track that just shipped.
4. `npm test && npm run build`, then push. Deploy runs on push to `main`.

Two tests do most of the policing: every internal link in a published post must
resolve to another published post, and the start-here map must link every
published post in the series and name every drafted one.

## The last two releases run themselves

Both remaining releases are scheduled as one-off cloud agents, which clone this
repository, carry out the four steps above and push to `main` — so the release
happens whether or not anybody opens a laptop that morning. They run at 09:07
Amsterdam time on their date.

| Date | Routine | ID |
| --- | --- | --- |
| 31 Oct 2026 | Release AI Foundations track 3 | `trig_01SA899fVUqFk7PhdSFpPHFo` |
| 7 Nov 2026 | Release AI Foundations track 4 | `trig_01SoYTyWQzsWDedtWNKbBjMX` |

They are managed at <https://claude.ai/code/routines>, which is also where to
disable one if a track needs to slip. A routine clones what is on `origin`, so
anything still sitting unpushed on a laptop will not be in the release.

## Reviewing a drafted track

`astro dev` renders drafts; `astro build` never does. See
`src/utils/visibility.ts`. Restart the dev server after flipping a draft flag —
the route list is built once at start-up.
