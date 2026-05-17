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
      // 兼容 YAML 数组格式: ["a", "b", "c"]
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val);
        } catch(e) {
          // fallback: 去掉 [] 再按逗号分割
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
  let html = md
    // Code blocks (must be first)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines to <br>
    .replace(/\n/g, '<br>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
    if (!match.startsWith('<ul>')) return '<ul>' + match + '</ul>';
    return match;
  });

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

  return '<p>' + html + '</p>';
}

function escapeForTemplateLiteral(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

function build() {
  if (POSTS_DIRS.length === 0) {
    console.log('❌ No posts/ directories found.');
    process.exit(1);
  }

  const fileSet = new Map(); // name -> full path (first seen wins = content/posts/ priority)
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

    // 如果正文以 HTML 标签开头（来自 content/posts/），直接保留原文
    // 否则通过 mdToHtml 转换（来自旧 posts/）
    const isHtml = /^\s*</.test(body.trim());
    const content = isHtml ? escapeForTemplateLiteral(body.trim()) : escapeForTemplateLiteral(mdToHtml(body));

    articles.push({
      id: idx + 1,
      title: meta.title || basename.replace('.md', ''),
      date: meta.date || new Date().toISOString().split('T')[0],
      tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? meta.tags.split(',').map(t => t.trim()) : []),
      summary: meta.summary || body.substring(0, 100).replace(/[#*>\-]/g, '').trim() + '...',
      content: content,
      image: meta.image || '',
      audio: meta.audio || ''
    });
  });

  // Sort by date descending
  articles.sort((a, b) => b.date.localeCompare(a.date));

  // Reassign IDs after sorting
  articles.forEach((a, i) => a.id = i + 1);

  // Generate articles JS
  const articlesJs = articles.map(a => {
    const tags = JSON.stringify(a.tags);
    return `{id:${a.id},title:"${a.title}",date:"${a.date}",tags:${tags},summary:"${a.summary}",content:\`${a.content}\`,image:"${a.image}",audio:"${a.audio}"}`;
  }).join(',\n');

  const block = `// ===== ARTICLES_START =====\nconst articles=[\n${articlesJs}\n];\n// ===== ARTICLES_END =====`;

  // Read index.html and replace
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
