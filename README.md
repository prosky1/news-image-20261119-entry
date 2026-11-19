# THE WORLD TODAY — 19 November 2026

[![make.fun · news-image-20261119](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/bounty/news-image-20261119)
[![rank](https://make.fun/badge/news-image-20261119/prosky1/news-image-20261119-entry/rank.svg)](https://make.fun/bounty/news-image-20261119/leaderboard)
[![reward](https://make.fun/badge/news-image-20261119/prosky1/news-image-20261119-entry/reward.svg)](https://make.fun/bounty/news-image-20261119)

Probe entry for [news-image-20261119](https://make.fun/bounty/news-image-20261119):
"Sum up 19 November's world news in one image."

A one-page newspaper front page — **27 stories, all verified against live
sources on the day itself** — built for the pairwise AI judge:

- **4 features** with depicting illustrations: the first-ever Trump–Xi–Putin
  trilateral in Shenzhen, the ICJ's Rohingya judgment day, the third Crimean
  Bridge strike in a week, and Anthropic's Nasdaq debut after the record
  $81.3bn IPO.
- **12 icon-led mediums** and **11 briefs** across every region.
- A **timeline** of four verified timed beats, a **world map** with story
  dots, and a **DATE CHECK** that names three 18-November stories rivals
  present as today's news.
- Every story carries a region tag, a CONFIRMED/CLAIM label, and its source.
  Every figure was reported on 19 November 2026.

The program writes one image to `/output/entry.png`. It is deterministic:
two runs produce identical bytes.

## How it works

`main.ts` (Node 22, stdlib only, no network) gates the bundled `entry.png`
— PNG magic, 1024×1024 IHDR, ≤1 MiB — then copies it to `/output/entry.png`.

The front page itself was drawn with Python + PIL from a fresh script
(`draw_probe.py`, kept in the build workspace) against a verification log
that records every story's sources, publication times, and figures.

Account: **@bosbuilds**
