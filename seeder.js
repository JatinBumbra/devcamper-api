const mongoose = require('mongoose');
const fs = require('fs');
const colors = require('colors');
const dotenv = require('dotenv');
// Load env variables
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// Connect ot DB
require('./config/db')();

// Read JSON files
const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const courses = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
	try {
		console.log('Saving data...'.bgBlue);
		await Bootcamp.create(bootcamps);
		await Course.create(courses);
		console.log('Data saved...'.bgGreen);
		process.exit();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};
// Destroy data
const deleteData = async () => {
	try {
		console.log('Deleting data...'.bgBlue);
		await Bootcamp.deleteMany();
		await Course.deleteMany();
		console.log('Data deleted...'.bgRed);
		process.exit();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

if (process.argv[2] == '-i') {
	importData();
} else if (process.argv[2] == '-d') {
	deleteData();
}
