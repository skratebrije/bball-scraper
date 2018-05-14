var scraperUtils = require('./utils_scraper');

module.exports = {
	makeStats,

};

function parseNameAndStarter(entity, name) {
	// Starters have names denoting their position (ex. "Jessica Breland - F")
	// Sometimes PG (Point Guard), SG (Shooting Guard), PF (Power Forward),
	// and SF (Small Forward) are used
	var regex = /(.*)\s-\s(?:G|F|C|PG|SG|PF|SF)$/;
	var match = regex.exec(name);
	if (match == null) {
		entity.name = name;
		entity.starter = false;
	} else {
		entity.name = match[1];
		entity.starter = true;
	}
}

function parseMinutes(entity, minutes) {
	var regex = /(\d{1,2}):(\d{2})/
	var match = regex.exec(minutes);
	if (match == null) {
		entity.min = {minutes: 0, seconds: 0};
	} else {
		entity.min = {minutes: parseInt(match[1]), seconds: parseInt(match[2])};
	}
}

function parseXforY(entity, stat, xField, yField) {
	var regex = /(\d+)\s-\s(\d+)/
	var match = regex.exec(stat);
	if (match == null) {
		entity[xField] = 0;
		entity[yField] = 0;
	} else {
		entity[xField] = parseInt(match[1]);
		entity[yField] = parseInt(match[2]);
	}
}

async function makeStats(name, cells, cellsAdvanced) {

	var traditionalStats = await scraperUtils.mapToProperty(cells.slice(1), "innerText");
	var advancedStats = await scraperUtils.mapToProperty(cellsAdvanced.slice(1), "innerText");
	/*
	Order of traditional stats
		0  - 'Minutes'
		1  - 'Field Goals Made-Attempted'
		2  - 'Field Goals Percent'
		3  - 'Three Point Field Goals Made-Attempted'
		4  - 'Three Point Percent'
		5  - 'Free Throw Made-Attempted'
		6  - 'Free Throws Percent'
		7  - 'Plus Minus'
		8  - 'Offensive Rebounds'
		9  - 'Defensive Rebounds'
		10 - 'Rebounds'
		11 - 'Assists'
		12 - 'Personal Fouls'
		13 - 'Steals'
		14 - 'Turnovers'
		15 - 'Blocked Shots'
		16 - 'Block Against'
		17 - 'Points'

	Order of advanced stats
		0  - 'Minutes Played'
		1  - 'Possessions'
		2  - 'Offensive Rating'
		3  - 'Defensive Rating'
		4  - 'Net Rating'
		5  - 'Assist Percentage'
		6  - 'Assist to Turnover Ratio'
		7  - 'Offensive Rebound Percentage'
		8  - 'Defensive Rebound Percentage'
		9  - 'Defensive Rebound Percentage'
		10 - 'Turnover Ratio'
		11 - 'Effective Fieldgoal Percentage'
		12 - 'True Shooting Percentage'
		13 - 'Usage Percentage'
		14 - 'Pace'
		15 - 'Player Impact Estimate'
	*/
	var entity = {};
	// Certain fields only apply to individual players and not teams
	if (name) {
		parseNameAndStarter(entity, name);			// Name and Starter
		parseMinutes(entity, traditionalStats[0]);	// Minutes
		entity.pm = parseInt(traditionalStats[7]);	// Plus Minus
	}
	parseXforY(entity, traditionalStats[1], "fgm", "fgma");		// Field Goals
	parseXforY(entity, traditionalStats[3], "tpm", "tpma");		// Three Point Field Goals
	parseXforY(entity, traditionalStats[5], "ftm", "ftma");		// Free Throws
	entity.oreb = parseInt(traditionalStats[8]);	// Offensive Rebounds
	entity.dreb = parseInt(traditionalStats[9]);	// Defensive Rebounds
	entity.ast = parseInt(traditionalStats[11]);	// Assists
	entity.pf = parseInt(traditionalStats[12]);		// Personal Fouls
	entity.stl = parseInt(traditionalStats[13]);	// Steals
	entity.to = parseInt(traditionalStats[14]);		// Turnovers
	entity.bs = parseInt(traditionalStats[15]);		// Blocked Shots
	entity.ba = parseInt(traditionalStats[16]);		// Blocks Against
	entity.p = parseInt(traditionalStats[17]);		// Points
	entity.poss = parseInt(advancedStats[1]);		// Possessions
	entity.ortg = parseFloat(advancedStats[2]);		// Offensive Rating
	entity.drtg = parseFloat(advancedStats[3]);		// Defensive Rating
	entity.astp = parseFloat(advancedStats[5]);		// Assist Percentage
	entity.atoto = parseFloat(advancedStats[6]);	// Asist to Turnover Ratio
	entity.orebp = parseFloat(advancedStats[7]);	// Offensive Rebound Percentage
	entity.drebp = parseFloat(advancedStats[8]);	// Defensive Rebound Percentage
	entity.rebp = parseFloat(advancedStats[9]);		// Rebound Percentage
	entity.tor = parseFloat(advancedStats[10]);		// Turnover Ratio
	entity.efgp = parseFloat(advancedStats[11]);	// Effective Field Goal Percentage
	entity.tsp = parseFloat(advancedStats[12]);		// True Shooting Percentage
	entity.usg = parseFloat(advancedStats[13]);		// Usage Percentage
	entity.pace = parseFloat(advancedStats[14]);	// Pace
	entity.pie = parseFloat(advancedStats[15]);		// Player Impact Estimate

	return entity;
}