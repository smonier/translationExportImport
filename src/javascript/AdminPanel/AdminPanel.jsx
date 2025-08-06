import React from 'react';
import {Route, Switch, Redirect} from 'react-router';
import {ExportPanel} from './ExportPanel';
import {ImportPanel} from './ImportPanel';

export const AdminPanel = ({match}) => (
    <Switch>
        <Route path={`${match.path}/import`} component={ImportPanel}/>
        <Route path={`${match.path}/export`} component={ExportPanel}/>
        <Redirect to={`${match.path}/export`}/>
    </Switch>
);
