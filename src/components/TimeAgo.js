import { distanceInWords, format } from 'date-fns';
import React from 'react';

class TimeAgo extends React.Component {
  static defaultProps = {
    render: relativeTime => `Last updated ${relativeTime} ago.`,
    intervalTimeout: 60000,
  };

  state = { dateToCompare: Date.now() };

  componentDidMount() {
    this.interval = setInterval(this.handleTick, this.props.intervalTimeout);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleTick = () => {
    this.setState({ dateToCompare: Date.now() });
  };

  render() {
    const { date, render } = this.props;
    const { dateToCompare } = this.state;
    
    return (
      <time dateTime={format(date)}>
        {render(distanceInWords(dateToCompare, date))}
      </time>
    );
  }
}

export default TimeAgo;
