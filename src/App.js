import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import {MailParser} from 'mailparser'
import FileReaderStream from 'filereader-stream'

function App() {
  const parser = new MailParser();
  let attachments = [];

  useEffect(() => {
    axios
    .get('mail.eml')
    .then(({headers, data: emlData}) => {
      console.log(emlData)
      const type = headers['content-type']
      const blob = new Blob([emlData], {type})
      FileReaderStream(blob).pipe(parser)
      parser.on('headers', headers => {
          console.log(headers);
      });
    
      parser.on('data', data => {
          if (data.type === 'text') {
              Object.keys(data).forEach(key => {
                  console.log(key);
                  console.log('----');
                  console.log(data[key]);
              });
          }
      
          if (data.type === 'attachment') {
              attachments.push(data);
              data.chunks = [];
              data.chunklen = 0;
              let size = 0;
              Object.keys(data).forEach(key => {
                  if (typeof data[key] !== 'object' && typeof data[key] !== 'function') {
                      console.log('%s: %s', key, JSON.stringify(data[key]));
                  }
              });
              data.content.on('readable', () => {
                  let chunk;
                  while ((chunk = data.content.read()) !== null) {
                      size += chunk.length;
                      data.chunks.push(chunk);
                      data.chunklen += chunk.length;
                  }
              });
      
              data.content.on('end', () => {
                  data.buf = Buffer.concat(data.chunks, data.chunklen);
                  console.log('%s: %s B', 'size', size);
                  // attachment needs to be released before next chunk of
                  // message data can be processed
                  data.release();
              });
          }
      });
      
      parser.on('end', () => {
          console.log('READY');
      
          console.log(attachments);

      });
    })
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
