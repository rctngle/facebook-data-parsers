const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('../config');
const moment = require('moment');

moment.locale(config.locale);

module.exports = function(fbDir) {

	const content = fs.readFileSync(fbDir + '/html/photos.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const albums = [];
	doc.querySelectorAll('.contents .block > div').forEach((el) => {
		const link = el.querySelector('a').getAttribute('href');
		const text = el.querySelector('a').textContent;
		
		const album = {
			name: text,
			photos: [],
		};

		const albumContent = fs.readFileSync(fbDir + '/' + link, 'utf8').toString();
		const albumDom = new JSDOM(albumContent);
		const albumDoc = albumDom.window.document;

		albumDoc.querySelectorAll('.contents .block').forEach((el) => {

			const photo = {
				src: el.querySelector('img').getAttribute('src'),
				date: undefined,
				meta: {},
				comments: [],
			};

			const meta = el.querySelector('div.meta');
			if (meta !== null) {
				const date = meta.textContent;
				const m = moment(date, config.dateFormat);
				const timestamp = parseInt(m.format('X'));

				photo.date = date;
				photo.timestamp = timestamp;
			}

			el.querySelectorAll('table.meta tr').forEach(function(row) {
				const key = row.querySelector('th').textContent;
				const value = row.querySelector('td').textContent;
				photo['meta'][key] = value;
			});

			el.querySelectorAll('.comment').forEach(function(com) {
				const date = com.querySelector('.meta').textContent;
				const m = moment(date, config.dateFormat);
				const timestamp = parseInt(m.format('X'));

				const comment = {
					from: com.querySelector('.user').textContent,
					date: date,
					timestamp: timestamp,
					message: '',
				};

				const messages = [];
				com.childNodes.forEach((child) => {
					if (child.nodeType === 3) {
						messages.push(child.textContent);
					}
				});
				comment.message = messages.join(' ');

				photo.comments.push(comment);
			});

			album.photos.push(photo);
		});


		albums.push(album);	
	});

	return albums;
};
