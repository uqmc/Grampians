import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { Header } from '@buffetjs/custom';
import pluginId from '../../pluginId';
import { SettingsPageTitle, FormBloc, SizedInput, request } from 'strapi-helper-plugin';

//TODO: This whole page could use some improvements, but as an MVP it works.
//Based on: https://github.com/strapi/strapi/blob/master/packages/strapi-plugin-users-permissions/admin/src/containers/AdvancedSettings/index.js
const StripePage = () => {
  const [data, setData] = useState(null);
  
  async function getStripeData() {
    const res = await request("/grampians/stripe", { method: "GET" });
    setData(res.stripeApiKey);
  }

  const handleChange = (event) => {
    setData(event.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    request("/grampians/stripe", {
      method: "PUT",
      body: {
        stripeApiKey: data
      }
    });
  }

  useEffect(() => {
    getStripeData();
  }, [])

  const headerActions = useMemo(() => {
    return [
      {
        color: "success",
        label: "Save",
        type: "submit",
        style: {
          minWidth: 150,
          fontWeight: 600,
        },
      },
    ];
  }, []);

  return (
    <>
      <SettingsPageTitle name="Stripe Settings" />
      <div>
        <form onSubmit={handleSubmit}>
          <Header actions={headerActions} title={{label: "Stripe Settings"}} />
          <FormBloc title="Settings"> 
            <SizedInput
              key="stripeApiKey"
              name="stripeApiKey"
              label="Stripe API Key"
              type="text"
              onChange={handleChange}
              value={data}
            />
          </FormBloc>
        </form>
      </div>
    </>
  )
};

const Settings = ({ settingsBaseURL }) => {
  return (
    <Switch>
      <Route component={StripePage} path={`${settingsBaseURL}/${pluginId}/stripe`} />
    </Switch>
  );
};

Settings.propTypes = {
  settingsBaseURL: PropTypes.string.isRequired,
};

export default Settings;
