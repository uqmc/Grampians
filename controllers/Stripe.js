'use strict';

const _ = require('lodash');

module.exports = {
  
  /**
   * Process Membership Payments
   * @return {Object}
   */
  async get(ctx) {
    const pluginStore = strapi.store({
      environment: "", 
      type: 'plugin',
      name: 'grampians',
    });

    const stripeApiKey = await pluginStore.get({ key: 'stripeApiKey' }) || "";

    ctx.send({ stripeApiKey: stripeApiKey });
  },

  async update(ctx) {
    const stripeApiKey = ctx.request.body.stripeApiKey || "";

    const pluginStore = strapi.store({
      environment: "", 
      type: 'plugin',
      name: 'grampians',
    });

    await pluginStore.set({
      key: 'stripeApiKey',
      value: stripeApiKey
    });

    ctx.send({ ok: true });
  }
};