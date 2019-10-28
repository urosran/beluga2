import React, { Component} from 'react'
// import {Grid, Typography, Button} from "@material-ui/core"
import MyEmail from './Email'
import { renderEmail } from 'react-html-email'
import axios from 'axios';
let audioUrl = undefined
let mediaRecorder;
let audioChunks = []
let audioBlob = undefined


export default class CustomCard extends Component {
    constructor(props) {
        super(props);
        this.record = this.record.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.state={}
        this.speech_to_text=this.speech_to_text.bind(this)
        this.submit=this.submit.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.name = ''
        this.email = ''
        this.handleEmailChange=this.handleEmailChange.bind(this)
        this.handleNameChange=this.handleNameChange.bind(this)
    }

    speech_to_text = async (file) => {
        console.log(audioUrl, "file")
        
        let blob = await fetch(audioUrl).then(r => r.blob());
        console.log(blob, "blob")
        var file = new File([audioBlob], "audio");
        console.log(file, "file text")

        const photoFormData = new FormData();

        photoFormData.append("avatar", file);
        const response = await fetch(`http://localhost:5000/photo`, {
            method: 'POST',
            body: photoFormData,
        });

        return response.text();
    }
    
    record = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {

            mediaRecorder = new MediaRecorder(stream);
            console.log(mediaRecorder.state, "top state")
            
            audioChunks = [];
            console.log("im inside")

            // mediaRecorder.addEventListener("dataavailable", event => {
            //     console.log("inside data available")
            //     audioChunks.push(event.data);
            // });
            mediaRecorder.ondataavailable = function(e) {
                console.log("pushing audio")
                audioChunks.push(e.data);
              }
            
