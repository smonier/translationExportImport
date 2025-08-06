import React, {useEffect, useState} from 'react';
import {useLazyQuery, useMutation} from '@apollo/client';
import {Button, Header, Dropdown, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {GetSiteLanguagesQuery} from '~/gql-queries/ExportContent.gql-queries';
import {ApplyTranslationsMutation} from '~/gql-queries/ImportTranslations.gql-queries';

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
        for (const [uuid, props] of Object.entries(fileContent)) {
            for (const [property, value] of Object.entries(props)) {
                try {
                    await applyTranslation({variables: {uuid, language: selectedLanguage, property, value}});
                } catch (e) {
                    console.error('Translation import error', e);
                }
            }
        }
        if (window?.jahia?.ui?.notify) {
            window.jahia.ui.notify('success', null, t('label.importSuccess'));
        }
    };

    return (
        <>
            <Header
                title={t('label.importTranslations')}
                mainActions={[
                    <Button
                        key="importButton"
                        size="big"
                        color="accent"
                        label={t('label.importButton')}
                        onClick={handleImport}
                        isDisabled={!fileContent}
                    />
                ]}
            />
            <div>
                <Typography variant="heading">
                    {t('label.uploadFile')}
                </Typography>
                <input type="file" accept="application/json" onChange={handleFileChange}/>
                <Typography variant="heading">
                    {t('label.selectLanguage')}
                </Typography>
                <Dropdown
                    data={languages}
                    value={selectedLanguage}
                    placeholder={t('label.selectPlaceholder')}
                    onChange={(e, item) => setSelectedLanguage(item.value)}
                />
            </div>
        </>
    );
};
