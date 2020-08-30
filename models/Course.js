const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Course title is required'],
	},
	description: {
		type: String,
		required: [true, 'Course description is required'],
	},
	weeks: {
		type: Number,
		required: [true, 'Please add course duration (in weeks)'],
	},
	tuition: {
		type: Number,
		required: [true, 'Please add a tuition cost'],
	},
	minimumSkill: {
		type: String,
		required: [true, 'Please add a minimum skill level'],
		enum: ['beginner', 'intermediate', 'advanced'],
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'bootcamp',
		required: true,
	},
});

// Static method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageCost: { $avg: '$tuition' },
			},
		},
	]);
	try {
		await this.model('bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
		});
	} catch (error) {
		console.error(error);
	}
};

// Call getAverageCost after save
CourseSchema.post('save', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('course', CourseSchema);