            mediaRecorder.addEventListener("stop", () => {
                console.log('inside stop')
                audioBlob = new Blob(audioChunks);
                console.log(audioBlob)
                audioUrl = URL.createObjectURL(audioBlob);
                console.log(audioUrl, "audio")
            console.log(mediaRecorder.state, "stop state")

            });
    })}

    startRecording=()=>{
        console.log("pressed")
        mediaRecorder.start()
        console.log(mediaRecorder.state, "inisde startRec")

    }

    stopRecording = () => {
         mediaRecorder.stop()
        console.log("passing in audio", audioUrl)
    }        
    submit= () => {
        this.speech_to_text(audioUrl).catch(console.error)
    }
    componentDidMount(){
        this.record()
    }

    // async speech_to_text(){
    //     // Imports the Google Cloud client library
    //     const speech = require('@google-cloud/speech');

    //     // Creates a client
    //     const client = new speech.SpeechClient(
    //         {
    //             type: "service_account",
    //             project_id: "survey-1571413046810",
    //             private_key_id: "7acd6866ada1555de93f16adc33eadc291426cf3",
    //             private_key: "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCx+zqmazA7m40F\ndbMH7Jchnoor9rWVY3KUpulUbnAfwZH5eUup8FeOF1kP/nSX4yN+QOpJDnwrnKeV\n1yPJVMo1z0eZs0LT3uL7L4RXjIYRuSfVEWWBPXjteC5h4jO3THlFaNRoQkck157j\nCBrdKVbTrBHs5dai1XTVyskkowrP/y6Bls/hH8No1Ev/wc5KsZ1v4F4lTAK9NmVV\nC9ewZu8oEvPVPtwzgOvWMauMnRX4w343SA7oLrTxGV5K0uGcT9xvSIPYzq8FSkMJ\nBHkj2hpIrbA9X3xIjbv3wFBcv7Xk5PWWyOk1XcMjOHcN3BMbfRkCNPaAxQA/V+yr\nrQ2o5zGZAgMBAAECgf908V7DYw3Ykh65BPDYMHqLeud1zs6Nhn7HDA1NmXgSp0zm\nZowXVOCfql4ZkrinPenAYGYnRpaS9rUS1wH5fKI9sfchz93TGuNICUjPrBnGTHaS\nsafFe1zkmn/nwuBRVS0VAmjUD+wl73keYM7QZkLIQJstDNjt/ctP3FL4JydmS5ja\nE4YHdwOBdhjlnlNJ8/IEMrNWvSwn18c4r8AXLpJUfyL34EcQPJxJnflmSQ6uCojY\nI6exnQVBCXS503SAxzF+NocPoioc1lSuXbJbPjF7IXh0+hLLpn07VggTgaxDfAL1\nHGO5YxiJe3sVDGk3VM4Dkp0ynXlA5aBGR3aSyQkCgYEA5/QJnbPJrZCGNZoRMBQa\nuSr9XS6sc1nJoUKz+EJDMVQRhvz5iG4N+rkuCibdJHqL9xwlczlWUon1Kr8LGkCe\nvrQ+zOVUOslcZNvYqN6bN6+BAUx3Xc9RLY4RcYlyO49XnmrdbS13kL+tLBfwQ5Ii\nWdy4dXe1IZsQ0Qzd5I+fFIsCgYEAxG7LjDOIdcEpIlwtDYnHz4qCxXTXCPqOBC+T\nVmNwgpeIKqT64Kd5oCkTe4pHuPft7KJVsYsdyc4DSPbowLyGLrdZyc2s+6olUCXK\nRIA6G0NpbScQrapCRNlw0a57PBw8d6paW0YDtBN9l+C08bsMFxnNDOlZ+skFkMOY\nnuCqwusCgYEAtpZmv2pYVrVOwIEQCJ26z4okuaZU/9RtIPEGBGX8yKbZyT34G8ou\nXPBKaplfOSjyZsoUPNikuAJ7KHQMhFTb4Vi3msjnfgMmJQreSUg6PSJ9VY1g5Uqe\nJ1MPLiW482OJ4F1VAm1pElugMPaDHl25hq110poxzktneHg9b38TBbMCgYBfGEAk\nJIKIdzWhs7v/1NbNa4G5c8HyT9HWxu1uIf/CyPcbpfjqL0mbNqd+5EeqjSQ6rbAM\nnouSOdCvTxEI1XukPBEUuCRpRUqBDXppRSZcMntkY0gYutcQG7AZYn24cPb4+5h4\nnWGHmPPxRdBzQhktSclR2do8pXqzRW2qZJtmdwKBgACAJa2ei9We9Iw6F0I5I2Tm\nQalfrKB7+zQmU2XVsYNdlEKk/M99WD9SNFCpI06bJavtCjMfXIAVi+okC6tTh+km\nsj2yYzlK19tRWr/fEEsoZS8NsFLE8WcMw9TsBUTT0qYLxBh7tel7bEiR8yqq527W\nalQ1igCrDja7Xb84abx+\n-----END PRIVATE KEY-----\n",
    //             client_email: "testacct@survey-1571413046810.iam.gserviceaccount.com",
    //             client_id: "100986276234088870248",
    //             auth_uri: "https://accounts.google.com/o/oauth2/auth",
    //             token_uri: "https://oauth2.googleapis.com/token",
    //             auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    //             client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/testacct%40survey-1571413046810.iam.gserviceaccount.com"
    //           }
              
    //     );

    //     /**
    //      * TODO(developer): Uncomment the following lines before running the sample.
    //      */
    //     const gcsUri = audioUrl;
    //     const encoding = 'LINEAR16';
    //     const sampleRateHertz = 16000;
    //     const languageCode = 'en-US';

    //     const config = {
    //     encoding: encoding,
    //     sampleRateHertz: sampleRateHertz,
    //     languageCode: languageCode,
    //     };

    //     const audio = {
    //     uri: gcsUri,
    //     };

    //     const request = {
    //     config: config,
    //     audio: audio,
    //     };

    //     // Detects speech in the audio file. This creates a recognition job that you
    //     // can wait for now, or get its result later.
    //     const [operation] = await client.longRunningRecognize(request);
    //     // Get a Promise representation of the final result of the job
    //     const [response] = await operation.promise();
    //     const transcription = response.results
    //     .map(result => result.alternatives[0].transcript)
    //     .join('\n');
    //     console.log(`Transcription: ${transcription}`);
    // }
    // main().catch(console.error);

    handleSubmit(event){

        const messageHtml =  renderEmail(
            <MyEmail name={this.state.name}></MyEmail>
        );
            axios({
                method: "POST", 
                url:"http://localhost:5000/send", 
                data: {
                name: this.state.name,
                email: this.state.email,
                messageHtml: messageHtml
                }
            }).then((response)=>{
                if (response.data.msg === 'success'){
                    alert("Email sent, awesome!"); 
                    this.resetForm()
                }else if(response.data.msg === 'fail'){
                    alert("Oops, something went wrong. Try again")
            }
        })
    }
    handleEmailChange(event) {
        this.setState({name: event.target.value});
    }
    handleNameChange(event) {
        this.setState({email: event.target.value});
    }
    render(){
        return(        
            <div>
                <button onClick={this.startRecording}>start</button>
                <button onClick={this.stopRecording}>stop</button>
                <button onClick={this.submit}>submit</button>
                <form>
                    <label>
                        Name:
                        <input type="text" name="name" onChange={this.handleNameChange}/>
                    </label>
                    <label>
                        Email:
                        <input type="text" name="email" onChange={this.handleEmailChange}/>
                    </label>
                    <input type="submit" value="Submit" onClick={this.handleSubmit} />
                </form>
            </div>
    )}
}