import React, { Component } from 'react';
import './App.css';

function Token(props) {
  return (
      <button className="token" onClick={props.click}>
        {props.text}
      </button>
  );
}

class Paragraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokens: props.tokens,
      click: props.click
    };
  }

  renderToken(val, ind) {
    return (
      <Token text={val} click={(event) => this.state.click(event, ind)} />
    )
  }

  render() {
    return (
      <ul>{this.state.tokens.map((val, ind) => {
        return <li key={ind}>{this.renderToken(val, ind)}</li>
      })}</ul>
    );
  }

}


class App extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      isLoaded: false,
      group: null,
      sentence: null,
      annotations: null,
    };
  }


  componentDidMount() {
    this.callBackendAPI()
      .then(res => {
        this.setState({group: res.group,
                       sentence: res.sentence,
                       annotations: Array(res.sentence.length).fill(0),
                       isLoaded: true,
                     });
      })
      .catch(err => console.log(err));

  }


  callBackendAPI = async () => {
    const response = await fetch('/next');
    const body = await response.json();

    if (response.status !== 200) {
        throw Error(body.message)
    }

    return body;
  }


  handleClick(event, i) {
    const annotations = this.state.annotations.slice();
    annotations[i] = 1-annotations[i];
    this.setState({annotations: annotations});
    if (annotations[i] === 1) {
      event.currentTarget.style.backgroundColor = '#000000';
    } else {
      event.currentTarget.style.backgroundColor = '#4CAF50';
    }
    console.log(annotations.slice(0,20));
  }


  sendResponseAndUpdate() {
    // send back the current sample
    fetch('/receive', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        annotations: this.state.annotations,
      })
    });
    this.setState({isLoaded: false})
    // and then print new stuff after short delay
    setTimeout(() => {
    this.callBackendAPI()
      .then(res => {
        this.setState({group: res.group,
                       sentence: res.sentence,
                       annotations: Array(res.sentence.length).fill(0),
                       isLoaded: true,
                     });
      })
      .catch(err => console.log(err));
    }, 500)
  }


  render() {
    return (
      <div className="App">
        <div className="logo">Annotation Wizard</div>
        <div className="wrapper">
          <p className="group">Current group phrase: "{this.state.group}"</p>
          <div className="sentence">
            {this.state.isLoaded &&
            <Paragraph tokens={this.state.sentence} click={this.handleClick} />
            }
          </div>
          <button className="next" onClick={() => this.sendResponseAndUpdate()}>Next sentence</button>
        </div>
      </div>
    );
  }
}

export default App;
