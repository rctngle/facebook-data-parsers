const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = function(fbDir) {

	const content = fs.readFileSync(fbDir + '/index.htm', 'utf8').toString();
	const dom = new JSDOM(content);
	const doc = dom.window.document;

	const profile = {};

	const getNodeContent = function(node) {
		let nodeContent;
		if (node.querySelector('br') !== null) {
			let nodeContents = [];
			node.childNodes.forEach((child) => {
				if (child.nodeType === 3) {
					nodeContents.push(child.textContent);
				}
			});
			nodeContent = nodeContents;
		} else {
			nodeContent = node.textContent.trim();
		}

		return nodeContent;
	};

	doc.querySelectorAll('tr').forEach((row) => {

		const heading = row.querySelector('th').textContent.trim();
		const key = heading.toLowerCase();
		let value;

		if (row.querySelector('td ul li') !== null) {
			value = [];
			row.querySelectorAll('td ul li').forEach(function(item) {
				value.push(getNodeContent(item));
			});
		} else {
			value = getNodeContent(row.querySelector('td'));
			if (['other', 'groups', 'pages you admin'].indexOf(key) >= 0) {
				value = value.split(', ');
			}
		}

		profile[key] = value;
	});

	return profile;
};
