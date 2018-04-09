const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('../config');
const moment = require('moment');
const sqlite3 = require('sqlite3');

moment.locale(config.locale);

module.exports = function(fbDir) {
	// Create db if not exists
	fs.writeFile('./data/messages.sqlite', '', { flag: 'wx' }, (err) => {
		if (err) {
			return;
		}
	});

	const db = new sqlite3.Database('./data/messages.sqlite');

	db.serialize(function() {
	  db.run("CREATE TABLE messages (threadNum varchar(255), threadPage varchar(255), threadDescription varchar(255), threadParticipants varchar(255), messageUser varchar(255), messageDate varchar(255), messageTimestamp varchar(255), messageMessages varchar(255))");
	});

	db.close();

	const content = fs.readFileSync(fbDir + '/html/messages.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	doc.querySelectorAll('.contents p').forEach((messageParagraph) => {
		const threadPage = messageParagraph.querySelector('a').getAttribute('href');
		const threadDesc = messageParagraph.querySelector('a').textContent;
		const threadNumber = (threadPage.match(/messages\/(\d+)\./i)[1]);

		const thread = {
			num: threadNumber,
			page: threadPage,
			description: threadDesc,
			participants: []
		};

		var threadContent = fs.readFileSync(`${fbDir}/${threadPage}`, 'utf8').toString();

		const threadDom = new JSDOM(threadContent);
		const threadDoc = threadDom.window.document;
		let message = {};

		threadDoc.querySelector('.thread').childNodes.forEach((child) => {
			if (child.nodeType === 3) {
				const contents = child.textContent.replace(/Participants: /gi, '');
				const participants = contents.split(', ');
				participants.forEach((participant) => {
					if (participant.trim() !== '') {
						thread.participants.push(participant.trim());
					}
				});
			} else {
				if (child.tagName === 'DIV' && child.classList.contains('message')) {
					if (Object.keys(message).length > 0) {
						const msgDbConnection = new sqlite3.Database('./data/messages.sqlite');
						msgDbConnection.serialize(function() {
						  let stmt = msgDbConnection.prepare("INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
						  stmt.run(thread.num, thread.page, thread.description, thread.participants, message.user, message.date, message.timestamp, message.messages);
						  stmt.finalize();
						});
						msgDbConnection.close();
					}

					const date = child.querySelector('.meta').textContent;
					const m = moment(date, config.dateFormat);
					const timestamp = parseInt(m.format('X'));

					message = {
						user: child.querySelector('.user').textContent,
						date: date,
						timestamp: timestamp,
						messages: []
					};
				} else if (child.tagName === 'P') {
					if (message.user !== undefined) {
						child.childNodes.forEach((paraChild) => {
							if (paraChild.nodeType === 3 || paraChild.tagName === 'SPAN') {
								if (paraChild.textContent.trim() !== '') {
									message.messages.push({ text: paraChild.textContent.trim() });
								}
							} else if (paraChild.tagName === 'IMG') {
								message.messages.push({ image: paraChild.getAttribute('src') });
							} else if (paraChild.tagName === 'AUDIO') {
								message.messages.push({ audio: paraChild.getAttribute('src') });
							} else if (paraChild.tagName === 'VIDEO') {
								message.messages.push({ video: paraChild.getAttribute('src') });
							} else if (paraChild.tagName === 'A') {
								message.messages.push({ link: paraChild.getAttribute('href'), text: paraChild.textContent });
							} else {
								console.log(paraChild, paraChild.tagName, paraChild.innerHTML);
							}
						});
					}
				}
			}
		});
	});
};
