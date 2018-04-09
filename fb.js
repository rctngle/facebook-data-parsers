const fs = require('fs');
const getMessages = require('./parsers/messages');
const getProfile = require('./parsers/profile');
const getTimeline = require('./parsers/timeline');
const getFriends = require('./parsers/friends');
const getPhotos = require('./parsers/photos');
const getPokes = require('./parsers/pokes');
const getEvents = require('./parsers/events');
const getSecurity = require('./parsers/security');
const getAds = require('./parsers/ads');
const getApplications = require('./parsers/applications');

// contact info
const parsers = {
	profile: getProfile,
	timeline: getTimeline,
	messages: getMessages,
	friends: getFriends,
	photos: getPhotos,
	pokes: getPokes,
	events: getEvents,
	security: getSecurity,
	ads: getAds,
	applications: getApplications,
};

const fbDir = __dirname + '/facebook';
let exportSet = (process.argv.length > 2) ? process.argv[2] : false;

for (let set in parsers) {
	if (set === exportSet || !exportSet) {
		const result = parsers[set](fbDir);

		if (set !== 'messages') {
			const outputDir = './data';

			if (!fs.existsSync(outputDir)){
				fs.mkdirSync(outputDir);
			}

			fs.writeFileSync('./data/' + set + '.json', JSON.stringify(result));
		}
	}
}
