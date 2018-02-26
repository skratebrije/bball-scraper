const puppeteer = require('puppeteer');

async function getProperty(element, property) {
	return await (await element.getProperty(property)).jsonValue();
}

async function getValuesFromSelectMenu(page, id) {
	var options = await page.$$('#' + id + ' > option');
	var values = [];
	for (var option of options) {
		values.push(await getProperty(option, "value"));
	}
	return values;
}

async function getGameUrlsFromSchedule(browser, month, season) {
	var page = await browser.newPage();
	var url = "http://www.wnba.com/schedule/#?month=" + month + "&season=" + season + "&seasontype=02";
	await page.goto(url);

	// Record the links that adhere to the game info href format
	const links = await page.$$('a[href^="http://www.wnba.com/game/"');
	var hrefs = [];
	for (var link of links) {
		hrefs.push(await getProperty(link, "href"));
	}

	await page.close();
	return hrefs;
}

async function getGameUrls(browser) {
	var page = await browser.newPage();
	await page.goto("http://www.wnba.com/schedule/");
	var months = await getValuesFromSelectMenu(page, "month-filter");
	var seasons = await getValuesFromSelectMenu(page, "season-filter");
	
	var games = [];
	for (var season of seasons) {
		for (var month of months) {
			var hrefs = await getGameUrlsFromSchedule(browser, month, season);
			console.log(month + "/" + season + " had " + hrefs.length + " games");
			// TODO: flatten into 1D array
			games.push(hrefs);
		}
	}
	return games;
}

(async () => {
	const browser = await puppeteer.launch();

	var games = await getGameUrls(browser);
	console.log(games);

	await browser.close();
})();