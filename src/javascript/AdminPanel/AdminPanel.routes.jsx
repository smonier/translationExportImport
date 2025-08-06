import {registry} from '@jahia/ui-extender';
import constants from './AdminPanel.constants';
import {AdminPanel} from './AdminPanel';
import React, {Suspense} from 'react';
import DefaultEntry from '@jahia/moonstone/dist/icons/components/DefaultEntry';

export const registerRoutes = () => {
    registry.add('adminRoute', 'translationExportImport', {
        targets: ['administration-sites:10'],
        icon: <DefaultEntry/>,
        label: 'translationExportImport:translationExportImport.label',
        path: `${constants.ROUTE}*`, // Catch everything and let the app handle routing logic
        defaultPath: constants.ROUTE_DEFAULT_PATH,
        isSelectable: true,
        render: v => <Suspense fallback="loading ..."><AdminPanel match={v.match}/></Suspense>
    });

    console.debug('%c translationExportImport is activated', 'color: #3c8cba');
};
