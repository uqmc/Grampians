'use strict';

const _ = require('lodash');
const { sanitizeEntity } = require('strapi-utils');

const sanitizeUser = user =>
  sanitizeEntity(user, {
    model: strapi.query('user', 'users-permissions').model,
  });

const stripe = require("stripe")(""); //TODO: Get api key from config?

module.exports = {
  
  /**
   * Process Membership Payments
   * @return {Object}
   */
  async pay(ctx) {
    const { membershipID, token } = ctx.request.body;

    //Get membership details from CMS
    if (!membershipID.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    const result = await strapi.query('membership').findOne({ id: membershipID });
    const membership = _.first(result) || null;

    if (membership == null) {
      return ctx.notFound();
    }

    const charge = await stripe.charges.create({
      amount: membership.price,
      currency: "aud",
      description: `Membership Payment`, //TODO: More details
      source: token
    });

    //TODO: Check if charge was successful?

    const user = ctx.state.user;
    const id = user.id;

    //TODO: Update user membership details if successful

    //TODO: Return success
  },
};