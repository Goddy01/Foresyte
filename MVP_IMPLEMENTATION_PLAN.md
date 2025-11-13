# Foresyte MVP Implementation Plan

## Overview
AI-powered news feed optimized for prediction market traders. This document outlines the technical approach to build the MVP.

---

## MVP Core Features (Priority Order)

### Phase 1: Foundation (Weeks 1-2)
1. **News Aggregation Engine**
2. **Basic Feed UI with Terminal Theme**
3. **Market Platform Integration (3-4 platforms)**

### Phase 2: AI & Formatting (Weeks 3-4)
4. **AI News Filtering & Relevance Scoring**
5. **Prediction-Market Optimized Format**
6. **Market Connection/Linking**

### Phase 3: Core Features (Weeks 5-6)
7. **Real-time Updates**
8. **Categories & Filtering**
9. **Basic Search**

---

## Technical Architecture

### Tech Stack

#### Frontend
- **Framework**: Next.js 16+ (React 19) ✅ Already set up
- **Styling**: Tailwind CSS ✅ Already set up
- **UI Components**: shadcn/ui ✅ Already set up
- **State Management**: React Query / SWR for server state
- **Real-time**: WebSockets (Socket.io or Pusher) or Server-Sent Events (SSE)

#### Backend
- **Runtime**: Node.js with Next.js API Routes (or separate Express/NestJS)
- **Database**: 
  - **Primary**: PostgreSQL (news, markets, users, watchlists)
  - **Cache**: Redis (real-time feed, rate limiting, session storage)
  - **Search**: PostgreSQL Full-Text Search or Elasticsearch
- **Queue**: Bull/BullMQ (background jobs for news fetching, AI processing)
- **AI/ML**: 
  - OpenAI API (GPT-4) for relevance scoring, summarization
  - Or self-hosted: Llama 3 / Mistral
  - Vector DB: Pinecone / Weaviate / pgvector for semantic search

#### Infrastructure
- **Hosting**: Vercel (frontend) + Railway/Render/Fly.io (backend)
- **CDN**: Cloudflare (for static assets)
- **Monitoring**: Sentry (errors), LogRocket (user sessions)
- **Analytics**: PostHog or Vercel Analytics

---

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

#### 1.1 News Aggregation Engine

**Goal**: Fetch news from multiple sources in real-time

**Implementation**:
```
1. News Sources APIs:
   - NewsAPI.org (free tier: 100 requests/day)
   - RSS feeds (Parse XML): Reuters, AP, Bloomberg, TechCrunch
   - Reddit API (r/news, r/worldnews)
   - Twitter/X API (hashtags, keywords)
   - Google News RSS (fallback)

2. Data Pipeline:
   - Cron job every 5-15 minutes
   - Queue jobs (Bull/BullMQ)
   - Store in PostgreSQL: articles table
   - Deduplication (hash URLs/headlines)
```

**Database Schema**:
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT, -- AI-generated
  url TEXT UNIQUE NOT NULL,
  source VARCHAR(100),
  published_at TIMESTAMP,
  relevance_score FLOAT, -- 0-1, AI calculated
  impact_level VARCHAR(20), -- HIGH, MEDIUM, LOW
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_relevance ON articles(relevance_score DESC);
CREATE INDEX idx_articles_impact ON articles(impact_level);
```

**Code Structure**:
```
lib/
  news/
    aggregator.ts        # Main aggregation logic
    sources/
      newsapi.ts
      rss.ts
      reddit.ts
    processors/
      deduplicator.ts    # Remove duplicates
      normalizer.ts      # Normalize data format
```

#### 1.2 Prediction Market Platform Integration

**Goal**: Connect to Polymarket, Manifold, Kalshi APIs

**Implementation**:
```
1. Polymarket:
   - API: https://clob.polymarket.com/ (public REST API)
   - GraphQL endpoint available
   - Markets: GET /markets
   - Get market details, prices, volumes

2. Manifold Markets:
   - API: https://api.manifold.markets (public REST API)
   - Markets: GET /v0/markets
   - Search markets by keyword

3. Kalshi:
   - API: Requires authentication (tier 2 access)
   - Alternative: Web scraping or manual curation initially

4. Metaculus:
   - RSS feeds available
   - Community predictions

5. PredictIt:
   - Limited API access
   - Alternative: Manual monitoring initially
```

**Database Schema**:
```sql
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL, -- 'polymarket', 'manifold', etc.
  external_id VARCHAR(255) NOT NULL, -- ID from platform
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category VARCHAR(100),
  current_probability FLOAT, -- 0-1 or 0-100
  volume_24h DECIMAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, external_id)
);

