import React, {useEffect, useState} from 'react';
import {useLazyQuery} from '@apollo/client';
import {GetSiteLanguagesQuery, FetchSiteInternationalizedContents} from '~/gql-queries/ExportTranslations.gql-queries';
import {Button, Header, Dropdown, Typography, Input, ArrowLeft} from '@jahia/moonstone';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import styles from './ExportContent.component.scss';
import {useTranslation} from 'react-i18next';
import {exportJSONFile} from './Export.utils';
import log from '~/log';
import {useHistory, useRouteMatch} from 'react-router';

export const ExportPanel = () => {
    const {t} = useTranslation('translationExportImport');
    const history = useHistory();
    const match = useRouteMatch();
    const baseUrl = match.url.split('/').slice(0, -1).join('/');
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(window.contextJsParameters.uilang);
    const [isExporting, setIsExporting] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState('');
    const [pendingExport, setPendingExport] = useState(null);
    const [exportFilename, setExportFilename] = useState('');
    const [pathSuffix, setPathSuffix] = useState('');

    const siteKey = window.contextJsParameters.siteKey;
    const sitePath = '/sites/' + siteKey;
    const workspace = window.contextJsParameters.workspace === 'default' ? 'EDIT' : 'LIVE';
    const baseContentPath = `/sites/${siteKey}`;

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

    const [fetchSiteInternationalizedContents] = useLazyQuery(FetchSiteInternationalizedContents, {
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        fetchSiteLanguages();
    }, [fetchSiteLanguages]);

    useEffect(() => {
        if (languagesData?.jcr?.nodeByPath?.languages?.values) {
            const langs = languagesData.jcr.nodeByPath.languages.values.map(l => ({label: l, value: l}));
            setLanguages(langs);
        }
    }, [languagesData]);

    const notify = (type, message) => {
        if (window?.jahia?.ui?.notify) {
            window.jahia.ui.notify(type, null, message);
        } else {
            console.warn(message);
        }
    };

    const sanitizeTranslationNodes = nodes => {
        return nodes
            .map(node => {
                const {__typename, properties, primaryNodeType, ...rest} = node;
                const sanitizedNode = {...rest};

                if (primaryNodeType) {
                    const {__typename: ptTypename, ...ptRest} = primaryNodeType;
                    sanitizedNode.primaryNodeType = ptRest;
                }

                if (Array.isArray(properties)) {
                    const sanitizedProps = properties.reduce((acc, {__typename: _, name, value, values}) => {
                        const hasSingleValue = value !== undefined && value !== null && value !== '';
                        const hasMultipleValues = Array.isArray(values) && values.length > 0;

                        if (hasSingleValue) {
                            acc[name] = value;
                        } else if (hasMultipleValues) {
                            acc[name] = values;
                        }

                        return acc;
                    }, {});

                    if (Object.keys(sanitizedProps).length > 0) {
                        sanitizedNode.properties = [sanitizedProps];
                    }
                }

                return sanitizedNode.properties ? sanitizedNode : null;
            })
            .filter(Boolean);
    };

    const handleExport = () => {
        setIsExporting(true);
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        const filename = `${siteKey}_${selectedLanguage}_${timestamp}`;
        setExportFilename(filename);

        fetchSiteInternationalizedContents({
            variables: {
                path: pathSuffix ? `${sitePath}/${pathSuffix}` : sitePath,
                language: selectedLanguage
            }
        })
            .then(response => {
                if (response?.errors) {
                    log.error('GraphQL errors fetching content for export:', response.errors);
                    notify('error', t('label.exportError'));
                    return;
                }

                const nodes = response?.data?.jcr?.nodeByPath?.descendants?.nodes;

                if (!nodes) {
                    notify('error', t('label.exportError'));
                    return;
                }

                const sanitized = sanitizeTranslationNodes(nodes);
                setPendingExport({type: 'json', data: sanitized});
                setPreviewData(JSON.stringify(sanitized, null, 2));
                setIsPreviewOpen(true);
            })
            .catch(err => {
                log.error('Error fetching content for export:', err);
                notify('error', t('label.exportError'));
            })
            .finally(() => {
                setIsExporting(false);
            });
    };

    const confirmDownload = () => {
        exportJSONFile(pendingExport.data, exportFilename);
        notify('success', `${exportFilename}.json`);

        setIsPreviewOpen(false);
        setPreviewData('');
        setPendingExport(null);
    };

    const cancelPreview = () => {
        setIsPreviewOpen(false);
        setPreviewData('');
        setPendingExport(null);
    };

    // --- Folder Picker Handler ---
    const handleOpenPathPicker = () => {
        const initialPath = pathSuffix ? `${baseContentPath}/${pathSuffix}` : baseContentPath;

        window.CE_API.openPicker({
            type: 'editorial',
            initialSelectedItem: [initialPath],
            site: window.jahiaGWTParameters.siteKey,
            lang: window.jahiaGWTParameters.uilang,
            isMultiple: false,
            setValue: ([selected]) => {
                if (selected?.path) {
                    const selectedPath = selected.path.replace(`${baseContentPath}/`, '');
                    setPathSuffix(selectedPath);
                }
            }
        });
    };

    return (
        <>
            <Dialog
                open={isPreviewOpen}
                onClose={cancelPreview}
            >
                <DialogTitle>{t('label.previewTitle')}</DialogTitle>
                <DialogContent>
                    <pre style={{maxHeight: '400px', overflow: 'auto'}}>{previewData}</pre>
                </DialogContent>
                <DialogActions>
                    <Button label={t('label.previewCancel')} onClick={cancelPreview}/>
                    <Button label={t('label.previewDownload')} color="accent" onClick={confirmDownload}/>
                </DialogActions>
            </Dialog>
            <Header
                title={t('label.headerExport', {siteInfo: siteKey})}
                backButton={(
                    <Button
                        icon={<ArrowLeft/>}
                        label={t('label.backButton')}
                        onClick={() => history.push(baseUrl)}
                    />
                )}
                mainActions={[
                    <Button
                        key="exportButton"
                        size="big"
                        id="exportButton"
                        color="accent"
                        isDisabled={isExporting}
                        label={isExporting ? t('label.exporting') : t('label.exportTranslations')}
                        onClick={isExporting ? null : handleExport}
                    />
                ]}
            />
            <div className={styles.container}>
                <div className={styles.leftPanel}>
                    <Typography variant="heading" className={styles.heading}>
                        {t('label.path')}
                    </Typography>
                    <div className={styles.pathContainer}>
                        <Typography variant="body" className={styles.baseContentPath}>
                            {sitePath}/
                        </Typography>
                        <Input
                            value={pathSuffix}
                            placeholder={t('label.enterPathSuffix')}
                            className={styles.pathSuffixInput}
                            onChange={e => setPathSuffix(e.target.value)}
                        />
                        <Button
                            label={t('label.selectFolder')}
                            onClick={handleOpenPathPicker}
                        />
                    </div>
                    <Typography variant="body" className={`${styles.baseContentPath} ${styles.baseContentPathHelp}`}>
                        {t('label.enterPathSuffixHelp')}
                    </Typography>
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
