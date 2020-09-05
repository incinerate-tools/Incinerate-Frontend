import React from 'react';
import Dropzone from 'react-dropzone'
import PerfectScrollbar from 'react-perfect-scrollbar'
import axios from 'axios';

import File from './components/File';

import './stylesheets/app.css';
import 'react-perfect-scrollbar/dist/css/styles.css';

const toBase64 = (file, index) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve({result: reader.result, index: index});
  reader.onerror = error => reject(error);
});
/**
*/

class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      files: [],
      status: [],
      masterStatus: '',
      buttonClicked: ''
    }

    this.addFiles = this.addFiles.bind(this);
    this.onIncinerate = this.onIncinerate.bind(this);
  }

  addFiles(newFiles) {
    for(let i in newFiles){
      this.setState({ files: [...this.state.files, newFiles[i]] })
      this.setState({ status: [...this.state.status, {name: newFiles[i].name, convertStatus: 'Waiting', finishedFileName: ''}] })
    }
  }

  async onIncinerate() {
    this.setState({buttonClicked: true});

    if(this.state.files.length <= 10 && this.state.files.length > 0){
      for(let convertJob of this.state.files.map((x, index) => () => toBase64(x, index))){
        let resultObj = await convertJob();
        let fileBase64 = resultObj.result.split(',')[1];
        let index = resultObj.index;

        let tempState = this.state.status;
        tempState[index].convertStatus = 'Processing';
        this.setState({status: tempState});

        if((new TextEncoder().encode(fileBase64)).length < 14000000){
          try{
            let result = await axios.post(`${window.location.origin}/api/strip`, {
              file: fileBase64
            })

            let tempState = this.state.status;

            if(result.data.status == 'LIMIT_REACHED'){
              tempState[index].convertStatus = 'Daily limit reached';

            }else if(result.data.status == 'SERVER_ERR'){
              tempState[index].convertStatus = 'Server side error';

            }else if(result.data.status == 'BAD_FILE_TYPE'){
              tempState[index].convertStatus = 'Bad file type';

            }else if(result.data.status == 'BAD_REQUEST'){
              tempState[index].convertStatus = 'Bad request';

            }else if(result.data.status == 'OK'){
              tempState[index].convertStatus = 'OK';
              tempState[index].finishedFileName = result.data.file;

            }

            this.setState({status: tempState});
            if(index == this.state.files.length-1){
              this.setState({buttonClicked: false});
            }
          }catch(err){
            let tempState = this.state.status;
            tempState[index].convertStatus = 'Server side error';

            this.setState({status: tempState});
            if(index == this.state.files.length-1){
              this.setState({buttonClicked: false});
            }
          }
        }else{
            let tempState = this.state.status;
            tempState[index].convertStatus = 'File too big';

            this.setState({status: tempState});
            if(index == this.state.files.length-1){
              this.setState({buttonClicked: false});
            }
        }
      }
    }else if(this.state.files.length == 0){
      alert("No files chosen");
    }else if(this.state.files.length > 10){
      alert("Max file limit is 10 per 24 hours")
    }
  }

  removeFile(index){
    let tempFiles = this.state.files;
    tempFiles.splice(index, 1);

    let tempStatus = this.state.status;
    tempStatus.splice(index, 1);

    this.setState({ files: tempFiles });
  }

  render() {
    if(this.state.status.length > 0){
      var fileItems = this.state.status.map((file, index) =>
        <File name={file.name} status={file.convertStatus} finishedFileName={file.finishedFileName} index={index} key={index} removeFile={this.removeFile.bind(this)} buttonClicked={this.state.buttonClicked}/>
      );
    }else{
      var fileItems = (
        <div className="fileContainer">
            <div className="innerFileName">
                <p>No files chosen</p>
            </div>
        </div>
      )
    }

    return (
      <div className="appContainer">
        <div className="d-md-flex h-md-100 align-items-center">

          <div className="col-md-5 p-0 h-md-100 split-left">
              <div className="text-white d-md-flex align-items-center h-100 p-5 justify-content-center">
                  <div className="titleContainer">
                    <h1 className="title"><b>INCINERATE</b></h1>
                    <p className="subtitle">A free, fast, and private metadata remover for the privacy conscious</p>
                    <p className="subtitle">Hidden Service mirror: <b>3mghupyalwu7gub3ncpe3tcynf54y2bliylnh6gbslrlib4liwsqlgyd.onion</b></p>
                    <p className="subtitle">Backend code is open source on
                      <a href="https://github.com/incinerate-tools/Incinerate-Backend" target="_blank">
                        <b> Github</b>
                      </a>
                    </p>
                  </div>
              </div>
          </div>

          <div className="col-md-7 p-0 h-md-100 split-right">
            <PerfectScrollbar>
              <div className="align-items-center h-100 p-5 controlContainer">
                  <Dropzone onDrop={this.addFiles}>
                    {({getRootProps, getInputProps}) => (
                      <section className="dropZone">
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p><b>Drag and drop multiple files, or click to select files</b></p>
                        </div>
                      </section>
                    )}
                  </Dropzone>

                {fileItems}

                <br/>

                <button className="submit" onClick={this.onIncinerate} disabled={this.state.buttonClicked}>{this.state.buttonClicked ? "PROCESSING" : "INCINERATE"}</button>

                <p className="status">{this.state.masterStatus}</p>
              </div>
            </PerfectScrollbar>
          </div>

        </div>
      </div>
    );
  }
}

export default App;
