module.exports = {
	makePlayerStats
};

function parseNameAndStarter(player, name) {
	// Starters have names denoting their position (ex. "Jessica Breland - F")
	var regex = /(.*)\s-\s[GFC]$/;
	var match = regex.exec(name);
	if (match == null) {
		player.name = name;
		player.starter = false;
	} else {
		player.name = match[1];
		player.starter = true;
	}
}

function parseMinutes(player, minutes) {
	var regex = /(\d{1,2}):(\d{2})/
	var match = regex.exec(minutes);
	if (match == null) {
		player.min = {minutes: 0, seconds: 0};
	} else {
		player.min = {minutes: parseInt(match[1]), seconds: parseInt(match[2])};
	}
}

function parseXforY(player, stat, xField, yField) {
	var regex = /(\d+)\s-\s(\d+)/
	var match = regex.exec(stat);
	if (match == null) {
		player[xField] = 0;
		player[yField] = 1;
	} else {
		player[xField] = parseInt(match[1]);
		player[yField] = parseInt(match[2]);
	}
}

function makePlayerStats(name, traditionalStats, advancedStats) {
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
	*/
	var player = {};
	parseNameAndStarter(player, name);				// Name and Starter
	parseMinutes(player, traditionalStats[0]);		// Minutes
	parseXforY(player, traditionalStats[1], "fgm", "fgma");		// Field Goals
	parseXforY(player, traditionalStats[3], "tpm", "tpma");		// Three Point Field Goals
	parseXforY(player, traditionalStats[5], "ftm", "ftma");		// Free Throws
	player.pm = parseInt(traditionalStats[7]);		// Plus Minus
	player.oreb = parseInt(traditionalStats[8]);	// Offensive Rebounds
	player.dreb = parseInt(traditionalStats[9]);	// Defensive Rebounds
	player.ast = parseInt(traditionalStats[11]);	// Assists
	player.pf = parseInt(traditionalStats[12]);		// Personal Fouls
	player.stl = parseInt(traditionalStats[13]);	// Steals
	player.to = parseInt(traditionalStats[14]);		// Turnovers
	player.bs = parseInt(traditionalStats[15]);		// Blocked Shots
	player.ba = parseInt(traditionalStats[16]);		// Blocks Against
	player.p = parseInt(traditionalStats[17]);		// Points
	
	return player;
}