import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readingStats } from './reading-time.ts';

test('counts plain prose', () => {
  assert.equal(readingStats('one two three four five').words, 5);
});

test('excludes fenced code blocks', () => {
  const body = [
    'Real prose here.',
    '',
    '```python',
    'def a_function_with_many_tokens(x, y, z):',
    '    return x + y + z',
    '```',
    '',
    'More prose.',
  ].join('\n');
  // "Real prose here. More prose." = 5 words
  assert.equal(readingStats(body).words, 5);
});

test('excludes mermaid diagram source', () => {
  const body = ['Intro.', '', '```mermaid', 'flowchart TD', 'A --> B', '```'].join('\n');
  assert.equal(readingStats(body).words, 1);
});

test('keeps table cell text but not pipe delimiters', () => {
  const body = ['| Tool | Verdict |', '| --- | --- |', '| Pulumi | Good |'].join('\n');
  // Tool Verdict Pulumi Good = 4 words, no pipes counted
  assert.equal(readingStats(body).words, 4);
});

test('keeps link labels and drops URLs', () => {
  assert.equal(
    readingStats('See [the uv docs](https://github.com/astral-sh/uv) now.').words,
    5 // See the uv docs now.
  );
});

test('drops image markup entirely', () => {
  assert.equal(readingStats('Before ![a long alt text](/img/x.png) after').words, 2);
});

test('strips heading, bullet, quote and emphasis markers', () => {
  const body = ['## A Heading', '', '- **bold** item', '', '> quoted text'].join('\n');
  // A Heading bold item quoted text = 6
  assert.equal(readingStats(body).words, 6);
});

test('keeps inline code as one token', () => {
  assert.equal(readingStats('Run `uv sync` first').words, 4);
});

test('rounds minutes at 220 wpm with a floor of 1', () => {
  assert.equal(readingStats('word').minutes, 1);
  assert.equal(readingStats(Array(220).fill('word').join(' ')).minutes, 1);
  assert.equal(readingStats(Array(660).fill('word').join(' ')).minutes, 3);
});

test('handles an empty body', () => {
  assert.deepEqual(readingStats(), { words: 0, minutes: 1 });
  assert.deepEqual(readingStats(''), { words: 0, minutes: 1 });
});
