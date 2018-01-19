import React from 'react';
import { Form } from 'semantic-ui-react';

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
      <Form>
        <Form.Input
          autoComplete="off"
          label="GitHub Token"
          name="gitHubToken"
          onChange={this.handleChange}
          value={gitHubToken}
        />
        <Form.Group widths="equal">
          <Form.Input
            autoComplete="off"
            label="Harvest Account ID"
            name="harvestAccountId"
            onChange={this.handleChange}
            value={harvestAccountId}
          />
          <Form.Input
            autoComplete="off"
            label="Harvest Token"
            name="harvestToken"
            onChange={this.handleChange}
            value={harvestToken}
          />
        </Form.Group>
        <Form.Button onClick={this.handleSave}>Save Credentials</Form.Button>
      </Form>
    );
  }
}

export default CredentialsForm;
