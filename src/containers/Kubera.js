import React from 'react';
import { connect } from 'react-redux';
import CredentialsForm from '../components/CredentialsForm';
import {
  credentialsSelector,
  resetCredentials,
  saveCredentials,
} from '../redux';

class Kubera extends React.Component {
  render() {
    const { credentials, onResetCredentials, onSaveCredentials } = this.props;

    return (
      <main>
        <CredentialsForm
          {...credentials}
          onReset={onResetCredentials}
          onSave={onSaveCredentials}
        />
      </main>
    );
  }
}

function mapStateToProps(state) {
  return {
    credentials: credentialsSelector(state),
  };
}

const mapDispatchToProps = {
  onResetCredentials: resetCredentials,
  onSaveCredentials: saveCredentials,
};

export default connect(mapStateToProps, mapDispatchToProps)(Kubera);
