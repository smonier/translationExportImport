import React from 'react';
import {Route, Switch, Redirect} from 'react-router';
import PropTypes from 'prop-types';
import {ExportPanel} from './ExportPanel';
import {ImportPanel} from './ImportPanel';
import {StartPanel} from './StartPanel';

export const AdminPanel = ({match}) => (
    <Switch>
        <Route exact path={match.path} component={StartPanel}/>
        <Route path={`${match.path}/import`} component={ImportPanel}/>
        <Route path={`${match.path}/export`} component={ExportPanel}/>
        <Redirect to={match.path}/>
    </Switch>
);

AdminPanel.propTypes = {
    match: PropTypes.shape({
        path: PropTypes.string.isRequired
    }).isRequired
};
