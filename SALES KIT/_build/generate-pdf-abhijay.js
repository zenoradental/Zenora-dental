const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const htmlPath = path.resolve(__dirname, 'onepager_abhijay.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: path.resolve(__dirname, '..', 'Abhijay_One_Pager.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  
  console.log('Abhijay PDF generated successfully!');
  await browser.close();
})();
