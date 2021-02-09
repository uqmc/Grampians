'use strict';

const _ = require('lodash');
const { sanitizeEntity } = require('strapi-utils');

const sanitizeUser = user =>
  sanitizeEntity(user, {
    model: strapi.query('user', 'users-permissions').model,
  });

module.exports = {
  
  async get(ctx) {
    const memberships = await strapi.query("membership", "grampians").find({}, []);
    return memberships; 
  },

  /**
   * Process Membership Payments
   * @return {Object}
   */
  async pay(ctx) {
    const { membershipID, token } = ctx.request.body;

    //Get membership detailsfrom CMS
    const membership = await strapi.query("membership", "grampians").findOne({ id: membershipID });

    if (membership == null) {
      return ctx.badRequest("membership.notFound");
    }

    const pluginStore = strapi.store({
      environment: "", 
      type: 'plugin',
      name: 'grampians',
    });

    const stripeApiKey= await pluginStore.get({ key: "stripeApiKey" });

    const stripe = require("stripe")(stripApiKey);

    if (!stripe) {
      return ctx.badRequest("stripe.invalidKey");
    }

    return membership;
    /*
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
    */
  },
};