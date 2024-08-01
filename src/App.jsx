import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { useRef, useState, useMemo, useEffect } from "react";
import { useChat } from "./hooks/useChat";
import { ChatHistory } from "./components/ChatHistory";
import { Link } from "react-router-dom";

let hello = true;

function App() {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();

  const [recording, setRecording] = useState(false);
  const [history2, setHistory2] = useState([
    // {
    //   html: "สวัสดีค่ะ! ดิฉันแคทลีน, จะมาเป็นผู้ช่วยที่ พร้อมจะช่วยเสนอแนะและตอบคำถามของคุณทุกคำถามที่เกี่ยวข้องกับความรู้ที่ดิฉันมีได้ค่ะ! หากคุณมีคำถามหรือต้องการความช่วยเหลือ สามารถเรียกใช้บริการดิฉันได้เลยค่ะ",
    //   text: "สวัสดีค่ะ! ดิฉันแคทลีน, จะมาเป็นผู้ช่วยที่ พร้อมจะช่วยเสนอแนะและตอบคำถามของคุณทุกคำถามที่เกี่ยวข้องกับความรู้ที่ดิฉันมีได้ค่ะ! หากคุณมีคำถามหรือต้องการความช่วยเหลือ สามารถเรียกใช้บริการดิฉันได้เลยค่ะ",
    //   time: "6/6/2024 4:06:06 PM",
    //   user: "bot",
    // },
  ]);
  const history = useMemo(() => {
    return [
      // {
      //   html: "สวัสดีค่ะ! ดิฉันแคทลีน, จะมาเป็นผู้ช่วยที่ พร้อมจะช่วยเสนอแนะและตอบคำถามของคุณทุกคำถามที่เกี่ยวข้องกับความรู้ที่ดิฉันมีได้ค่ะ! หากคุณมีคำถามหรือต้องการความช่วยเหลือ สามารถเรียกใช้บริการดิฉันได้เลยค่ะ",
      //   text: "สวัสดีค่ะ! ดิฉันแคทลีน, จะมาเป็นผู้ช่วยที่ พร้อมจะช่วยเสนอแนะและตอบคำถามของคุณทุกคำถามที่เกี่ยวข้องกับความรู้ที่ดิฉันมีได้ค่ะ! หากคุณมีคำถามหรือต้องการความช่วยเหลือ สามารถเรียกใช้บริการดิฉันได้เลยค่ะ",
      //   time: "6/6/2024 4:06:06 PM",
      //   user: "bot",
      // },
    ];
  }, []);

  useEffect(() => {
    // Code to run on start
    console.log('Component has mounted');
    console.log("hello", hello);
    if (hello == false) {
      console.log("hello", hello);
      sendMessage();
      hello = true;
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const sendMessage = async () => {
    const text = hello ? input.current.value : "avatar_start_hello";
    if (!loading && !message && !recording) {
      updateHistory(text, "user", text);
      if (hello) {
        input.current.value = "";
      }
      console.log("sending", history);
      const resp = await chat(text, history);

      resp.forEach((item) => {
        updateHistory(item.text, "bot", item.html);
      });
    }
  };

  const setHistory = (item) => {
    console.log("setHistory", item);
    history.push(item);
    setHistory2(history);
    console.log("setHistory history", history);
    console.log("setHistory history2", history2);
  };

  const updateHistory = (text, user, html) => {
    const timestamp = Date.now();
    const date = new Date(timestamp).toLocaleDateString();
    const time = new Date(timestamp).toLocaleTimeString();
    setHistory({ text: text, time: `${date} ${time}`, user: user, html: html });
    console.log("history", history);
  };

  const record = () => {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const recorder = useMemo(() => {
    return {
      stream: undefined,
      audioContext: undefined,
      recorder: undefined,
      STT_result: "",
      stopType: "",
      audio: {
        count: 0,
        sum: 0,
        time: 24,
        sec: 0,
        average: 0,
      },
    };
  }, []);

  async function startRecording() {
    setRecording(true);

    recorder.audio = {
      count: 0,
      sum: 0,
      time: 24,
      sec: recorder.audio.time,
      average: 0,
    };
    let constraints = { audio: true };
    recorder.stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (!recorder.audioContext) {
      // console.log("===============!recorder.audioContext=====================");
      recorder.audioContext = window.AudioContext || window.webkitAudioContext;
      recorder.audioContext = new AudioContext();
    }

    let analyser = recorder.audioContext.createAnalyser();
    let input = recorder.audioContext.createMediaStreamSource(recorder.stream);
    let scriptProcessor = recorder.audioContext.createScriptProcessor(
      2048,
      1,
      1
    );

    input.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(recorder.audioContext.destination);

    scriptProcessor.onaudioprocess = function () {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const arraySum = array.reduce((a, value) => a + value, 0);
      const average = arraySum / array.length;
      // webchat.webchat_element.icon_close.style.pointerEvents = "unset";
      console.log(average + "--------avg--- ");
      // cutAudio(average);
    };

    recorder.recorder = new WebAudioRecorder(input, {
      workerDir: "../js/",
      encoding: "wav",
      numChannels: 1,
      onEncoderLoading: function (recorder, encoding) {
        // console.log("Loading " + encoding + " encoder...");
      },
      onEncoderLoaded: function (recorder, encoding) {
        // console.log(encoding + " encoder loaded");
      },
    });
    recorder.recorder.onComplete = function (_recorder, blob) {
      // console.log("Encoding complete");
      // console.log(recorder);
      // console.log("recorder.audio.average : "+recorder.audio.average);
      recordComplete(blob, _recorder.encoding, recorder.audio.average);
    };
    recorder.recorder.setOptions({
      timeLimit: 120,
      encodeAfterRecord: true,
      ogg: { quality: 0.5 },
      mp3: { bitRate: 160 },
    });

    recorder.recorder.startRecording();
  }

  async function stopRecording() {
    setRecording(false);
    recorder.audio.average = recorder.audio.sum / recorder.audio.count;

    // recorder.stopType = stopType;
    console.log("recorder");
    console.log(recorder);
    if (recorder.stream) {
      recorder.stream.getTracks().forEach((track) => track.stop());
      recorder.stream = null;
    }
    // recorder.stream.getAudioTracks()[0].stop();
    recorder.audioContext.close();
    recorder.audioContext = undefined;
    recorder.recorder.finishRecording();
  }

  async function recordComplete(blob, encoding, average) {
    // console.log("recordComplete() call");
    // console.log("stopType : " + recorder.stopType);
    if (recorder.stopType != "icon_close") {
      let average_os = 3;
      // userAgent = navigator.userAgent
      if (navigator.userAgent.match(/android/i)) {
        average_os = 2;
      }
      // console.log(average + "avg in complece....");
      recorder.STT_result = await sttAPI(blob);
      input.current.value = recorder.STT_result;
      sendMessage();
    }
  }

  async function sttAPI(blob) {
    let formdata = new FormData();
    formdata.append("recording", blob);

    let requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    const backendUrl = `${window.location.protocol}//${
      window.location.hostname
    }${window.location.port ? ":3000" : ""}`;
    const response = await fetch(`${backendUrl}/record`, requestOptions);
    const returnObject = await response.text();
    return returnObject;
  }
  return (
    <>
      <div className="flex fixed top-0 left-0 right-0 bottom-0 flex-row">
        <div class="header w-full h-20 bg-black">
          <div class="logo p-3 pl-5">
            <Link to="/">
              <h1 class="text-purple-900 text-3xl font-bold">GenWiz</h1>
              <p class="text-white text-xs font-normal">Knowledge Intelligence</p>
            </Link>
          </div>
        </div>
        <div className="flex fixed top-20 left-0 right-0 bottom-0">
          <div className="chat-container w-full">
            <div className="chat flex justify-between h-[calc(100vh-5rem)] flex-col">
              <ChatHistory history={history2} />

              <div className="chat-form flex flex-row gap-2 p-4">
                <div class="flex items-center w-full bg-white rounded-full shadow-lg gap-2 px-4">
                  <input
                    className="w-full"
                    placeholder="Type a message..."
                    ref={input}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
                  />
                  <button
                    disabled={loading || message}
                    onClick={record}
                    className={`icon ${
                      loading || message || recording
                        ? "cursor-not-allowed opacity-30"
                        : ""
                    }`}
                  >
                    <div class="icon w-5 h-5">
                      <img
                        src="./mic.svg"
                        alt="mic"
                        class="w-5 h-5 cursor-pointer"
                      />
                    </div>
                  </button>
                </div>
                <div
                  className={`rounded-full bg-sky-500 w-fit h-11 p-3 cursor-pointer ${
                    loading || message || recording
                      ? "cursor-not-allowed opacity-30"
                      : ""
                  }`}
                >
                  <button
                    class="icon"
                    disabled={loading || message || recording}
                    onClick={sendMessage}
                  >
                    <div class="icon w-5 h-5">
                      <img src="./send.svg" alt="send" class="w-full h-full" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="avatar w-full">
            <Loader />
            <Leva hidden />
            <UI hidden />
            <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
              <Experience />
            </Canvas>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
