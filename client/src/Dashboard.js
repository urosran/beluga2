import React, { Component } from "react";
// import {Grid, Typography, Button} from "@material-ui/core"
import MyEmail from "./Email";
import { renderEmail } from "react-html-email";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Grow } from "@material-ui/core";

let audioUrl = undefined;
let mediaRecorder;
let audioChunks = [];
let audioBlob = undefined;
let url = undefined;

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: 200
    }
  }
}));

export default class CustomCard extends Component {
  constructor(props) {
    super(props);
    this.record = this.record.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.state = { download_url: undefined, transcripton: "" };
    this.speech_to_text = this.speech_to_text.bind(this);
    this.submit = this.submit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.name = "";
    this.email = "";
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
  }
  // classes = useStyles();

  speech_to_text = async file => {
    console.log(audioUrl, "file");

    let blob = await fetch(audioUrl).then(r => r.blob());
    console.log(blob, "blob");
    var file = new File(
      [audioBlob],
      "audio.weba",
      { type: "audio/weba" },
      { contentType: "audio/weba" },
      { mimetype: "audio/weba" }
    );
    console.log(file, "file text");
    console.log(file.mimetype, "file mime");

    const photoFormData = new FormData();

    photoFormData.append("avatar", file);
    const response = await fetch(`http://localhost:5001/photo`, {
      method: "POST",
      body: photoFormData
    });
    audioChunks = [];
    console.log(response.text());
    console.log(response);
    return response.text();
  };

  record = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      let options = {
        mimeType: "audio/webm"
      };
      mediaRecorder = new MediaRecorder(stream, options);
      audioChunks = [];
      console.log("im inside");

      mediaRecorder.addEventListener("dataavailable", event => {
        console.log("inside data available");
        audioChunks.push(event.data);
      });
      mediaRecorder.ondataavailable = function(e) {
        console.log("pushing audio");
        audioChunks.push(e.data);
      };

      mediaRecorder.addEventListener("stop", () => {
        console.log("inside stop");
        audioBlob = new Blob(
          audioChunks,
          { type: "audio/webm" },
          { mimetype: "audio/webm" }
        );
        // audioBlob.type = 'audio/webm'
        console.log(audioBlob);
        console.log(audioBlob.type, "blob");
        // console.log(audioBlob.mimetype, 'blob')
        audioUrl = URL.createObjectURL(audioBlob);
        // Play the audio
        // const audio = new Audio(audioUrl);
        // audio.play();
        console.log(audioUrl, "audio");
        this.setState(() => (url = audioUrl));

        console.log(mediaRecorder.state, "stop state");
        console.log(MediaRecorder.mimeType, "mime");
      });
    });
  };

  startRecording = () => {
    console.log("pressed");

    if (mediaRecorder.state != "recording") {
      mediaRecorder.start();
    } else {
      alert("already recording");
    }

    console.log(mediaRecorder.state, "inisde startRec");
  };

  stopRecording = () => {
    if (mediaRecorder.state != "inactive") {
      mediaRecorder.stop();
    } else {
      alert("Please start the recording");
    }
    console.log("passing in audio", audioUrl);
  };
  submit = () => {
    this.setState({
      transcription: this.speech_to_text(audioUrl).catch(console.error)
    });
  };
  componentDidMount() {
    this.record();
  }

  handleSubmit(event) {
    const messageHtml = renderEmail(<MyEmail name={this.state.name}></MyEmail>);
    axios({
      method: "POST",
      url: "http://localhost:5001/send",
      data: {
        name: this.state.name,
        email: this.state.email,
        messageHtml: messageHtml
      }
    }).then(response => {
      console.log(response.data.msg, "data");
      if (response.data.msg === "success") {
        alert("Email sent, awesome!");
        this.resetForm();
      } else if (response.data.msg === "fail") {
        alert("Oops, something went wrong. Try again");
      }
    });
  }
  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }
  handleNameChange(event) {
    this.setState({ name: event.target.value });
  }
  render() {
    return (
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item style={{ paddingTop: 50, marginBottom: 100 }}>
          <Typography variant="h4">Please provide your feedback</Typography>
        </Grid>

        <form noValidate autoComplete="off">
          <TextField
            id="standard-basic"
            label="Name"
            type="text"
            onChange={this.handleNameChange}
            style={{ margin: 10 }}
          />
          <TextField
            id="filled-basic"
            label="Email"
            type="text"
            onChange={this.handleEmailChange}
            style={{ margin: 10 }}
          />
        </form>
        {/* <Button onClick={this.handleSubmit}>send test email</Button> */}
        <Grid item>
          <Typography>Transcription:</Typography>
          {console.log(this.state.transcripton)}
          <Typography
            style={{
              margin: 20,
              paddingTop: 50,
              border: 1,
              borderColor: "black"
            }}
          >
            {this.state.transcripton}
          </Typography>
        </Grid>
        <Grid item>
          <Button color="primary" onClick={this.startRecording}>
            start
          </Button>
          <Button color="secondary" onClick={this.stopRecording}>
            stop
          </Button>
          <Button onClick={this.submit}>submit</Button>
          <Button href={audioUrl} download="test.weba">
            Download
          </Button>
        </Grid>
      </Grid>
    );
  }
}
