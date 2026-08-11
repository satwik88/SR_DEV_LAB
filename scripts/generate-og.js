const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium').default || require('@sparticuz/chromium');
const path = require('path');

async function generateOG() {
  console.log('Generating OG image...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    
    // Navigate to the live production URL
    await page.goto('https://satwik23.vercel.app', { waitUntil: 'networkidle0' });
    
    // Wait for a few extra seconds for the Three.js starfield/hero animations and fonts to fully settle
    console.log('Waiting for animations to settle...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take a screenshot and overwrite assets/portfolio.webp
    const outputPath = path.join(__dirname, '..', 'assets', 'portfolio.webp');
    await page.screenshot({ path: outputPath, type: 'webp', quality: 90 });
    console.log(`OG image successfully generated at ${outputPath}`);
    
  } catch (error) {
    console.warn('WARNING: Failed to generate OG image. Skipping this step. Error details:');
    console.warn(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

generateOG();
