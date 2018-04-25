import React from 'react';
import { Form } from 'semantic-ui-react';

const toOption = (text, value, key = value) => v => ({
  key: v[key],
  text: v[text],
  value: v[value],
});

const stateFromProps = props => ({
  project: props.project,
  repo: props.repo,
});

const validate = state => state.project && state.repo;

class ConfigurationForm extends React.Component {
  static defaultProps = {
    onSave: () => {},
    project: '',
    projects: [],
    repo: '',
    repos: [],
  };

  state = stateFromProps(this.props);

  componentWillReceiveProps(nextProps) {
    const { project, repo } = this.props;

    if (project !== nextProps.project || repo !== nextProps.reop) {
      this.setState(stateFromProps(nextProps));
    }
  }

  handleProjectChange = (event, { value }) => {
    this.setState({ project: value });
  };

  handleRepoChange = (event, { value }) => {
    this.setState({ repo: value });
  };

  handleSave = () => {
    const { project, repo } = this.state;

    this.props.onSave({ repo, project: parseInt(project, 10) });
  };

  render() {
    const { projects, repos } = this.props;
    const { project, repo } = this.state;
    const isValid = validate(this.state);

    return (
      <Form>
        <Form.Dropdown
          label="GitHub Repository"
          onChange={this.handleRepoChange}
          options={repos.map(toOption('name', 'id'))}
          placeholder="Select Repo"
          search
          selection
          value={repo}
        />
        <Form.Dropdown
          label="Harvest Project"
          onChange={this.handleProjectChange}
          options={projects.map(toOption('name', 'id'))}
          placeholder="Select Project"
          search
          selection
          value={project}
        />
        <Form.Button disabled={!isValid} onClick={this.handleSave} positive>
          Save Configuration
        </Form.Button>
      </Form>
    );
  }
}

export default ConfigurationForm;
