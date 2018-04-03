const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('../config');
const moment = require('moment');

moment.locale(config.locale);

module.exports = function(fbDir) {
	const content = fs.readFileSync(fbDir + '/html/apps.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const applicaitons = [];


	doc.querySelectorAll('.contents > div').forEach(function(appSection) {
		appSection.childNodes.forEach((child, idx) => {
			if (child.tagName === 'H2') {
				const list = appSection.childNodes[idx+1];
				const section = {
					name: child.textContent.trim(),
					entries: [],
				};

				list.querySelectorAll('li').forEach((item) => {
					const description = item.childNodes[0].textContent;
					section.entries.push(description);
				});
				
				applicaitons.push(section);
			}
		});
	});

	return applicaitons;
};