const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const moment = require('moment');
const config = require('../config');

moment.locale(config.locale);

module.exports = function(fbDir) {
	
	const content = fs.readFileSync(fbDir + '/html/friends.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const friends = [];

	doc.querySelectorAll('.contents ul li').forEach(function(item) {
		const match = (item.textContent.match(/(.*)\((.*)\)/i));
		const date = match[2];
		const timestamp = moment(date, config.dateFormatShort).format('X');
		friends.push({
			name: match[1].trim(),
			date: date,
			timestamp: timestamp,
		});
	});

	return friends;
};
