import React from 'react';
import Select from './Select';

const stateFromProps = props => ({
  project: props.project,
  repo: props.repo,
});

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

  handleSelect = ({ name, value }) => {
    this.setState({ [name]: value });
  };

  handleSave = () => {
    const { project, repo } = this.state;

    this.props.onSave({ repo, project: parseInt(project, 10) });
  };

  render() {
    const { projects, repos } = this.props;
    const { project, repo } = this.state;

    return (
      <section>
        <h2>Configuration</h2>
        <label>
          GitHub Repository
          <Select
            name="repo"
            onSelect={this.handleSelect}
            options={repos}
            value={repo}
          />
        </label>
        <label>
          Harvest Project
          <Select
            name="project"
            onSelect={this.handleSelect}
            options={projects}
            value={project}
          />
        </label>
        <button onClick={this.handleSave}>Save Configuration</button>
      </section>
    );
  }
}

export default ConfigurationForm;
