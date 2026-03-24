        // src/AppInsights.js
        import { ApplicationInsights } from '@microsoft/applicationinsights-web';
        import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
        import { createBrowserHistory } from 'history';

        const browserHistory = createBrowserHistory({ basename: '' });
        const reactPlugin = new ReactPlugin();
        const appInsights = new ApplicationInsights({
            config: {
                instrumentationKey: '085e95e4-fa58-4e21-9cbc-e53e29555d79', // Replace with your key
                extensions: [reactPlugin],
                extensionConfig: {
                    [reactPlugin.identifier]: { history: browserHistory },
                },
            },
        });
        appInsights.loadAppInsights();

        export { reactPlugin, appInsights };