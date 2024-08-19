const express = require('express');
const auth = require("../middleware/auth");
const { offerValidationRules } = require('../validators/offerValidator');
const validateRequest = require('../middleware/validateRequest');
const { cleanUndefinedFields } = require('../utils');
const Offer = require('../models/offerModel');

const router = express.Router();

router.get('/', async (req, res) => {
    const { page, pageSize } = req.query;
    try {
        let limit = 10;
        if (pageSize) {
            limit = +pageSize;
        }

        if (pageSize > 20) {
            limit = 20;
        }

        let currentPage = 1;

        if (page) {
            currentPage = +page;
        }

        const skip = (page - 1) * limit;
        const Query = Offer.find({ deleted: false }).populate({ path: 'createdBy', select: 'email' });
        if (skip) Query.skip(skip);
        Query.limit(pageSize).sort({ createdAt: -1 });
        const [offers, total] = await Promise.all([Query, Offer.countDocuments({ deleted: false })]);
        return res
            .status(200)
            .json({
                data: offers,
                paging: {
                    total,
                    page: currentPage,
                    limit
                }
            });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

router.get('/my-offers', auth, async (req, res) => {
    const { page, pageSize } = req.query;
    try {
        let limit = 10;
        if (pageSize) {
            limit = +pageSize;
        }

        if (pageSize > 20) {
            limit = 20;
        }

        let currentPage = 1;

        if (page) {
            currentPage = +page;
        }

        const skip = (page - 1) * limit;
        const Query = Offer.find(
            { createdBy: req.userId, deleted: false }
        ).populate({ path: 'createdBy', select: 'email' });
        if (skip) Query.skip(skip);
        Query.limit(pageSize).sort({ createdAt: -1 });
        const [offers, total] = await Promise.all([Query, Offer.countDocuments({ deleted: false })]);
        return res
            .status(200)
            .json({
                data: offers,
                paging: {
                    total,
                    page: currentPage,
                    limit
                }
            });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

router.post(
    '/',
    auth,
    offerValidationRules,
    validateRequest,
    async (req, res) => {
        const {
            title,
            description,
            discountPercentage,
            originalPrice,
            validUntil
        } = req.body;
        try {
            const discountedPrice = originalPrice - (originalPrice * (discountPercentage / 100));

            const createData = cleanUndefinedFields({
                title,
                description,
                discountPercentage,
                originalPrice,
                validUntil
            });

            const offer = new Offer({
                ...createData,
                discountedPrice,
                createdBy: req.userId,
            });

            const savedOffer = await offer.save();
            res.status(201).json(savedOffer.toJSON());
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.put('/:id',
    auth,
    offerValidationRules,
    validateRequest,
    async (req, res) => {
        const { id } = req.params;
        const {
            title,
            description,
            discountPercentage,
            originalPrice,
            validUntil
        } = req.body;

        try {
            const offer = await Offer.findById(id);

            if (!offer) {
                return res.status(404).json({ message: 'Offer not found' });
            }

            if (offer.createdBy.toString() !== req.userId.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            const updateData = cleanUndefinedFields({
                title,
                description,
                discountPercentage,
                originalPrice,
                validUntil
            });

            Object.assign(offer, updateData);

            if (updateData.originalPrice !== undefined || updateData.discountPercentage !== undefined) {
                offer.discountedPrice = offer.originalPrice - (offer.originalPrice * (offer.discountPercentage / 100));
            }

            const updatedOffer = await offer.save();
            res.status(200).json(updatedOffer.toJSON());
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.delete(
    '/:id',
    auth,
    async (req, res) => {
        const { id } = req.params;
        try {
            const offer = await Offer.findById(id);
            if (!offer) {
                return res.status(404).json({ message: 'Offer not found' });
            }

            if (offer.createdBy.toString() !== req.userId.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            offer.deleted = true;

            await offer.save();
            res.status(200).json({ message: 'Offer removed' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

module.exports = router;