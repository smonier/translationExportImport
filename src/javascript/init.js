import {registry} from '@jahia/ui-extender';
import register from './AdminPanel.register';

export default function () {
    registry.add('callback', 'translationExportImport', {
        targets: ['jahiaApp-init:2'],
        callback: register
    });
}
