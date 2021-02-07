import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import App from './containers/App';
import Initializer from './containers/Initializer';
import lifecycles from './lifecycles';
import Settings from './containers/Settings';

export default strapi => {
  const pluginDescription = "";
  const name = "Grampians";

  // Declare the links that will be injected into the settings menu
  const menuSection = {
    id: pluginId,
    title: {
      id: `${pluginId}.uqmc`,
      defaultMessage: 'UQMC Membership',
    },
    links: [
      {
        title: 'Strip Settings',
        to: `${strapi.settingsBaseURL}/${pluginId}/stripe`,
        name: 'stripe',
      },
    ],
  };;

  const plugin = {
    blockerComponent: null,
    blockerComponentProps: {},
    description: pluginDescription,
    id: pluginId,
    initializer: Initializer,
    injectedComponents: [],
    isReady: false,
    isRequired: false,
    layout: null,
    lifecycles,
    mainComponent: App,
    name,
    preventComponentRendering: false,
    settings: {
      mainComponent: Settings,
      menuSection
    },
    trads: {},
  };

  return strapi.registerPlugin(plugin);
};
