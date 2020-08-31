const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, 'Please add a title for the review'],
		maxlength: 100,
	},
	text: {
		type: String,
		required: [true, 'Add some text'],
	},
	rating: {
		type: Number,
		required: [true, 'Add a rating between 1 and 10'],
		min: 1,
		max: 10,
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
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'user',
		required: true,
	},
});

// Allow only one review per user per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: '$bootcamp',
				averageRating: { $avg: '$rating' },
			},
		},
	]);
	try {
		await this.model('bootcamp').findByIdAndUpdate(bootcampId, {
			averageRating: obj[0].averageRating,
		});
	} catch (error) {
		console.error(error);
	}
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function () {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('review', ReviewSchema);
