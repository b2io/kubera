import React from 'react';

const stateFromProps = props => ({
  value: props.value,
});

class Select extends React.Component {
  static defaultProps = {
    onSelect: () => {},
    options: [],
    value: '',
  };

  state = stateFromProps(this.props);

  componentWillReceiveProps(nextProps) {
    const { value } = this.props;

    if (value !== nextProps.value) {
      this.setState(stateFromProps(nextProps));
    }
  }

  handleChange = event => {
    const { name, value } = event.target;

    this.setState({ value }, () => {
      this.props.onSelect({ name, value });
    });
  };

  render() {
    const { options, ...rest } = this.props;
    const { value } = this.state;

    return (
      <select {...rest} onChange={this.handleChange} value={value}>
        <option>---</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    );
  }
}

export default Select;
