import React, { Component } from 'react';

class LoadingComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      placeholder: this.props.loadingWord + "...",
      counter: 0
    };
  }

  loading() {
    if (this.state.counter % 4 === 0) {
      this.setState({ placeholder: this.props.loadingWord + "..." });
    } else if (this.state.counter % 4 === 1) {
      this.setState({ placeholder: this.props.loadingWord + "   " });
    } else if (this.state.counter % 4 === 2) {
      this.setState({ placeholder: this.props.loadingWord + ".  " });
    } else {
      this.setState({ placeholder: this.props.loadingWord + ".. " });
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ counter: this.state.counter + 1 });
      this.loading();
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <span style={{ whiteSpace: "pre-wrap" }}>{this.state.placeholder}</span>
      </div>
    );
  }
}

export default LoadingComponent;
