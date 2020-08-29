const geocoder = require('node-geocoder');

const options = {
	provider: process.env.GEOCODER_PROVIDER,
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_KEY,
	formatter: null,
};

module.exports = geocoder(options);
