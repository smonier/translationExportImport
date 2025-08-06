import {registry} from '@jahia/ui-extender';
import {AdminPanel} from './AdminPanel/AdminPanel';
import DefaultEntry from '@jahia/moonstone/dist/icons/components/DefaultEntry';
import i18next from 'i18next';
import React from 'react';

export default async function () {
    await i18next.loadNamespaces('translationExportImport');

    registry.add('adminRoute', 'translationExportImport', {
        targets: ['administration-sites:10'],
        icon: <DefaultEntry/>,
        label: 'translationExportImport:label.title',
        isSelectable: true,
        render: AdminPanel
    });

    console.debug('%c translationExportImport is activated', 'color: #3c8cba');
}
