import React from 'react';

class Alert extends React.Component {
  render() {
    const { children } = this.props;

    return <div role="alert">{children}</div>;
  }
}

export default Alert;
