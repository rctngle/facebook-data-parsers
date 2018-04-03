const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('../config');
const moment = require('moment');

moment.locale(config.locale);

module.exports = function(fbDir) {
	const content = fs.readFileSync(fbDir + '/html/ads.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const ads = [];

	doc.querySelector('.contents').childNodes.forEach((child, idx) => {
		if (child.tagName === 'H2') {
			const list = doc.querySelector('.contents').childNodes[idx+1];
			const section = {
				name: child.textContent.trim(),
				entries: [],
			};

			list.querySelectorAll('li').forEach((item) => {
				const description = item.childNodes[0].textContent;
				
				const entry = {
					description: description,
				};
				
				if (item.querySelector('.meta') !== null) {
					entry.date = item.querySelector('.meta').textContent;
					entry.timestamp = moment(entry.date, config.dateFormat).format('X');	
				}

				section.entries.push(entry);

			});
			
			ads.push(section);
		}
	});

	return ads;
};