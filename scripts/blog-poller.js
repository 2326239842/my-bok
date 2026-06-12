#!/usr/bin/env node
/**
 * blog-poller.js - 自动轮询 GitHub 新 commit，触发构建和部署
 * 用法: node scripts/blog-poller.js
 */
const { execSync, exec } = require('child_process');
const https = require('https');
const path = require('path');

// 忽略 SSL 证书验证（Windows 环境）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const REPO = '2326239842/my-bok';
const BRANCH = 'main';
const POLL_INTERVAL = 2 * 60 * 1000; // 2 分钟
const CF_TOKEN='cfat_1...4007';
const PROJECT_NAME = 'yadong-blog';

let lastCommitSha = null;
const BLOG_DIR = path.join(__dirname, '..');

function getRemoteSha() {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${REPO}/commits?sha=${BRANCH}&per_page=1`;
    https.get(url, { headers: { 'User-Agent': 'blog-poller' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const commits = JSON.parse(data);
          if (commits && commits.length > 0) {
            resolve(commits[0].sha);
          } else {
            reject(new Error('No commits found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function build() {
  console.log(`[${new Date().toISOString()}] 开始构建...`);
  try {
    execSync('node scripts/build.js', { cwd: BLOG_DIR, stdio: 'inherit' });
    console.log('构建完成');
    return true;
  } catch (e) {
    console.error('构建失败:', e.message);
    return false;
  }
}

function deploy() {
  console.log(`[${new Date().toISOString()}] 开始部署...`);
  return new Promise((resolve) => {
    const cmd = `CLOUDFLARE_API_TOKEN='***' npx wrangler pages deploy . --project-name=${PROJECT_NAME} --branch ${BRANCH} --commit-dirty=true`;
    exec(cmd, { cwd: BLOG_DIR, timeout: 600000 }, (err, stdout, stderr) => {
      if (err) {
        console.error('部署失败:', err.message);
        console.error(stderr);
        resolve(false);
      } else {
        console.log('部署完成');
        resolve(true);
      }
    });
  });
}

async function poll() {
  try {
    const remoteSha = await getRemoteSha();
    if (!lastCommitSha) {
      lastCommitSha = remoteSha;
      console.log(`[${new Date().toISOString()}] 初始 commit: ${remoteSha.slice(0, 7)}`);
      return;
    }
    if (remoteSha !== lastCommitSha) {
      console.log(`[${new Date().toISOString()}] 检测到新 commit: ${remoteSha.slice(0, 7)}`);
      lastCommitSha = remoteSha;
      if (build()) {
        await deploy();
      }
    }
  } catch (e) {
    console.error(`[${new Date().toISOString()}] 轮询错误:`, e.message);
  }
}

console.log(`Blog Poller 已启动，每 ${POLL_INTERVAL/1000} 秒轮询一次`);
poll();
setInterval(poll, POLL_INTERVAL);
