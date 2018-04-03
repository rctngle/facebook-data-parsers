const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const getFriends = require('../parsers/friends');
const config = require('../config');
const moment = require('moment');

moment.locale(config.locale);

module.exports = function(fbDir) {
	const content = fs.readFileSync(fbDir + '/html/timeline.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const timeline = [];

	const friends = getFriends(fbDir);

	let postEntries = [];

	doc.querySelector('.contents').childNodes.forEach(function(child) {
		if (child.nodeType === 1 && child.classList.contains('meta')) {
			const m = moment(postEntries[0], config.dateFormat);
			const post = {
				date: postEntries[0],
				timestamp: m.format('X'),
				message: '',
				comments: [],
			};

			if (postEntries.length === 5) {
				post.message = postEntries[2];
				friends.forEach(function(f) {
					if (f.name === postEntries[1]) {
						post.from = f.name;
					}
				});
			} else if (postEntries.length === 4) {
				post.message = postEntries[1];
			}

			if (timeline.length > 0 && post.timestamp > timeline[timeline.length - 1].timestamp) {
				timeline[timeline.length - 1].comments.push(post);
			} else {
				timeline.push(post);	
			}

			postEntries = [];
		}


		postEntries.push(child.textContent);


	});

	return timeline;
};
