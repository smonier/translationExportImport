import React, {useEffect, useState, useRef} from 'react';
import {useLazyQuery, useMutation} from '@apollo/client';
import {Button, Header, Dropdown, Typography, ArrowLeft} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useHistory, useRouteMatch} from 'react-router';
import {GetSiteLanguagesQuery} from '~/gql-queries/ExportTranslations.gql-queries';
import {UpdateContentMutation} from '~/gql-queries/ImportTranslations.gql-queries';
import styles from './ExportContent.component.scss';
import {LoaderOverlay} from '~/DesignSystem/LoaderOverlay';

export const ImportPanel = () => {
    const {t} = useTranslation('translationExportImport');
    const history = useHistory();
    const match = useRouteMatch();
    const baseUrl = match.url.split('/').slice(0, -1).join('/');
    const [fileContent, setFileContent] = useState(null);
    const [languages, setLanguages] = useState([]);
    const defaultLanguage = window.contextJsParameters.uilang;
    const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
    const [importReport, setImportReport] = useState(null);
    const fileInputRef = useRef();
    const [isLoading, setIsLoading] = useState(false);

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

    const [updateContent] = useMutation(UpdateContentMutation);

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
        setImportReport(null);
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

        setIsLoading(true);

        let modifiedCount = 0;
        let failedCount = 0;

        /* eslint-disable no-await-in-loop */
        for (const {uuid, properties} of fileContent) {
            const propertiesInput = [];
            for (const propertyObj of properties) {
                const propertyInput = {name: propertyObj.name, language: selectedLanguage};
                if (Array.isArray(propertyObj.values)) {
                    propertyInput.values = propertyObj.values;
                } else if (typeof propertyObj.value === 'string') {
                    propertyInput.value = propertyObj.value;
                } else {
                    console.warn('Unsupported property format', propertyObj);
                    continue;
                }

                propertiesInput.push(propertyInput);
            }

            if (propertiesInput.length === 0) {
                continue;
            }

            try {
                await updateContent({variables: {pathOrId: uuid, properties: propertiesInput}});
                modifiedCount += 1;
            } catch (e) {
                failedCount += 1;
                console.error('Translation import error', e);
            }
        }
        /* eslint-enable no-await-in-loop */

        setIsLoading(false);

        setImportReport({modified: modifiedCount, failed: failedCount});

        if (window?.jahia?.ui?.notify) {
            const message = failedCount > 0 ?
                t('label.importReportWithFails', {modified: modifiedCount, failed: failedCount}) :
                t('label.importReport', {modified: modifiedCount});
            window.jahia.ui.notify(failedCount > 0 ? 'warning' : 'success', null, message);
        }

        // Reset form
        setFileContent(null);
        setSelectedLanguage(defaultLanguage);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {isLoading && (
                <div className={styles.loaderOverlay}>
                    <div className={styles.spinner}>
                        <LoaderOverlay status={isLoading}/>
                    </div>
                </div>
            )}
            <Header
                title={t('label.headerImport', {siteInfo: siteKey})}
                backButton={(
                    <Button
                        icon={<ArrowLeft/>}
                        label={t('label.backButton')}
                        onClick={() => history.push(baseUrl)}
                    />
                )}
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
                        ref={fileInputRef}
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
                    {importReport && (
                        <Typography variant="body" className={styles.heading}>
                            {t(importReport.failed > 0 ? 'label.importReportWithFails' : 'label.importReport', {modified: importReport.modified, failed: importReport.failed})}
                        </Typography>
                    )}
                </div>
            </div>
        </>
    );
};
