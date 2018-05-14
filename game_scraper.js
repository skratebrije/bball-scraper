const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');

var scraperUtils = require('./utils_scraper');
var performanceStats = require('./performance_stats');

async function getText(page, element) {
	if (Array.isArray(element)) {
		return scraperUtils.getProperty(element[0], "innerText");
	} else {
		return scraperUtils.getProperty(element, "innerText");
	}
}

async function getBasicGameData(page, game) {
	var awayScore = await getText(page, await page.$$("div.away-team > div.game__header-score"));
	var awayCity = await getText(page, await page.$$("div.away-team > div.game__header-team-name > a > span.team-city"));
	var awayName = await getText(page, await page.$$("div.away-team > div.game__header-team-name > a > span.team-name"));
	var homeScore = await getText(page, await page.$$("div.home-team > div.game__header-score"));
	var homeCity = await getText(page, await page.$$("div.home-team > div.game__header-team-name > a > span.team-city"));
	var homeName = await getText(page, await page.$$("div.home-team > div.game__header-team-name > a > span.team-name"));

	game.away = {city: awayCity, name: awayName, winner: (awayScore > homeScore), score: awayScore};
	game.home = {city: homeCity, name: homeName, winner: (homeScore > awayScore), score: homeScore};
}

async function getPointsFromRow(page, row, selector) {
	var points = await scraperUtils.mapToProperty(await row.$$(selector), "innerText");
	return points.map((val) => parseInt(val));
}

async function getScoreboardData(page, game) {
	var boxScore = await page.$$("table.game__box-score-table > tbody > tr");
	var awayPeriods = await getPointsFromRow(page, boxScore[0], "td:not(.ng-hide):not(.game__box-score-score)");
	var awayTotal = await getPointsFromRow(page, boxScore[0], "td.game__box-score-score");
	var homePeriods = await getPointsFromRow(page, boxScore[1], "td:not(.ng-hide):not(.game__box-score-score)");
	var homeTotal = await getPointsFromRow(page, boxScore[1], "td.game__box-score-score");

	//TODO: check that sum of periods equals total and that game data total equals scoreboard total

	game.away.periods = awayPeriods;
	game.home.periods = homePeriods;
}

async function getStatsHeaders(statsSection) {
	var elements = await statsSection.$$("thead > tr > th > abbr");
	return await scraperUtils.mapToProperty(elements, "title");
}

async function getTraditionalAndAdvancedStats(team, traditionalStatsSection, advancedStatsSection) {
	var players = await traditionalStatsSection.$$("tbody > tr");
	var playersAdvanced = await advancedStatsSection.$$("tbody > tr");

	if (players.length != playersAdvanced.length) {
		console.log("Unexpected difference in length of players");
		console.log(players.length + " vs " + playersAdvanced.length);
	}

	var playersObjs = [];
	for (var i=0; i<players.length; i++) {
		var playerName = await scraperUtils.getProperty(await players[i].$("th > a"), "innerText");
		var cells = await players[i].$$("td");
		//var playerNum = await scraperUtils.getProperty(cells[0], "innerText");
		var cellsAdvanced = await playersAdvanced[i].$$("td");

		playersObjs.push(await performanceStats.makeStats(playerName, cells, cellsAdvanced));
	}
	team.playerStats = playersObjs

	var teamCells = await traditionalStatsSection.$$("tfoot > tr > td");
	var teamCellsAdvanced = await traditionalStatsSection.$$("tfoot > tr > td");
	team.teamStats = await performanceStats.makeStats(null, teamCells, teamCellsAdvanced);
}

async function getPerformanceStats(page, game) {
	var statsSections = await page.$$("div.stat-table > div.stat-table__overflow > table");
	
	// Get traditional and advanced stats headers
	var statsHeaders = (await getStatsHeaders(statsSections[0])).slice(2);
	var advancedStatsHeaders = (await getStatsHeaders(statsSections[1])).slice(2);
	// Not using 'Four Factors' stats table right now as all information can be derived from the
	// team row of the traditional/advanced stats tables
	// var teamStatsHeaders = await getStatsHeaders(statsSections[2]);

	// TODO: throw error if stats headers don't match expected as this signals a change
	// in website design that should affect how we parse the DOM
	/*
	console.log("playerStats: " + statsHeaders);
	console.log("advancedPlayerStats: " + advancedStatsHeaders);
	console.log("teamStats: " + teamStatsHeaders);
	*/

	await getTraditionalAndAdvancedStats(game.away, statsSections[0], statsSections[1]);
	await getTraditionalAndAdvancedStats(game.home, statsSections[3], statsSections[4]);
}

async function getOverallStats(browser, url) {
	var page = await browser.newPage();
	// The javascript on the page depends on the size of the window, so make
	// sure that puppeteer is using a viewport/user agent resembling a desktop
	var viewport = {
		'width': 1280,
		'height': 1620,
		'deviceScaleFactor': 1,
		'isMobile': false,
		'hasTouch': true,
		'isLandscape': false
    }
	await page.setViewport(viewport);
	await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36");
	await page.goto(url)
	//await page.screenshot({path: "panel-one.png"});

	var game = {}
	await getBasicGameData(page, game);
	await getScoreboardData(page, game);
	await getPerformanceStats(page, game);

	// TODO: get arena stats, inactive player stats

	console.log(util.inspect(game, {showHidden: false, depth: null}));
	await page.close();
}

(async () => {
	const browser = await puppeteer.launch();

	var url = "http://www.wnba.com/game/20180506/WASMIN/"
	await getOverallStats(browser, url);

	await browser.close();
})();