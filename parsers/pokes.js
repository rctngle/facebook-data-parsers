const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('../config');
const moment = require('moment');

moment.locale(config.locale);

module.exports = function(fbDir) {
	
	const content = fs.readFileSync(fbDir + '/html/pokes.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const pokes = [];

	doc.querySelectorAll('.contents ul li').forEach(function(item) {

		const poke = {};
		
		item.childNodes.forEach(function(el) {
			if (el.nodeType === 3) {
				poke.poke = el.textContent;
			} else if (el.classList.contains('meta')) {
				const date = el.textContent;
				const timestamp = parseInt(moment(date, config.dateFormat).format('X'));
				poke.date = date;
				poke.timestamp = timestamp;
			}
		});

		pokes.push(poke);

	});

	return pokes;
};
