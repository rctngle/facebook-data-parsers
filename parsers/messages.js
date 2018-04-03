const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('../config');
const moment = require('moment');

moment.locale(config.locale);

module.exports = function(fbDir) {

	const content = fs.readFileSync(fbDir + '/html/messages.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const threads = [];

	doc.querySelectorAll('.contents p').forEach((messageParagraph) => {
		const threadPage = messageParagraph.querySelector('a').getAttribute('href');		
		const threadDesc = messageParagraph.querySelector('a').textContent;		
		const threadNumber = (threadPage.match(/messages\/(\d+)\./i)[1]);

		const thread = {
			num: threadNumber,
			page: threadPage,
			description: threadDesc,
			participants: [],
			conversation: [],
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
						thread.conversation.push(message);	
					}

					const date = child.querySelector('.meta').textContent;
					const m = moment(date, config.dateFormat);
					const timestamp = m.format('X');

					message = {
						user: child.querySelector('.user').textContent,
						date: date,
						timestamp: timestamp,
						messages: [],
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
								// console.log(paraChild, paraChild.tagName, paraChild.innerHTML);
							}
						});
					}
				}
			}
		});

		threads.push(thread);
		
	});

	return threads;
};
