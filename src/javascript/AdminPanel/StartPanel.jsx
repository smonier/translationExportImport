import React from 'react';
import {Button, Header} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router';
import PropTypes from 'prop-types';

export const StartPanel = ({match}) => {
    const {t} = useTranslation('translationExportImport');
    const history = useHistory();

    const goTo = path => () => {
        history.push(`${match.url}/${path}`);
    };

    return (
        <>
            <Header title={t('label.selectAction')}/>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
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
        </>
    );
};

StartPanel.propTypes = {
    match: PropTypes.shape({
        url: PropTypes.string.isRequired
    }).isRequired
};
