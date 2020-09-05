import React, { Component } from 'react'

import '../stylesheets/file.css';

export default class File extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className="fileContainer">
                <div className="innerFileName">
                    <p>{this.props.name}</p>
                </div>

                <div className="innerStatus">
                    <p>{this.props.status == 'OK' ? <button className="downloadBtn" onClick={() => window.open(`${window.location.origin}/download/${this.props.finishedFileName}`)}>Download</button> : this.props.status}</p>
                </div>

                <div className="innerClose" onClick={() => {if(this.props.buttonClicked){alert("Removal process ongoing")}else{this.props.removeFile(this.props.index)}}}>
                    <svg
                        id="close"
                        height={21}
                        viewBox="0 0 21 21"
                        width={21}
                        stroke="#F1D3BC"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g
                        fillRule="evenodd"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        transform="translate(5 5)"
                        >
                        <path d="m.5 10.5 10-10" strokeWidth="1.3" />
                        <path d="m10.5 10.5-10-10z" strokeWidth="1.3" />
                        </g>
                    </svg>
                </div>
            </div>
        )
    }
}
