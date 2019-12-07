var express = require("express");
var multer = require("multer");
// var upload = multer({ dest: 'uploads/' })
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const linear16 = require("linear16");
const mime = require("mime");

var allowedOrigins = ["http://localhost:3000", "http://yourapp.com"];
const STATIC_FILES_DIR = "./uploads";
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, STATIC_FILES_DIR);
  },
  filename(req, file = {}, cb) {
    file.mimetype = "audio/webm";
    const { originalname } = file;
    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
    cb(null, `${file.fieldname}__${Date.now()}${fileExtension}`);
  }
});

const upload = multer({ storage });

app.use(
  cors({
    origin: function(origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  })
);
app.use(bodyParser.json());

app.listen(5001, function() {
  console.log("App listening on", 5001);
});

// ROUTES

// recieve the voice
app.post("/photo", upload.single("avatar"), function(req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  // console.log(req.file)
  // console.log(mime.getType(req.file))
  // console.log(req.file)

  if (req.file == undefined) {
    res.sendStatus(400);
  } else {
    res.send(googleVoiceTranscribe(req.file.path).catch(console.error));
  }
});

// send emails
app.post("/send", (req, res, next) => {
  console.log(req.body, "req");
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.messageHtml;

  console.log(name, "name");
  console.log(email, "email");
  console.log(message, "message");

  var mail = {
    from: name,
    to: email,
    subject: "Contact form request",

    html: message
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      console.log("fail", err);

      res.json({
        msg: "fail"
      });
    } else {
      console.log("poslato");
      res.json({
        msg: "success"
      });
    }
  });
});

var transport = {
  host: "smtp.gmail.com", // e.g. smtp.gmail.com
  auth: {
    user: "uros.randelovic@gmail.com",
    pass: "npgmoeenkuzfejww"
  }
};

var transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("All works fine, congratz!");
  }
});

// google returns the recognized text from the method
async function googleVoiceTranscribe(fileName) {
  // Imports the Google Cloud client library
  const speech = require("@google-cloud/speech");
  const fs = require("fs");

  // Creates a client
  const client = new speech.SpeechClient();

  // Reads a local audio file and converts it to base64
  console.log(mime.getType(fileName), "mime");
  const outPath = await linear16(fileName, "./output1.wav");
  console.log(outPath); // Returns the output path, ex: ./output.wav
  const file = fs.readFileSync(outPath);
  const audioBytes = file.toString("base64");

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes
  };
  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US"
  };
  const request = {
    audio: audio,
    config: config
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join("\n");
  
  console.log(`Transcription: ${transcription}`);
  return transcription;
}
