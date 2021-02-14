'use strict';

const _ = require('lodash');
const { sanitizeEntity } = require('strapi-utils');

const parse = require("date-fns/parse");
const add = require("date-fns/add");
const isFuture = require("date-fns/isFuture");

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

    //Get membership details from CMS
    const membership = await strapi.query("membership", "grampians").findOne({ id: membershipID });

    if (membership == null) {
      return ctx.badRequest("Invalid Membership Selected");
    }

    //Get Stripe Secret Key from plugin settings
    const pluginStore = strapi.store({
      environment: "", 
      type: 'plugin',
      name: 'grampians',
    });
    const stripeApiKey = await pluginStore.get({ key: "stripeApiKey" });

    //Create Stripe Object
    const stripe = require("stripe")(stripeApiKey);

    if (!stripe) {
      return ctx.badRequest("An error has occured, please contact a system administrator.");
    }

    //Get user from request
    const user = ctx.state.user;

    //Create Charge using Stripe Charge API, with provided token
    const charge = await stripe.charges.create({
      amount: membership.price * 100, //Convert dollars to cents
      currency: "aud",
      description: `UQMC Membership Payment`, //TODO: More details
      source: token,
      receipt_email: user.email
    }).catch(error => {
      return error;
    });

    if (charge.status != "succeeded") {
      return ctx.badRequest(charge.raw.message);
    }

    const { id, currentMembershipLength } = user;

    strapi.query("membershipLog", "grampians").create({
      user: id,
      membership: membershipID,
      receipt: charge.receipt_url
    });

    //TODO: Lifetime membership override?

    const currentMembershipEndDate = add(parse(user.currentMembershipStartDate, "yyyy-MM-dd", new Date()), { days: currentMembershipLength });

    let updateData = {}

    //TODO: Clean this up.
    if (isFuture(currentMembershipEndDate)) {
      updateData = {
        currentMembershipLength: currentMembershipLength + membership.dayLength
      }
    } else {
      updateData = {
        currentMembershipStartDate: new Date(),
        currentMembershipLength: membership.dayLength
      }
    }

    const data = await strapi.plugins['users-permissions'].services.user.edit({ id }, updateData);

    ctx.send({ ok: true });
  },
};