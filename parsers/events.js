const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const moment = require('moment');
const config = require('../config');

moment.locale(config.locale);

module.exports = function(fbDir) {
	
	const content = fs.readFileSync(fbDir + '/html/events.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const events = [];

	doc.querySelectorAll('.contents ul li').forEach(function(item) {
		const event = {
			name: (item.childNodes[0].textContent)
		};

		const meta = [];
		item.querySelector('.meta').childNodes.forEach(function(m) {
			if (m.nodeType === 3) {
				meta.push(m.textContent);
			}
		});

		let dateIdx;
		if (meta.length === 3) {
			event.location = meta[0];
			event.reply = meta[2];
			dateIdx = 1;
		} else if (meta.length === 2) {
			event.reply = meta[1];
			dateIdx = 0;
		}

		if (dateIdx !== undefined) {
			const dates = meta[dateIdx].split(' - ');	
			event.startDate = dates[0];
			event.endDate = dates[1];
			event.startTimestamp = moment(event.startDate, config.dateFormat).format('X');
			event.endTimestamp = moment(event.startDate, config.dateFormat).format('X');
		}
	
		events.push(event);		
	});

	return events;
};