CREATE INDEX idx_markets_platform ON markets(platform);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_title_fts ON markets USING gin(to_tsvector('english', title));
```

**Code Structure**:
```
lib/
  markets/
    polymarket.ts       # Polymarket API client
    manifold.ts         # Manifold API client
    kalshi.ts           # Kalshi integration
    metaculus.ts        # Metaculus RSS
    index.ts            # Unified interface
```

#### 1.3 Basic Feed UI

**Goal**: Display news feed with terminal theme

**Implementation**:
```
1. API Route: /api/feed
   - Pagination (cursor-based)
   - Filters: category, platform, date
   - Returns: articles with metadata

2. Frontend Component:
   - Infinite scroll or pagination
   - Terminal-styled cards
   - Loading states
   - Error handling
```

**API Route Example**:
```typescript
// app/api/feed/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');

  const articles = await db.query(`
    SELECT a.*, 
           json_agg(DISTINCT jsonb_build_object(
             'platform', m.platform,
             'title', m.title,
             'url', m.url
           )) as related_markets
    FROM articles a
    LEFT JOIN article_markets am ON a.id = am.article_id
    LEFT JOIN markets m ON am.market_id = m.id
    WHERE a.relevance_score > 0.5
      ${category ? `AND a.category = $1` : ''}
    GROUP BY a.id
    ORDER BY a.published_at DESC
    LIMIT $2
  `);

  return Response.json({ articles, nextCursor: ... });
}
```

---

### Phase 2: AI & Formatting (Weeks 3-4)

#### 2.1 AI News Filtering & Relevance Scoring

**Goal**: Filter news relevant to prediction markets

**Implementation**:
```
1. Use OpenAI API (or similar):
   - GPT-4 for classification
   - Or fine-tuned model for speed/cost

2. Process each article:
   - Relevance score (0-1): How relevant to prediction markets?
   - Impact level (HIGH/MEDIUM/LOW): Likely market impact
   - Extract key facts (structured data)
   - Identify mentioned markets/categories
