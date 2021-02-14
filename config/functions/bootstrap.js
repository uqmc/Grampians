'use strict';

const grampiansActions = require('../grampians-actions');

module.exports = async () => {
  const { actionProvider } = strapi.admin.services.permission;
  actionProvider.register(grampiansActions.actions);
};