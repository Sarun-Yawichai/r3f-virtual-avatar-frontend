import { useRef, useState, useMemo } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message && !recording) {
      chat(text);
      input.current.value = "";
    }
  };

  const [recording, setRecording] = useState(false);

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
    var constraints = { audio: true };
    recorder.stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (!recorder.audioContext) {
      // console.log("===============!recorder.audioContext=====================");
      recorder.audioContext = window.AudioContext || window.webkitAudioContext;
      recorder.audioContext = new AudioContext();
    }

    var analyser = recorder.audioContext.createAnalyser();
    var input = recorder.audioContext.createMediaStreamSource(recorder.stream);
    var scriptProcessor = recorder.audioContext.createScriptProcessor(
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
    // recorder.stream.getAudioTracks()[0].stop();
    recorder.audioContext.close();
    recorder.audioContext = undefined;
    recorder.recorder.finishRecording();
  }

  async function recordComplete(blob, encoding, average) {
    // console.log("recordComplete() call");
    // console.log("stopType : " + recorder.stopType);
    if (recorder.stopType != "icon_close") {
      var average_os = 3;
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
    var formdata = new FormData();
    formdata.append("recording", blob);

    var requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    const backendUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':3000' : ''}`;
    const response = await fetch(
      `${backendUrl}/record`,
      requestOptions
    );
    const returnObject = await response.text();
    return returnObject;
  }

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">My Virtual GF</h1>
          <p>I will always love you ❤️</p>
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            disabled={loading || message || recording}
            onClick={sendMessage}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              loading || message || recording
                ? "cursor-not-allowed opacity-30"
                : ""
            }`}
          >
            Send
          </button>
          <button
            disabled={loading || message}
            onClick={record}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            {recording ? "Recording..." : "Record"}
          </button>
        </div>
      </div>
    </>
  );
};
