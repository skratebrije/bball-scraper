const puppeteer = require('puppeteer');
const fs = require('fs');

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
			Array.prototype.push.apply(games, hrefs);
			//games.push(hrefs);
		}
	}
	return games;
}

async function getText(page, element) {
	if (Array.isArray(element)) {
		return await page.evaluate(x => x.innerText, element[0]);
	} else {
		return await page.evaluate(x => x.innerText, element);
	}
}

async function getOverallStats(browser, url) {
	var page = await browser.newPage();
	var boxScoreExt = "#/panel-one"
	await page.goto(url + boxScoreExt);

	var awayScore = await getText(page, await page.$$("div.away-team > div.game__header-score"));
	var awayCity = await getText(page, await page.$$("div.away-team > div.game__header-team-name > a > span.team-city"));
	var awayName = await getText(page, await page.$$("div.away-team > div.game__header-team-name > a > span.team-name"));
	var homeScore = await getText(page, await page.$$("div.home-team > div.game__header-score"));
	var homeCity = await getText(page, await page.$$("div.home-team > div.game__header-team-name > a > span.team-city"));
	var homeName = await getText(page, await page.$$("div.home-team > div.game__header-team-name > a > span.team-name"));
	

	console.log(awayCity + " " + awayName + " got " + awayScore);
	console.log(homeCity + " " + homeName + " got " + homeScore);
}

async function getBoxScore(page) {
	// TODO: get the scores per quarter/half
	var boxScore = await page.$$("table.game__box-score-table > tbody > tr");
	boxScore[0]
}

(async () => {
	const browser = await puppeteer.launch();

	var url = "http://www.wnba.com/game/20170502/CHICON/"
	await getOverallStats(browser, url);

	/*
	var games = await getGameUrls(browser);
	console.log(games);
	fs.writeFile("game_urls.txt", games, function(err) {
		if (err) { 
			console.log(err);
		}
		else {
			console.log("Game urls were written to game_urls.txt");
		}
	});
	*/

	await browser.close();
})();