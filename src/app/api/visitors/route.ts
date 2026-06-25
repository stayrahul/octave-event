import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const globalAny: any = global;

async function fetchVisitorCount(url: string, timeoutMs: number = 15000): Promise<{ count: number }> {
  const fetchPromise = fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    cache: 'no-store'
  }).then(res => {
    if (!res.ok) throw new Error(`CounterAPI returned status ${res.status}`);
    return res.json();
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('CounterAPI request timed out')), timeoutMs)
  );

  return Promise.race([fetchPromise, timeoutPromise]);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const increment = searchParams.get('increment') === 'true';
    
    const namespace = 'runway-career-connect';
    const key = 'visits';
    
    const url = increment 
      ? `https://api.counterapi.dev/v1/${namespace}/${key}/up`
      : `https://api.counterapi.dev/v1/${namespace}/${key}`;

    const fetchInBackground = () => {
      fetchVisitorCount(url)
        .then(data => {
          if (data && typeof data.count === 'number') {
            globalAny.visitorCache = data.count;
          }
        })
        .catch(err => console.warn("Background CounterAPI refresh failed:", err.message));
    };

    // 1. If we have a cached value, return it immediately with optimistic update if incrementing
    if (globalAny.visitorCache !== undefined) {
      if (increment) {
        globalAny.visitorCache += 1; // Optimistic update
      }
      fetchInBackground();
      return NextResponse.json({ count: globalAny.visitorCache });
    }
    
    // 2. Cold boot: try to fetch with a timeout of 1.2s
    try {
      const data = await fetchVisitorCount(url, 1200);
      if (data && typeof data.count === 'number') {
        globalAny.visitorCache = data.count;
        return NextResponse.json({ count: data.count });
      }
      throw new Error("Invalid count response");
    } catch (err: any) {
      console.warn("CounterAPI cold boot failed or timed out, serving fallback:", err.message);
      
      const fallbackCount = 142;
      globalAny.visitorCache = fallbackCount;
      
      fetchInBackground();
      
      return NextResponse.json({ count: fallbackCount });
    }
  } catch (error: any) {
    console.error('Error in visitors API proxy:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
