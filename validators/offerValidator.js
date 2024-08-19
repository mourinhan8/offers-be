const { body } = require('express-validator');

const offerValidationRules = [
    body('title')
        .notEmpty()
        .withMessage('Title is required'),
    body('discountPercentage')
        .notEmpty()
        .withMessage('Discount percentage is required')
        .isNumeric()
        .withMessage('Discount percentage must be a number')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Discount percentage must be between 0 and 100'),
    body('originalPrice')
        .notEmpty()
        .withMessage('Original price is required')
        .isNumeric()
        .withMessage('Original price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Original price must be a positive number'),
    body('validUntil')
        .notEmpty()
        .withMessage('Valid until date is required')
        .isISO8601()
        .withMessage('Valid until date must be a valid date format (YYYY-MM-DD)'),
];

module.exports = { offerValidationRules };