```

**AI Processing Pipeline**:
```typescript
// lib/ai/processor.ts
export async function processArticle(article: Article) {
  const prompt = `
    Analyze this news article for prediction market relevance:
    
    Title: ${article.title}
    Content: ${article.content}
    
    Provide:
    1. Relevance score (0-1): How relevant to prediction markets?
    2. Impact level (HIGH/MEDIUM/LOW): Likely impact on markets
    3. Key facts (JSON array): Extract actionable facts
    4. Categories: [politics, finance, sports, tech, etc.]
    5. Mentioned entities: People, companies, events
    
    Format as JSON.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Optimization Strategies**:
- Batch processing (multiple articles at once)
- Cache results (similar articles = similar scores)
- Use GPT-3.5-turbo for speed (less accurate but cheaper)
- Fine-tune smaller model (Llama 3) for cost efficiency

#### 2.2 Prediction-Market Optimized Format

**Goal**: Display news in format optimized for traders

**Implementation**:
```
1. Structured Article Display:
   - Impact Badge (HIGH/MEDIUM/LOW) - color coded
   - Headline (prominent)
   - Key Facts (bullet points, AI extracted)
   - Related Markets (linked, with probability changes)
   - Timestamp (relative: "2 minutes ago")
   - Source badge
   
2. Terminal-Style Cards:
   - ASCII borders
   - Green/amber text
   - Monospace font
   - Clean, scannable layout
```

**Component Structure**:
```typescript
// components/news-card.tsx
<article className="border border-green-400 bg-black/90 p-4 mb-4 font-mono">
  <div className="flex items-center gap-2 mb-2">
    <span className={`px-2 py-1 border ${
      impact === 'HIGH' ? 'border-red-400 text-red-400' :
      impact === 'MEDIUM' ? 'border-amber-400 text-amber-400' :
      'border-green-400 text-green-400'
    }`}>
      [{impact}]
    </span>
    <span className="text-green-600 text-xs">{relativeTime}</span>
  </div>
  
  <h3 className="text-green-400 text-lg mb-2">{title}</h3>
  
  <ul className="text-green-400/80 text-sm mb-3 space-y-1">
    {keyFacts.map(fact => (
      <li key={fact}>• {fact}</li>
    ))}
  </ul>
  
  <div className="border-t border-green-400/30 pt-2">
    <span className="text-green-600 text-xs">RELATED MARKETS:</span>
    <div className="flex flex-wrap gap-2 mt-1">
      {relatedMarkets.map(market => (
        <a href={market.url} className="text-green-400 hover:underline">
          [{market.platform}] {market.title}
        </a>
      ))}
    </div>
  </div>
</article>
```

#### 2.3 Market Connection/Linking

**Goal**: Automatically link articles to relevant markets

**Implementation**:
```
1. Semantic Matching:
   - Use embeddings (OpenAI text-embedding-3-small)
   - Compare article embeddings with market title embeddings
   - Find similar markets (cosine similarity > 0.7)

2. Keyword Matching:
   - Extract keywords from article (entities, topics)
   - Match against market titles/descriptions
   - Fuzzy matching for variations

3. Manual Curation (fallback):
   - Admin interface to manually link
   - Community suggestions (Phase 2)
```

**Database Schema**:
```sql
CREATE TABLE article_markets (
  article_id UUID REFERENCES articles(id),
  market_id UUID REFERENCES markets(id),
  relevance_score FLOAT,
  match_type VARCHAR(50), -- 'semantic', 'keyword', 'manual'
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (article_id, market_id)
);

CREATE INDEX idx_article_markets_article ON article_markets(article_id);
CREATE INDEX idx_article_markets_market ON article_markets(market_id);
```

**Matching Algorithm**:
```typescript
// lib/matching/market-matcher.ts
export async function linkArticleToMarkets(article: Article) {
  // 1. Get article embedding
  const articleEmbedding = await getEmbedding(article.title + article.content);
  
  // 2. Get all active markets (cached)
  const markets = await db.query('SELECT * FROM markets WHERE updated_at > NOW() - INTERVAL \'30 days\'');
  
  // 3. Calculate similarities
  const matches = await Promise.all(
    markets.map(async (market) => {
      const marketEmbedding = await getEmbedding(market.title);
      const similarity = cosineSimilarity(articleEmbedding, marketEmbedding);
      return { market, similarity };
    })
  );
  
  // 4. Filter and save high-relevance matches
  const relevantMatches = matches.filter(m => m.similarity > 0.7);
  for (const match of relevantMatches) {
    await db.query(`
      INSERT INTO article_markets (article_id, market_id, relevance_score, match_type)
      VALUES ($1, $2, $3, 'semantic')
      ON CONFLICT DO NOTHING
    `, [article.id, match.market.id, match.similarity]);
  }
}
```

---

### Phase 3: Core Features (Weeks 5-6)

#### 3.1 Real-time Updates

**Goal**: Push new articles to users in real-time

**Implementation**:
```
Option 1: Server-Sent Events (SSE) - Simpler, one-way
  - Next.js API route with SSE endpoint
  - Client subscribes to /api/feed/stream
  - Push new articles as they arrive

Option 2: WebSockets - More complex, bidirectional
  - Socket.io or ws library
  - Real-time bidirectional communication
  - Better for notifications, chat (future)
```

**SSE Implementation**:
```typescript
// app/api/feed/stream/route.ts
export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection
      controller.enqueue(encoder.encode('data: {"type": "connected"}\n\n'));
      
      // Listen for new articles (Redis pub/sub or database polling)
      const subscription = redis.subscribe('new_articles');
      subscription.on('message', (channel, message) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`));
      });
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        subscription.unsubscribe();
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Client-side**:
```typescript
// hooks/use-realtime-feed.ts
export function useRealtimeFeed() {
  useEffect(() => {
    const eventSource = new EventSource('/api/feed/stream');
    
    eventSource.onmessage = (event) => {
      const article = JSON.parse(event.data);
      // Add to feed state
      setArticles(prev => [article, ...prev]);
    };
    
    return () => eventSource.close();
  }, []);
}
```

#### 3.2 Categories & Filtering

**Goal**: Allow users to filter by category, platform, impact

**Implementation**:
```
1. Frontend Filters:
   - Category dropdown: Politics, Finance, Sports, Tech, etc.
   - Platform filter: Polymarket, Manifold, Kalshi
   - Impact filter: High, Medium, Low
   - Date range: Today, This Week, This Month

2. Backend API:
   - Query parameters for filters
   - Efficient SQL queries with indexes
   - Cache popular filter combinations
```

**Filter Component**:
```typescript
// components/feed-filters.tsx
export function FeedFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    category: null,
    platform: null,
    impact: null,
    dateRange: 'today'
  });
  
  return (
    <div className="flex gap-4 flex-wrap font-mono">
      <select 
        value={filters.category} 
        onChange={(e) => setFilters({...filters, category: e.target.value})}
        className="border border-green-400 bg-black text-green-400 px-3 py-1"
      >
        <option value="">ALL CATEGORIES</option>
        <option value="politics">POLITICS</option>
        <option value="finance">FINANCE</option>
        {/* ... */}
      </select>
      {/* More filters */}
    </div>
  );
}
```

#### 3.3 Basic Search

**Goal**: Search articles and markets

**Implementation**:
```
1. PostgreSQL Full-Text Search (simpler):
   - GIN indexes on title, content
   - ts_vector for search
   - Rank results by relevance

2. Or Elasticsearch (more powerful):
   - Better search quality
   - Autocomplete
   - Faceted search
   - More complex to set up
