'use strict';

const _ = require('lodash');
const { sanitizeEntity } = require('strapi-utils');

const sanitizeUser = user =>
  sanitizeEntity(user, {
    model: strapi.query('user', 'users-permissions').model,
  });

module.exports = {
  
  /**
   * Update a user's own record.
   * @return {Object}
   */
  async updateMe(ctx) {
    const { email, username, password } = ctx.request.body;
    
    const advancedConfigs = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .get();

    const user = ctx.state.user;
    const id = user.id;

    if (_.has(ctx.request.body, 'email') && !email) {
      return ctx.badRequest('email.notNull');
    }

    if (_.has(ctx.request.body, 'username') && !username) {
      return ctx.badRequest('username.notNull');
    }

    if (_.has(ctx.request.body, 'password') && !password && user.provider === 'local') {
      return ctx.badRequest('password.notNull');
    }

    if (_.has(ctx.request.body, 'username')) {
      const userWithSameUsername = await strapi
        .query('user', 'users-permissions')
        .findOne({ username });

      if (userWithSameUsername && userWithSameUsername.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.username.taken',
            message: 'username.alreadyTaken.',
            field: ['username'],
          })
        );
      }
    }

    if (_.has(ctx.request.body, 'email') && advancedConfigs.unique_email) {
      const userWithSameEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({ email: email.toLowerCase() });

      if (userWithSameEmail && userWithSameEmail.id != id) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.email.taken',
            message: 'Email already taken',
            field: ['email'],
          })
        );
      }
      ctx.request.body.email = ctx.request.body.email.toLowerCase();
    }

    let updateData = {
      ...ctx.request.body,
    };

    if (_.has(ctx.request.body, 'password') && password === user.password) {
      delete updateData.password;
    }

    const sensitive = [
      'agreedLiabilityWaiver',
      'agreedMembershipContract',
      'currentMembershipLength',
      'currentMembershipStartDate',
      'swimTestCompleted',
      'tapes',
      'confirmed',
      'blocked',
      'resetPasswordToken',
      'provider', 
      'username',
      'email',
      'role',
      'id',
    ];

    for (const field of sensitive) {
      if (_.has(ctx.request.body, field)) {
        delete updateData[field];
      }
    }

    const data = await strapi.plugins['users-permissions'].services.user.edit({ id }, updateData);

    ctx.send(sanitizeUser(data));
  },
};