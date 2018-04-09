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

		console.log(threadPage);

		const threadDir = `${fbDir}/${threadPage}`;
		if (fs.existsSync(threadDir)){
			const threadContent = fs.readFileSync(threadDir, 'utf8').toString();
			const blocks = threadContent.split('<div class="message">');
			blocks.forEach((block) => {
				if (block.indexOf('message_header') >= 0) {
					const msgBlock = '<div class="message">' + block;
					const msgDom = new JSDOM(msgBlock);
					const msgDoc = msgDom.window.document;

					const message = {};
					if (msgDoc.querySelector('.user') !== null) {
						const user = msgDoc.querySelector('.user').textContent;	
						if (thread.participants.indexOf(user) < 0) {
							thread.participants.push(user);
							message.user = user;
						}
					}

					if (msgDoc.querySelector('.meta') !== null) {
						const date = msgDoc.querySelector('.meta').textContent;
						const m = moment(date, config.dateFormat);
						const timestamp = parseInt(m.format('X'));
						message.date = date;
						message.timestamp = timestamp;
						message.messages = [];
					}

					msgDoc.querySelector('body').childNodes.forEach((child) => {
						if (child.tagName === 'P') {
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
					});

					if (Object.keys(message).length > 0) {
						thread.conversation.push(message);	
					}

				}
			});
		}
		
		threads.push(thread);		
	});

	return threads;
};
