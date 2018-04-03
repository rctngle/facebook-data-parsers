
const locale = 'en-GB';

const dateFormats = {};
dateFormats['en'] = 'dddd, MMMM D, YYYY at h:mm UTCZ';
dateFormats['en-GB'] = 'dddd, D MMMM YYYY at hh:mm UTCZ';

module.exports = {
	locale: locale,
	dateFormat: dateFormats[locale],
	dateFormatShort: 'D MMMM YYYY',
};