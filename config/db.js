const mongoose = require('mongoose');

const connectDb = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useCreateIndex: true,
			useFindAndModify: false,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
};

module.exports = connectDb;
