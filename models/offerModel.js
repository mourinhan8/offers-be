const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true,
    },
    discountedPrice: {
        type: Number,
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false,
    }
}, {
    collection: 'Offer',
    timestamps: true,
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
