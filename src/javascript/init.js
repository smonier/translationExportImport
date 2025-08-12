import {registry} from '@jahia/ui-extender';
import {AdminPanel} from './AdminPanel/AdminPanel';
import log from './log';

export default function () {
    window.jahia.i18n.loadNamespaces('translationExportImport');

    registry.add('callback', 'translationExportImport', {
        targets: ['jahiaApp-init:2'],
        callback: () => {
            registry.add('adminRoute', 'translationExportImport', {
                targets: ['jcontent:95'],
                icon: window.jahia.moonstone.toIconComponent('Language'),
                label: 'translationExportImport:label.menu',
                isSelectable: true,
                render: AdminPanel
            });

            log.info('%c translationExportImport is activated', 'color: #3c8cba');
        }
    });
}
