import {registry} from '@jahia/ui-extender';
import {AdminPanel} from './AdminPanel/AdminPanel';

const registerTranslationExportImport = () => {
    window.jahia.i18n.loadNamespaces('translationExportImport');

    const accordionType = 'accordionItem';
    const accordionKey = 'contentToolsAccordion';
    const accordionExists = window.jahia.uiExtender.registry.get(accordionType, accordionKey);

    if (!accordionExists) {
        registry.add(accordionType, accordionKey, registry.get(accordionType, 'renderDefaultApps'), {
            targets: ['jcontent:75'],
            icon: window.jahia.moonstone.toIconComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7h18v4H3V7zm2 6h14v8H5v-8zm3-8h8v2H8V5z"/></svg>'),
            label: 'translationExportImport:accordion.title',
            appsTarget: 'contentToolsAccordionApps'
        });
    }

    registry.add('adminRoute', 'translationExportImport', {
        targets: ['contentToolsAccordionApps'],
        icon: window.jahia.moonstone.toIconComponent('Language'),
        label: 'translationExportImport:label.menu',
        isSelectable: true,
        requireModuleInstalledOnSite: 'translationExportImport',
        render: AdminPanel
    });

    console.log('%c Export Content To CSV Component registered', 'color: #3c8cba');
};

export default function () {
    registry.add('callback', 'translationExportImport', {
        targets: ['jahiaApp-init:99'],
        callback: registerTranslationExportImport
    });
}
