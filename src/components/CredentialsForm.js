import React from 'react';

const stateFromProps = props => ({
  gitHubToken: props.gitHubToken,
  harvestAccountId: props.harvestAccountId,
  harvestToken: props.harvestToken,
});
 
class CredentialsForm extends React.Component {
  static defaultProps = {
    gitHubToken: '',
    harvestAccountId: '',
    harvestToken: '',
    onSave: () => {},
  };

  state = stateFromProps(this.props);

  componentWillReceiveProps(nextProps) {
    const { gitHubToken, harvestAccountId, harvestToken } = this.props;

    if (
      gitHubToken !== nextProps.gitHubToken ||
      harvestAccountId !== nextProps.harvestAccountId ||
      harvestToken !== nextProps.harvestToken
    ) {
      this.setState(stateFromProps(nextProps));
    }
  }

  handleChange = event => {
    const { name, value } = event.target;

    this.setState({ [name]: value });
  };

  handleSave = () => {
    const { gitHubToken, harvestAccountId, harvestToken } = this.state;

    this.props.onSave({ gitHubToken, harvestAccountId, harvestToken });
  };

  render() {
    const { gitHubToken, harvestAccountId, harvestToken } = this.state;

    return (
      <div>
        <h2>Credentials</h2>
        <label>
          GitHub Token
          <input
            name="gitHubToken"
            onChange={this.handleChange}
            type="password"
            value={gitHubToken}
          />
        </label>
        <label>
          Harvest Account ID
          <input
            name="harvestAccountId"
            onChange={this.handleChange}
            type="text"
            value={harvestAccountId}
          />
        </label>
        <label>
          Harvest Token
          <input
            name="harvestToken"
            onChange={this.handleChange}
            type="password"
            value={harvestToken}
          />
        </label>
        <button onClick={this.handleSave}>Save Credentials</button>
      </div>
    );
  }
}

export default CredentialsForm;
