import React, {useEffect, useState} from 'react';
import {useLazyQuery, useMutation} from '@apollo/client';
import {Button, Header, Dropdown, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {GetSiteLanguagesQuery} from '~/gql-queries/ExportTranslations.gql-queries';
import {ApplyTranslationsMutation, ApplyTranslationsOnMultipleMutation} from '~/gql-queries/ImportTranslations.gql-queries';
import styles from './ExportContent.component.scss';

export const ImportPanel = () => {
    const {t} = useTranslation('translationExportImport');
    const [fileContent, setFileContent] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(window.contextJsParameters.uilang);

    const siteKey = window.contextJsParameters.siteKey;
    const sitePath = '/sites/' + siteKey;
    const workspace = window.contextJsParameters.workspace === 'default' ? 'EDIT' : 'LIVE';

    const [fetchSiteLanguages, {data: languagesData}] = useLazyQuery(GetSiteLanguagesQuery, {
        variables: {
            workspace: workspace,
            scope: sitePath
        },
        fetchPolicy: 'network-only',
        onError: error => {
            console.error('GetSiteLanguages error', error);
        }
    });

    const [applyTranslation] = useMutation(ApplyTranslationsMutation);

    useEffect(() => {
        fetchSiteLanguages();
    }, [fetchSiteLanguages]);

    useEffect(() => {
        if (languagesData?.jcr?.nodeByPath?.languages?.values) {
            const langs = languagesData.jcr.nodeByPath.languages.values.map(l => ({label: l, value: l}));
            setLanguages(langs);
        }
    }, [languagesData]);

    const handleFileChange = event => {
        const file = event.target.files[0];
        if (!file) {
            setFileContent(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const json = JSON.parse(e.target.result);
                setFileContent(json);
            } catch (err) {
                console.error('Invalid JSON file', err);
                setFileContent(null);
            }
        };

        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!fileContent || !selectedLanguage) {
            return;
        }

        const mutations = [];

        for (const {uuid, properties} of fileContent) {
            for (const {name: property, value} of properties) {
                const mutation = Array.isArray(value) ? ApplyTranslationsOnMultipleMutation : ApplyTranslationsMutation;
                const variables = Array.isArray(value) ?
                    {uuid, language: selectedLanguage, property, values: value} :
                    {uuid, language: selectedLanguage, property, value};

                mutations.push(applyTranslation({mutation, variables}).catch(e =>
                    console.error('Translation import error', e)
                ));
            }
        }

        await Promise.all(mutations);

        if (window?.jahia?.ui?.notify) {
            window.jahia.ui.notify('success', null, t('label.importSuccess'));
        }
    };

    return (
        <>
            <Header
                title={t('label.headerImport', {siteInfo: siteKey})}
                mainActions={[
                    <Button
                        key="importButton"
                        size="big"
                        color="accent"
                        label={t('label.importButton')}
                        isDisabled={!fileContent}
                        onClick={handleImport}
                    />
                ]}
            />
            <div className={styles.container}>
                <div className={styles.leftPanel}>
                    <Typography variant="heading" className={styles.heading}>
                        {t('label.uploadFile')}
                    </Typography>
                    <input
                        accept="application/json"
                        className={styles.fileInput}
                        type="file"
                        onChange={handleFileChange}
                    />
                    <Typography variant="heading" className={styles.heading}>
                        {t('label.selectLanguage')}
                    </Typography>
                    <Dropdown
                        data={languages}
                        value={selectedLanguage}
                        className={styles.customDropdown}
                        placeholder={t('label.selectPlaceholder')}
                        onChange={(e, item) => setSelectedLanguage(item.value)}
                    />
                </div>
            </div>
        </>
    );
};
