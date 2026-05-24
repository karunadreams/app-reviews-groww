import * as fs from 'fs';
import * as path from 'path';
import gplay from 'google-play-scraper';

async function fetchReviews() {
  console.log('Fetching Groww reviews for the last 12 weeks...');
  const referenceDate = new Date();
  // 13 weeks to be safe
  const boundaryDate = new Date(referenceDate.getTime() - (13 * 7 * 24 * 60 * 60 * 1000));
  
  let allReviews: any[] = [];
  let nextToken: string | undefined = undefined;
  
  try {
    while (true) {
      const response = await gplay.reviews({
        appId: 'com.nextbillion.groww',
        sort: (gplay.sort as any).NEWEST,
        paginate: true,
        nextPaginationToken: nextToken
      }) as any;
      
      const reviews = response.data;
      if (!reviews || reviews.length === 0) break;
      
      let oldestDateInBatch = new Date();
      for (const r of reviews) {
        const rDate = new Date(r.date);
        allReviews.push(r);
        if (rDate < oldestDateInBatch) {
          oldestDateInBatch = rDate;
        }
      }
      
      console.log(`Fetched ${reviews.length} reviews. Total so far: ${allReviews.length}. Oldest in batch: ${oldestDateInBatch.toISOString()}`);
      
      if (oldestDateInBatch < boundaryDate) {
        console.log('Reached boundary date. Stopping pagination.');
        break;
      }
      
      nextToken = response.nextPaginationToken;
      if (!nextToken) {
        console.log('No more pages available.');
        break;
      }
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Finished fetching. Processing ${allReviews.length} reviews...`);

    let csvContent = 'stars,title,body,date,version\n';
    
    for (const r of allReviews) {
      const stars = r.score;
      const title = `"${(r.title || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const body = `"${(r.text || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const date = new Date(r.date).toISOString().split('T')[0];
      const version = r.version || 'Unknown';
      
      csvContent += `${stars},${title},${body},${date},${version}\n`;
    }

    const outPath = path.join(__dirname, '..', 'outputs', 'latest_reviews.csv');
    fs.writeFileSync(outPath, csvContent, 'utf-8');
    console.log(`Successfully saved ${allReviews.length} reviews to ${outPath}`);
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }
}

fetchReviews();
