import React from 'react';
import { connect } from 'react-redux';
import { ConfigurationForm, CredentialsForm, Report } from '../components';
import {
  configurationSelector,
  credentialsSelector,
  reportSelector,
  saveConfiguration,
  saveCredentials,
} from '../redux';

class Kubera extends React.Component {
  render() {
    const {
      configuration,
      credentials,
      onSaveConfiguration,
      onSaveCredentials,
      report,
    } = this.props;

    return (
      <main>
        <CredentialsForm {...credentials} onSave={onSaveCredentials} />
        <ConfigurationForm {...configuration} onSave={onSaveConfiguration} />
        <Report {...report} />
      </main>
    );
  }
}

function mapStateToProps(state) {
  return {
    configuration: configurationSelector(state),
    credentials: credentialsSelector(state),
    report: reportSelector(state),
  };
}

const mapDispatchToProps = {
  onSaveConfiguration: saveConfiguration,
  onSaveCredentials: saveCredentials,
};

export default connect(mapStateToProps, mapDispatchToProps)(Kubera);
