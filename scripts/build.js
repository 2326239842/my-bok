#!/usr/bin/env node
/**
 * build.js - 从 posts/ 目录读取 Markdown，生成文章数据并注入 index.html
 * 用法: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');

// 从 content/posts/（Trae Solo CN）和 posts/（旧目录）读取
const POSTS_DIRS = [
  path.join(__dirname, '..', 'content', 'posts'),
  path.join(__dirname, '..', 'posts'),
].filter(d => fs.existsSync(d));
const INDEX_FILE = path.join(__dirname, '..', 'index.html');
const START_MARKER = '// ===== ARTICLES_START =====';
const END_MARKER = '// ===== ARTICLES_END =====';

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...vals] = line.split(':');
    if (key && vals.length) {
      let val = vals.join(':').trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val);
        } catch(e) {
          val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      } else {
        val = val.replace(/^["']|["']$/g, '');
      }
      meta[key.trim()] = val;
    }
  });
  return { meta, body: match[2] };
}

function mdToHtml(md) {
  // Step 1: Extract fenced code blocks -> placeholders
  const codeBlocks = [];
  let html = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang, code });
    return `%%CODEBLOCK_${idx}%%`;
  });

  // Step 2: Inline code -> placeholders
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(code);
    return `%%INLINECODE_${idx}%%`;
  });

  // Step 3: Tables (convert markdown tables to HTML)
  html = html.replace(/(?:^\|.+\|\s*(?:\n|$))+/gm, (tableBlock) => {
    const lines = tableBlock.trim().split('\n').filter(l => l.trim().startsWith('|'));
    if (lines.length < 2) return tableBlock; // need at least header + separator

    // Check if second line is a separator
    const sepLine = lines[1].trim();
    if (!/^\|[-:| ]+\|$/.test(sepLine)) return tableBlock;

    // Parse separator for alignment
    const alignments = sepLine
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => {
        if (s.startsWith(':') && s.endsWith(':')) return ' center';
        if (s.endsWith(':')) return ' right';
        return '';
      });

    // Parse header row (first line)
    const headerRow = lines[0].trim();
    const headers = headerRow
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Parse data rows (remaining lines after separator)
    const dataRows = lines.slice(2).filter(l => l.trim().startsWith('|'));

    let table = '<table>\n<thead>\n<tr>';
    headers.forEach((h, i) => {
      const align = alignments[i] ? ` style="text-align:${alignments[i].trim()}"` : '';
      // Convert inline markdown in header
      let content = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      table += `<th${align}>${content}</th>`;
    });
    table += '</tr>\n</thead>\n<tbody>\n';
    dataRows.forEach(row => {
      const cells = row
        .split('|')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      table += '<tr>';
      cells.forEach((cell, i) => {
        const align = alignments[i] ? ` style="text-align:${alignments[i].trim()}"` : '';
        // Convert inline markdown in cell
        let content = cell.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
        table += `<td${align}>${content}</td>`;
      });
      table += '</tr>\n';
    });
    table += '</tbody>\n</table>';
    return table;
  });

  // Step 4: Horizontal rules
  html = html.replace(/^---\s*$/gm, '<hr>');

  // Step 4: Blockquotes - group consecutive lines
  html = html.replace(/^>\s?(.+)$/gm, '%%BQ%%$1%%/BQ%%');
  html = html.replace(/((?:%%BQ%%[^\n]*%%\/BQ%%\n?)+)/g, (match) => {
    const lines = match
      .split(/(?:%%\/BQ%%)\n?/)
      .filter(l => l.startsWith('%%BQ%%'))
      .map(l => l.replace('%%BQ%%', ''));
    return '<blockquote>' + lines.join('<br>') + '</blockquote>';
  });

  // Step 5: Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Step 6: Images (before links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

  // Step 7: Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Step 8: Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Step 9: Unordered list items
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

  // Step 10: Group consecutive <li> into <ul>
  html = html.replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g, (match) => {
    return '<ul>' + match.trim() + '</ul>';
  });

  // Step 11: Restore inline code
  inlineCodes.forEach((code, i) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(`%%INLINECODE_${i}%%`, `<code>${escaped}</code>`);
  });

  // Step 12: Restore code blocks
  codeBlocks.forEach(({ lang, code }, i) => {
    html = html.replace(`%%CODEBLOCK_${i}%%`, `<pre><code>${lang ? lang + '\n' : ''}${code}</code></pre>`);
  });

  // Step 13: Wrap remaining text in paragraphs
  // Split by block-level elements
  const blockTagNames = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'pre', 'hr', 'table'];
  const blockRE = new RegExp(
    `(<(?:${blockTagNames.join('|')})(?:\\s[^>]*)?>[\\s\\S]*?<\\/(?:${blockTagNames.join('|')})>|<hr\\s*\\/?>)`,
    'gi'
  );

  const segments = [];
  let lastEnd = 0;
  let match;
  blockRE.lastIndex = 0;
  while ((match = blockRE.exec(html)) !== null) {
    // Text before this block element
    if (match.index > lastEnd) {
      const text = html.slice(lastEnd, match.index).trim();
      if (text) segments.push({ type: 'text', content: text });
    }
    segments.push({ type: 'block', content: match[0] });
    lastEnd = match.index + match[0].length;
  }
  // Remaining text after last block element
  if (lastEnd < html.length) {
    const text = html.slice(lastEnd).trim();
    if (text) segments.push({ type: 'text', content: text });
  }

  if (segments.length === 0) return '';

  let result = '';
  for (const seg of segments) {
    if (seg.type === 'block') {
      result += seg.content + '\n';
    } else {
      let text = seg.content;
      text = text.replace(/\n{2,}/g, '</p><p>');
      text = text.replace(/\n/g, '<br>');
      // Skip empty paragraphs
      if (text.replace(/<br>/g, '').trim()) {
        result += '<p>' + text + '</p>\n';
      }
    }
  }

  return result.trim();
}

function escapeForTemplateLiteral(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/<\/script>/gi, '<\\/script>');
}

function build() {
  if (POSTS_DIRS.length === 0) {
    console.log('❌ No posts/ directories found.');
    process.exit(1);
  }

  const fileSet = new Map();
  POSTS_DIRS.forEach(dir => {
    fs.readdirSync(dir).filter(f => f.endsWith('.md')).forEach(f => {
      if (!fileSet.has(f)) {
        fileSet.set(f, path.join(dir, f));
      }
    });
  });
  const files = [...fileSet.values()];
  if (files.length === 0) {
    console.log('⚠️  No .md files in posts/');
    process.exit(1);
  }

  const articles = [];

  files.forEach((file, idx) => {
    const raw = fs.readFileSync(file, 'utf-8');
    const basename = path.basename(file);
    const { meta, body } = parseFrontMatter(raw);

    const isHtml = /^\s*</.test(body.trim());
    const content = isHtml ? escapeForTemplateLiteral(body.trim()) : escapeForTemplateLiteral(mdToHtml(body));

    articles.push({
      id: idx + 1,
      title: meta.title || basename.replace('.md', ''),
      date: meta.date || new Date().toISOString().replace('Z','+00:00'),
      tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? meta.tags.split(',').map(t => t.trim()) : []),
      summary: meta.summary || body.substring(0, 100).replace(/[#*>\-]/g, '').trim() + '...',
      content: content,
      image: meta.image || '',
      audio: meta.audio || ''
    });
  });

  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  articles.forEach((a, i) => a.id = i + 1);

  const articlesJs = articles.map(a => {
    const tags = JSON.stringify(a.tags);
    return `{id:${a.id},title:"${a.title}",date:"${a.date}",tags:${tags},summary:"${a.summary}",content:\`${a.content}\`,image:"${a.image}",audio:"${a.audio}"}`;
  }).join(',\n');

  const block = `// ===== ARTICLES_START =====\nconst articles=[\n${articlesJs}\n];\n// ===== ARTICLES_END =====`;

  let html = fs.readFileSync(INDEX_FILE, 'utf-8');
  const startIdx = html.indexOf(START_MARKER);
  const endIdx = html.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.log('❌ Markers not found in index.html. Expected:', START_MARKER, END_MARKER);
    process.exit(1);
  }

  html = html.substring(0, startIdx) + block + html.substring(endIdx + END_MARKER.length);
  fs.writeFileSync(INDEX_FILE, html);

  console.log(`✅ Built ${articles.length} articles from posts/`);
  articles.forEach(a => console.log(`   - ${a.title} (${a.date})`));
}

build();
