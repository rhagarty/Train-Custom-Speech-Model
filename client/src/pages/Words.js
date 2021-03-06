import React, { Component } from 'react';
import { FormGroup, FormControl, Glyphicon, HelpBlock, Panel } from 'react-bootstrap';
import LoadButton from '../components/LoadButton';
import './Words.css';

/**
 * Class to handle the rendering of the Words page where users can view and manage custom words.
 * @extends React.Component
 */
export default class Words extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      words: [],
      error: '',
    };
  }

  async componentDidMount() {
    this.handleGetList();
  }

  handleGetList = async () => {
    this.setState({ isLoading: true });
    fetch('/api/words', {
      method: 'GET',
      credentials: 'include'
    })
    .then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          let sortedWords = data.words.sort(
            (a, b) => (a.word < b.word) ? -1 : ((a.word > b.word) ? 1 : 0)
          );
          this.setState({ words: sortedWords });
        });
      }
      this.setState({ isLoading: false });
    })
    .catch((err) => {
      this.setState({ error: err });
      console.log('Error getting custom word list.', err);
      this.setState({ isLoading: false });
    });
  }

  handleDelete = async wordIndex => {
    let word = this.state.words[wordIndex].word;
    this.setState({ isLoading: true });
    fetch('/api/words/' + word.replace(' ', '-'), {
      method: 'DELETE',
      credentials: 'include'
    })
    .then((response) => {
      if (response.status === 200) {
        this.handleGetList();
      }
      else {
        this.setState({ error: 'There was a problem deleting the word.' });
        this.setState({ isLoading: false });
      }
    })
    .catch((err) => {
      this.setState({ error: err });
      this.setState({ isLoading: false });
    });
  }

  handleAdd = async wordIndex => {
    let loadingKey = 'isLoading' + wordIndex;
    this.setState({ [loadingKey]: true });
    fetch('/api/words', {
      method: 'POST',
      body: JSON.stringify(this.state.words[wordIndex]),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          console.log(data);
        });
      }
      this.setState({ [loadingKey]: false });
    })
    .catch((err) => {
      this.setState({ [loadingKey]: false });
    });
  }

  handleSoundsLike = wordIndex => event => {
    event.preventDefault();
    let words = [...this.state.words];
    words[wordIndex].sounds_like = event.target.value.split(',').slice(0, 5);
    this.setState({ words: words });
  }

  submitWord = wordIndex => event => {
    event.preventDefault();
    this.handleAdd(wordIndex);
  }

  render() {
    return (
      <div className="Words">
        <h2>Custom Word List</h2>
        <p>These are the out-of-vocabulary words extracted from all the submitted corpora.</p>
        { this.state.isLoading && <Glyphicon glyph="refresh" className="tableload" /> }
        { !this.state.isLoading && this.state.words.length > 0 &&
          this.state.words.map((word, index) => {
              return (
                <Panel key={index} defaultExpanded={false}>
                  <Panel.Heading>
                    <Panel.Title>
                      <Panel.Toggle>{word.word}</Panel.Toggle>
                      <span className='panel-trash'>
                        <Glyphicon glyph="trash" onClick={() => {
                          if (window.confirm('Delete this word?')) {
                            this.handleDelete(index);
                          }}} />
                      </span>
                      <Panel.Toggle>
                        <span className='panel-option'>
                          <Glyphicon glyph="option-horizontal" />
                        </span>
                      </Panel.Toggle>
                    </Panel.Title>
                  </Panel.Heading>
                  <Panel.Collapse>
                    <Panel.Body>
                      <div className="soundslike">
                        <strong>Sounds Like:</strong><br />
                        <form>
                          <FormGroup>
                            <FormControl
                              onChange={this.handleSoundsLike(index)}
                              value={this.state.words[index].sounds_like.join(',')}
                              componentClass="textarea"
                            />
                            <HelpBlock>
                              Add up to five comma-separated 'sounds-like' strings. For example,
                              you might specify that the word 'IEEE' can sound like 'i triple e'.
                            </HelpBlock>
                          </FormGroup>
                          <LoadButton
                           block
                           bsStyle="primary"
                           bsSize="xsmall"
                           type="button"
                           isLoading={this.state['isLoading' + index]}
                           onClick={this.submitWord(index)}
                           text="Submit"
                           loadingText="Submitting…"
                          />
                        </form>
                      </div>
                    </Panel.Body>
                  </Panel.Collapse>
              </Panel>
              );
          })
        }
      </div>
    );
  }
}
