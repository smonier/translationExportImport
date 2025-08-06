import {registry} from '@jahia/ui-extender';
import {AdminPanel} from './AdminPanel';
import React, {Suspense} from 'react';
import DefaultEntry from '@jahia/moonstone/dist/icons/components/DefaultEntry';

export const registerRoutes = () => {
    registry.add('adminRoute', 'translationExportImport', {
        targets: ['administration-sites:10'],
        icon: <DefaultEntry/>,
        label: 'translationExportImport:label.title',
        isSelectable: true,
        render: v => <Suspense fallback="loading ..."><AdminPanel match={v.match}/></Suspense>
    });

    console.debug('%c translationExportImport is activated', 'color: #3c8cba');
};
