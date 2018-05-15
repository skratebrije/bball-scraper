const puppeteer = require('puppeteer');
const fs = require('fs');

var scraperUtils = require('./utils_scraper');

const write = false;

async function getValuesFromSelectMenu(page, id) {
	var options = await page.$$('#' + id + ' > option');
	return await scraperUtils.mapToProperty(options, "value");
}

async function getGameUrlsFromSchedule(browser, month, season) {
	var page = await browser.newPage();
	var url = "http://www.wnba.com/schedule/#?month=" + month + "&season=" + season + "&seasontype=02";
	await page.goto(url);

	// Record the links that adhere to the game info href format
	var links = await page.$$('a[href^="http://www.wnba.com/game/"]');
	var hrefs = await scraperUtils.mapToProperty(links, "href");

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
			Array.prototype.push.apply(games, hrefs);
		}
	}
	return games;
}

(async () => {
	const browser = await puppeteer.launch();

	var games = await getGameUrls(browser);
	console.log(games);

	if (write) {
		fs.writeFile("game_urls.txt", games, function(err) {
			if (err) { 
				console.log(err);
			}
			else {
				console.log("Game urls were written to game_urls.txt");
			}
		});
	}

	await browser.close();
})();
