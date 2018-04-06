const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('../config');
const moment = require('moment');

moment.locale(config.locale);

module.exports = function(fbDir) {
	const content = fs.readFileSync(fbDir + '/html/security.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const security = [];

	const parseMeta = function(list) {
		const meta = {};
		
		list.forEach((item) => {
			const matches = item.match(/(.*): (.*)/i);
			
			if (matches === null) {
				meta.date = item;
				meta.timestamp = parseInt(moment(item, config.dateFormat).format('X'));

			} else {
				meta[matches[1]] = matches[2];
			}
		});

		return meta;
	};


	doc.querySelector('.contents').childNodes.forEach((child, idx) => {
		if (child.tagName === 'H2') {
			const list = doc.querySelector('.contents').childNodes[idx+1];
			const section = {
				name: child.textContent.trim(),
				entries: [],
			};

			if (list.childNodes.length > 0 && list.querySelectorAll('li').length === 0) {
				for (let i=0; i<list.childNodes.length; i+=2) {
					const description = list.childNodes[i];
					const meta = [];
					
					list.childNodes[i+1].childNodes.forEach((m) => {
						if (m.nodeType === 3) {
							meta.push(m.textContent);
						}
					});

					section.entries.push({
						description: description,
						meta: parseMeta(meta),
					});
				}
			} else {
				list.querySelectorAll('li').forEach((item) => {
					const description = item.childNodes[0].textContent;
					const meta = [];
					
					if (item.querySelector('.meta') !== null) {
						item.querySelector('.meta').childNodes.forEach((m) => {
							if (m.nodeType === 3) {
								meta.push(m.textContent);
							}
						});
					}

					section.entries.push({
						description: description,
						meta: parseMeta(meta),
					});

				});
			}
			security.push(section);
		}
	});
	
	return security;
};
