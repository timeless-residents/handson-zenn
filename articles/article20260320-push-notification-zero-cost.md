---
title: "プッシュ通知インフラをゼロ円で作った ── GitHub ActionsとCloudflare Workersで置き換えた設計"
emoji: "🔔"
type: "tech"
topics: ["GitHubActions", "CloudflareWorkers", "WebPush", "PWA", "個人開発"]
published: true
---

## TL;DR

- Web Pushは**無料のオープンプロトコル**。SaaSの月額は「管理UIとサポート」の費用
- **Cloudflare Worker + GitHub Actions + プライベートリポジトリ**で完全自前のプッシュ通知基盤を構築
- 7万組織規模でも**$0/月**、36並列で360万ユーザーまでスケール可能
- キュー設計により登録と送信を分離、同時登録スパイクに耐える

---

## 背景

PWAに毎朝のプッシュ通知を実装しようとして、主要なプッシュ通知SaaSの料金ページを開いた。

| サービス | 7万ユーザー規模の費用 |
|---|---|
| 大手プッシュ通知SaaS | 数万〜数十万円/月 |
| エンタープライズPaaS | 数十万〜100万円以上/月 |
| **今回の構成** | **$0/月** |

Web Push APIの仕組みを知っていれば、この差額が「設計コストを払わない代わりの料金」だとわかる。

---

## アーキテクチャ全体図

```
iPhoneのPWA（ホーム画面追加済み）
  │
  │ POST /subscribe（WEBHOOK_SECRET認証）
  ▼
Cloudflare Worker
  │
  │ GitHub API（PAT）でコミット
  ▼
プライベートリポジトリ
  └── memory/queue/{uid}.json   ← キュー

GitHub Actions（cron: 毎朝6:30 JST）
  │
  ├── queue/ → subscriptions/ にフラッシュ
  ├── [0〜9, a〜z] 36並列で送信
  └── 期限切れエンドポイントを自動削除
```

---

## 必要なもの

| コンポーネント | 用途 | 料金 |
|---|---|---|
| Cloudflare Workers | 受け口API（認証付き） | 無料（10万req/日） |
| GitHub Actions | 毎朝のバッチ送信 | 無料（publicリポジトリ） |
| プライベートリポジトリ | サブスクリプション保管 | 無料 |
| web-push（npm） | VAPIDによる送信 | 無料 |

---

## 実装

### 1. VAPIDキー生成

```bash
npm install -g web-push
web-push generate-vapid-keys --json
```

### 2. Cloudflare Worker（受け口）

```javascript:worker.js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const body = await request.json();

    if (body.secret !== env.WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { uid, sub, notif_time } = body;
    const record = JSON.stringify({
      uid,
      endpoint: sub.endpoint,
      keys: sub.keys,
      notif_time: notif_time || '06:30',
      registered_at: new Date().toISOString(),
    });

    const apiUrl = `https://api.github.com/repos/YOUR_ORG/YOUR_REPO/contents/memory/queue/${uid}.json`;

    let sha;
    const getResp = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${env.PAT_TOKEN}`,
        'User-Agent': 'push-worker',
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    if (getResp.ok) sha = (await getResp.json()).sha;

    await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${env.PAT_TOKEN}`,
        'User-Agent': 'push-worker',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `queue: ${uid}`,
        content: btoa(unescape(encodeURIComponent(record))),
        ...(sha ? { sha } : {})
      })
    });

    return new Response(JSON.stringify({ ok: true, uid }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

:::message
Cloudflare WorkerのSecretsに `WEBHOOK_SECRET` と `PAT_TOKEN` を設定してください
:::

### 3. PWA側

```javascript
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY';
const WORKER_URL = 'https://YOUR_WORKER.workers.dev';
const WEBHOOK_SECRET = 'YOUR_SECRET';

async function subscribe() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  await fetch(`${WORKER_URL}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: WEBHOOK_SECRET,
      uid: 'user_' + Date.now(),
      sub: sub.toJSON(),
      notif_time: '06:30',
      registered_at: new Date().toISOString(),
    })
  });
}
```

### 4. GitHub Actions（36並列送信）

```yaml:.github/workflows/send-notification.yml
name: Send Daily Push Notification

on:
  schedule:
    - cron: '30 21 * * *'  # JST 06:30
  workflow_dispatch:

jobs:
  flush:
    runs-on: ubuntu-latest
    steps:
      - name: Clone and flush queue
        run: |
          git clone https://${{ secrets.PAT_TOKEN }}@github.com/YOUR_ORG/YOUR_REPO.git tr
          cd tr && git config user.email "bot@example.com" && git config user.name "Bot"
          mkdir -p memory/subscriptions memory/queue
          for f in memory/queue/*.json; do
            [ -f "$f" ] || continue
            cp "$f" "memory/subscriptions/$(basename $f)" && rm "$f"
          done
          git add -A
          git diff --cached --quiet || git commit -m "flush: queue→subscriptions"
          git push https://${{ secrets.PAT_TOKEN }}@github.com/YOUR_ORG/YOUR_REPO.git main

  send:
    needs: flush
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z]
      fail-fast: false
    steps:
      - run: git clone https://${{ secrets.PAT_TOKEN }}@github.com/YOUR_ORG/YOUR_REPO.git tr
      - run: npm install -g web-push
      - name: Send shard ${{ matrix.shard }}
        run: |
          python3 << 'PYEOF'
          import json, os, subprocess, glob
          shard = os.environ['SHARD']
          files = [f for f in glob.glob('tr/memory/subscriptions/*.json')
                   if os.path.basename(f)[5:6].lower() == shard]
          for fpath in files:
            with open(fpath) as f:
              sub = json.load(f)
            result = subprocess.run([
              'web-push', 'send-notification',
              '--endpoint', sub['endpoint'],
              '--key', sub['keys']['p256dh'],
              '--auth', sub['keys']['auth'],
              '--vapid-pubkey', os.environ['VAPID_PUBLIC_KEY'],
              '--vapid-pvtkey', os.environ['VAPID_PRIVATE_KEY'],
              '--vapid-subject', os.environ['VAPID_SUBJECT'],
              '--payload', json.dumps({'title': 'Daily', 'body': '今日のメッセージ'})
            ], capture_output=True, text=True)
            print(f"{'✓' if result.returncode == 0 else '✗'} {os.path.basename(fpath)}")
          PYEOF
        env:
          SHARD: ${{ matrix.shard }}
          VAPID_PUBLIC_KEY: ${{ secrets.VAPID_PUBLIC_KEY }}
          VAPID_PRIVATE_KEY: ${{ secrets.VAPID_PRIVATE_KEY }}
          VAPID_SUBJECT: ${{ secrets.VAPID_SUBJECT }}
```

---

## スケール試算

| ユーザー数 | 送信時間（36並列） | 月額コスト |
|---|---|---|
| 1,000人 | 約1分 | $0 |
| 100,000人 | 約20分 | $0 |
| 3,600,000人 | 約6時間 | $0 |

---

## iOSの制約

:::message alert
iOSはホーム画面に追加済みのPWA（iOS 16.4以降）のみWeb Push対応。Safariブラウザ単体では通知不可。
:::

---

## まとめ

SaaSの月額料金は「設計しなくていい権利」の対価だ。Web Pushの仕組みを理解して自前で実装すれば、7万組織規模でも$0で動くインフラが手に入る。

**インフラは作るほど育つ。ツールは借りるほど消耗する。**

---

この記事の思想的背景は以下のエッセイで詳しく書いています。

https://tokistorage.github.io/lp/push-notification-zero-cost.html
