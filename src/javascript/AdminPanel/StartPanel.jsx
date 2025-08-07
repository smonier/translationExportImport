import React from 'react';
import {Button, Header} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router';
import PropTypes from 'prop-types';

export const StartPanel = ({match}) => {
    const {t} = useTranslation('translationExportImport');
    const history = useHistory();
    const siteKey = window.contextJsParameters.siteKey;

    const goTo = path => () => {
        history.push(`${match.url}/${path}`);
    };

    return (
        <div>
            <Header title={t('label.title', {siteInfo: siteKey})}/>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2rem',
                    minHeight: '60vh'
                }}
            >
                <div style={{width: '60%', textAlign: 'center'}}>
                    <h2>{t('label.process')}</h2>
                </div>
                <h3>{t('label.selectAction')}</h3>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <Button
                        key="import"
                        size="big"
                        color="accent"
                        label={t('label.importButton')}
                        onClick={goTo('import')}
                    />
                    <Button
                        key="export"
                        size="big"
                        color="accent"
                        label={t('label.exportButton')}
                        onClick={goTo('export')}
                    />
                </div>
            </div>
        </div>
    );
};

StartPanel.propTypes = {
    match: PropTypes.shape({
        url: PropTypes.string.isRequired
    }).isRequired
};
