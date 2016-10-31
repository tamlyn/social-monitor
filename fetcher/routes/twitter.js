'use strict';
const express = require('express');
const logger = require('winston');
const Joi = require('joi');
const _ = require('lodash');

const twitterService = require('../services/twitter');
const registration = require('../services/registration');
const responses = require('../services/responses');

const router = express.Router({mergeParams: true});

/**
 * Request the Twitter timeline for multiple users
 * @param {string} applicationId - The id of the registered application
 * @param {array} screenNames - An array of the Twitter screenNames that should be fetched
 */
router.route('/timeline').all(registration.middleware).post((req, res, next) => {

	const schema = Joi.object().keys({
		applicationId: Joi.string().guid().required(),
		screenNames: Joi.array().items(Joi.string()).min(1).required()
	});

	const args = {
		applicationId: req.body.applicationId,
		screenNames: req.body.screenNames
	};

	const result = Joi.validate(args, schema, {abortEarly: false});

	if (result.error) {
		return res.status(400).send(responses.invalidArguments(result));
	}

	twitterService.getApplicationToken(args.applicationId)
		.then((token) => Promise.all(args.screenNames.map((name) => twitterService.requestUserTimeline(token, name).reflect())))
		.then((responses) => Promise.all(responses.map((response) => twitterService.storeTimeline(args.applicationId, response).reflect())))
		.then((results) => {
			const errors = _.remove(results, (p) => p.isRejected());
			const errorsOccured = !_.isEmpty(errors);

			if (errorsOccured) {
				logger.warn(errors.map((err) => err.reason()).join("\n"));
				res.status(207).send({errors: errors.map((err) => twitterService.getScreenNameFromError(err.reason()))});
			} else {
				res.status(200).send();
			}
		})
		.catch((error) => {
			logger.error(`Error when requesting the timeline for ${args.applicationId}: ${error}`);
			next(error);
		});
});

/**
 * Register a twitter client with the service, request or refresh the bearer token
 * @param {string} applicationId - The applicationId that was used for registration
 * @param {string} twitterId - The API key of the Twitter application
 * @param {string} twitterSecret - The API secret of the Twitter application
 */
router.route('/register').all(registration.middleware).post((req, res, next) => {
	const schema = Joi.object().keys({
		applicationId: Joi.string().guid().required(),
		twitterId: Joi.string().required(),
		twitterSecret: Joi.string().required()
	});

	const args = {
		applicationId: req.body.applicationId,
		twitterId: req.body.twitterId,
		twitterSecret: req.body.twitterSecret
	};

	const result = Joi.validate(args, schema, {abortEarly: false});

	if (result.error) {
		return res.status(400).send(responses.invalidArguments(result));
	}

	return twitterService.requestBearerToken(args.twitterId, args.twitterSecret)
		.then((token) => {
			return twitterService.registerApplication(args.applicationId, token)
		})
		.then(() => res.status(200).send())
		.catch((error) => {
			logger.error(`Error when requesting a token for client ${args.applicationId}: ${err}`);
			next(error);
		});
});

module.exports = router;
