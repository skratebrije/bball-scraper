const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("http://www.wnba.com/schedule/#?month=05&season=2017&seasontype=02");
	await page.screenshot({path: 'wnba_schedule.png'});

	await browser.close();
})();