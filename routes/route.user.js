/**
 * 
 */
const {userBodyGuard} = require('../middleware/middleware.protects');

const express = require('express');
const router = express.Router();
const CoreError = require('./../core/core.error');
const {  userSettings, singleUser, deleteUser, audit, singleAudit, deleteAudit } = require('../controller/controller.user');
const { resources, singleResources, userResources, deleteResources } = require('../controller/controller.resources');
const { deleteSubscription, userSubscription, singleSubscription, subscription, allSubscription } = require('../controller/controller.subscription');
const { review, singleReview, userReview, deleteReview, allReview } = require('../controller/controller.review');
const { interest, singleInterest, allInterest, userInterest, deleteInterest } = require('../controller/controller.interest');
const { history, singleHistory, allHistory, userHistory, deleteHistory } = require('../controller/controller.history');
const { singleFavourite, allFavourite, userFavourite, deleteFavourite, favourite } = require('../controller/controller.favourite');

/**
 * auth routes
 */

router.put('/setting/:id', userSettings);
router.get('/single/:id', singleUser);
router.delete('/delete', deleteUser);

//AUDIT
router.post('/audit', audit);
router.get('/audit/:id', singleAudit);
router.delete('/audit/delete', deleteAudit);

//RESOURCES
router.post('/resources', resources);
router.get('/resources/:id', singleResources);
router.get('/resources/user/:id', userResources);
router.delete('/resources/delete', deleteResources);

// SUBSCRIPTION
router.post('/subscription', subscription);
router.get('/subscription/:id', singleSubscription);
router.get('/subscriptions', allSubscription);
router.delete('/subscription/delete', deleteSubscription);

//REVIEW
router.post('/review', review);
router.get('/review/:id', singleReview);
router.get('/reviews', allReview);
router.get('/review/user/:id', userReview);
router.delete('/review/delete', deleteReview);

//INTEREST
router.post('/interest', interest);
router.get('/interest/:id', singleInterest);
router.get('/interests', allInterest);
router.get('/interest/user/:id', userInterest);
router.delete('/interest/delete', deleteInterest);

//HISTORY
router.post('/history', history);
router.get('/history/:id', singleHistory);
router.get('/histories', allHistory);
router.get('/history/user/:id', userHistory);
router.delete('/history/delete', deleteHistory);

//FAVOURITES
router.post('/favourite', favourite);
router.get('/favourite/:id', singleFavourite);
router.get('/favourites', allFavourite);
router.get('/favourite/user/:id', userFavourite);
router.delete('/favourite/delete', deleteFavourite);

/**
 * Export lastly
 */
router.all('/*', (req, res) => {
    throw new CoreError(`route not found ${req.originalUrl} using ${req.method} method`, 404);
})

module.exports = router;