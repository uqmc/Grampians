const pluginPermissions = {
  // Stripe
  readStripeSettings: [
    { action: 'plugins::grampians.stripe.read', subject: null },
  ],
  updateStripeSettings: [
    { action: 'plugins::grampians.stripe.update', subject: null },
  ],
};

export default pluginPermissions;