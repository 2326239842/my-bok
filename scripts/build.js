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
  // Normalize line endings (Windows \r\n -> \n)
  content = content.replace(/\r\n/g, '\n');
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
          val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^[\"']|[\"']$/g, ''));
        }
      } else {
        val = val.replace(/^[\"']|[\"']$/g, '');
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
    const alignments = sepLine.split('|').filter(c => c.trim()).map(cell => {
      cell = cell.trim();
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
      if (cell.endsWith(':')) return 'right';
      return 'left';
    });

    // Parse header
    const parseRow = (line) => line.split('|').filter((c, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());

    let tableHtml = '<div class="table-wrap"><table>\n<thead>\n<tr>\n';
    const headers = parseRow(lines[0]);
    headers.forEach((h, i) => {
      const align = alignments[i] || 'left';
      tableHtml += `<th style="text-align:${align}">${inlineFormat(h)}</th>\n`;
    });
    tableHtml += '</tr>\n</thead>\n<tbody>\n';

    // Parse data rows
    for (let i = 2; i < lines.length; i++) {
      const cells = parseRow(lines[i]);
      tableHtml += '<tr>\n';
      cells.forEach((c, j) => {
        const align = alignments[j] || 'left';
        tableHtml += `<td style="text-align:${align}">${inlineFormat(c)}</td>\n`;
      });
      tableHtml += '</tr>\n';
    }
    tableHtml += '</tbody>\n</table></div>\n';
    return tableHtml;
  });

  // Helper for inline formatting in table cells
  function inlineFormat(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  // Step 4: Blockquotes (group consecutive > lines)
  html = html.replace(/(?:^>\s?.+\n?)+/gm, (block) => {
    const content = block.replace(/^>\s?/gm, '').trim();
    return `<blockquote>${content}</blockquote>\n`;
  });

  // Step 5: Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Step 6: Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Step 7: Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

  // Step 8: Links (handle optional {attributes} after URL)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)(\{[^}]*\})?/g, '<a href="$2" target="_blank">$1</a>');

  // Step 9: Unordered lists
  html = html.replace(/(?:^- .+\n?)+/gm, (block) => {
    const items = block.trim().split('\n').map(line => `<li>${inlineFormat(line.replace(/^- /, ''))}</li>`).join('\n');
    return `<ul>\n${items}\n</ul>\n`;
  });

  // Step 10: Paragraphs (wrap remaining text in <p>)
  const blockTagNames = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'hr', 'table', 'div', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'a'];
  const lines = html.split('\n');
  let result = [];
  let inParagraph = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      continue;
    }

    // Check if line is already a block element
    const isBlock = blockTagNames.some(tag => trimmed.startsWith(`<${tag}`) || trimmed.startsWith(`</${tag}`));
    // Check if line is a placeholder
    const isPlaceholder = /^%%(CODEBLOCK|INLINECODE)_\d+%%$/.test(trimmed);

    if (isBlock || isPlaceholder) {
      if (inParagraph) {
        result.push('</p>');
        inParagraph = false;
      }
      result.push(line);
    } else {
      if (!inParagraph) {
        result.push('<p>');
        inParagraph = true;
      }
      result.push(inlineFormat(trimmed));
    }
  }

  if (inParagraph) {
    result.push('</p>');
  }

  html = result.join('\n');

  // Step 11: Restore code blocks
  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_, idx) => {
    const block = codeBlocks[parseInt(idx)];
    const lang = block.lang ? ` class="language-${block.lang}"` : '';
    return `<pre><code${lang}>${escapeHtml(block.code)}</code></pre>`;
  });

  // Step 12: Restore inline code
  html = html.replace(/%%INLINECODE_(\d+)%%/g, (_, idx) => {
    return `<code>${escapeHtml(inlineCodes[parseInt(idx)])}</code>`;
  });

  return html;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeForTemplateLiteral(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

// Main build
const indexHtml = fs.readFileSync(INDEX_FILE, 'utf8');
const startIdx = indexHtml.indexOf(START_MARKER);
const endIdx = indexHtml.indexOf(END_MARKER);

if (startIdx === -1 || endIdx === -1) {
  console.error('ERROR: Could not find ARTICLES_START/ARTICLES_END markers in index.html');
  process.exit(1);
}

const articles = [];
let idx = 0;

POSTS_DIRS.forEach(dir => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const basename = path.basename(file, '.md');

    const { meta, body } = parseFrontMatter(raw);

    const isHtml = /^\s*</.test(body.trim());
    const content = isHtml ? escapeForTemplateLiteral(body.trim()) : escapeForTemplateLiteral(mdToHtml(body));

    articles.push({
      mtime: fs.statSync(filePath).mtimeMs,
      id: idx + 1,
      title: meta.title || basename.replace('.md', ''),
      date: meta.date || new Date().toISOString().replace('Z','+00:00'),
      tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? meta.tags.split(',').map(t => t.trim()) : []),
      summary: meta.summary || body.substring(0, 100).replace(/[#*>\\-]/g, '').trim() + '...',
      content: content,
      image: meta.image || '',
      audio: meta.audio || ''
    });
    idx++;
  });
});

articles.sort((a, b) => { const d = new Date(b.date) - new Date(a.date); return d !== 0 ? d : b.mtime - a.mtime; });
articles.forEach((a, i) => a.id = i + 1);

// Write article content to separate JSON (loaded on-demand, not in initial HTML)
// Key is article title (stable) instead of numeric ID (shifts when new articles are added)
const contentMap = {};
articles.forEach(a => { contentMap[a.title] = a.content; });
fs.writeFileSync(path.join(__dirname, '..', 'articles-content.json'), JSON.stringify(contentMap));

// Generate slug map (title -> MD5 hash for content/*.json file names)
const crypto = require('crypto');
const slugMap = {};
articles.forEach(a => {
  slugMap[a.title] = crypto.createHash('md5').update(a.title).digest('hex').slice(0, 8);
});

// Write per-article content JSON files
const contentDir = path.join(__dirname, '..', 'content');
if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
articles.forEach(a => {
  const slug = slugMap[a.title];
  if (slug) {
    fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify({ title: a.title, content: a.content }));
  }
});

// Build articles metadata array (without content for initial load)
const articlesMeta = articles.map(a => ({
  id: a.id,
  title: a.title,
  date: a.date,
  tags: a.tags,
  summary: a.summary,
  image: a.image,
  audio: a.audio
}));

const before = indexHtml.substring(0, startIdx + START_MARKER.length);
const after = indexHtml.substring(endIdx);
const newArticles = `\nconst articles=${JSON.stringify(articlesMeta)};\nconst slugMap=${JSON.stringify(slugMap)};\n`;

const newIndex = before + newArticles + after;
fs.writeFileSync(INDEX_FILE, newIndex);

console.log(`📦 Content JSON: ${articles.length} articles → articles-content.json`);
console.log(`✅ Built ${articles.length} articles from ${POSTS_DIRS.map(d => path.relative(path.join(__dirname, '..'), d)).join(', ')}`);
articles.forEach(a => {
  console.log(`   - ${a.title} (${a.date})`);
});