```

**Search Implementation** (PostgreSQL):
```typescript
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  const results = await db.query(`
    SELECT 
      a.*,
      ts_rank(to_tsvector('english', a.title || ' ' || a.content), query) as rank
    FROM articles a,
         to_tsquery('english', $1) query
    WHERE to_tsvector('english', a.title || ' ' || a.content) @@ query
    ORDER BY rank DESC, a.published_at DESC
    LIMIT 20
  `, [q.split(' ').join(' & ')]);
  
  return Response.json({ results });
}
```

---

## Data Flow Architecture

```
┌─────────────────┐
│  News Sources   │
│  (APIs, RSS)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Aggregator     │
│  (Cron/Queue)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Processor   │
│  (Relevance)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Market Matcher │
│  (Link Markets) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  (Storage)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Routes     │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │
│  (React/SSE)    │
└─────────────────┘
```

---

## Key Integrations

### 1. News Aggregation
- **NewsAPI.org**: Free tier (100 req/day) or paid ($449/month for 250k)
- **RSS Feeds**: Free, reliable, no rate limits (but need parsing)
- **Reddit API**: Free, high volume, good for trending topics

### 2. Prediction Markets
- **Polymarket**: Public API, well-documented
- **Manifold**: Public API, active community
- **Kalshi**: Requires API access, may need scraping initially

### 3. AI Services
- **OpenAI**: GPT-4 for quality, GPT-3.5-turbo for speed/cost
- **Alternative**: Anthropic Claude, Google Gemini
- **Self-hosted**: Llama 3.1 8B (cost-effective, private)

### 4. Infrastructure
- **Vercel**: Frontend + API routes (free tier good for MVP)
- **Railway/Render**: PostgreSQL + Redis ($5-20/month)
- **Upstash**: Serverless Redis (free tier available)

---

## Development Timeline

### Week 1: Setup & News Aggregation
- [ ] Set up database (PostgreSQL)
- [ ] Implement news aggregator (NewsAPI + RSS)
- [ ] Create articles table & basic API
- [ ] Display basic feed in UI

### Week 2: Market Integration
- [ ] Integrate Polymarket API
- [ ] Integrate Manifold API
- [ ] Create markets table
- [ ] Display related markets in UI

### Week 3: AI Processing
- [ ] Set up OpenAI API
- [ ] Implement relevance scoring
- [ ] Implement impact level classification
- [ ] Batch processing pipeline

### Week 4: Formatting & Matching
- [ ] Optimized article format component
- [ ] Market matching algorithm
- [ ] Link articles to markets
- [ ] Terminal-themed UI polish

### Week 5: Real-time & Filters
- [ ] Implement SSE for real-time updates
- [ ] Category filtering
- [ ] Platform filtering
- [ ] Impact level filtering

### Week 6: Search & Polish
- [ ] Implement search functionality
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing & bug fixes

---

## Cost Estimates (Monthly)

### Development Phase
- **OpenAI API**: $50-200 (depending on volume, use GPT-3.5-turbo for MVP)
- **Database (Railway)**: $5-10 (PostgreSQL)
- **Redis (Upstash)**: $0-10 (free tier available)
- **Hosting (Vercel)**: $0 (free tier good for MVP)
- **NewsAPI**: $0-50 (free tier or starter)
- **Total**: ~$55-270/month

### Scaling Phase (10k users)
- **OpenAI API**: $200-500
- **Database**: $20-50
- **Redis**: $20-50
- **Hosting**: $20 (Vercel Pro)
- **NewsAPI**: $449 (business tier)
- **Total**: ~$709-1069/month

---

## Next Steps

1. **Set up development environment**
   - Install dependencies
   - Set up PostgreSQL database
   - Configure environment variables

2. **Build Phase 1 (Foundation)**
   - Start with news aggregation
   - Add basic feed UI
   - Integrate one market platform (Polymarket)

3. **Iterate based on feedback**
   - Launch private beta
   - Gather user feedback
   - Prioritize features based on usage

4. **Scale gradually**
   - Add more news sources
   - Integrate more markets
   - Improve AI accuracy

---

## Success Metrics (MVP)

- **Articles processed**: 100+ articles/day
- **Relevance accuracy**: 80%+ (articles should be prediction-market relevant)
- **Market linking accuracy**: 70%+ (correct markets linked)
- **Real-time latency**: < 2 minutes from publish to feed
- **User engagement**: Users check feed 3+ times/day

---

## Risk Mitigation

1. **API Rate Limits**: Implement caching, use multiple sources
2. **AI Costs**: Use GPT-3.5-turbo initially, fine-tune smaller model later
3. **Market API Changes**: Abstract market clients, have fallbacks
4. **Performance**: Index database properly, use Redis for caching
5. **Relevance Accuracy**: Manual curation option, user feedback loop

---

This plan provides a roadmap to build the Foresyte MVP. Start with Phase 1, get basic functionality working, then iterate based on user feedback.

