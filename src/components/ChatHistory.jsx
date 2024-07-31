import { useState, useEffect, useRef } from "react";
export function ChatHistory({ history }) {
  const [alert, setAlert] = useState(false);
  console.log("history2", history);

  const messagesEndRef = useRef(null);
  if (messagesEndRef.current) {
    messagesEndRef.current.className = "h-20 m-4";
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    messagesEndRef.current.className = "";
  }

  function textToHtml(text) {
    let text_replace = text.replace(/(?:\r\n|\r|\n)/g, "<br />");
    return text_replace;
  }

  return (
    <>
      <div class="chat-history h-[calc(100vh-10rem)] overflow-y-auto">
        {/* <!-- alert --> */}
        {/* <div class="alert flex flex-col bg-white my-4 mx-4 relative p-4 rounded-lg shadow-lg">
          <div class="alert-header flex gap-4 items-center">
            <img src="./warning.svg" class="w-8 h-8" alt="warning" />
            <span>Service Required</span>
          </div>
          <div className={`alert-body mt-4 ${alert ? "block" : "hidden"}`}>
            <table class="mb-8">
              <tr class="align-top">
                <td class="min-w-[100px]">Part name:</td>
                <td>Turbine Housing B10</td>
              </tr>
              <tr class="align-top">
                <td>Line:</td>
                <td>M147</td>
              </tr>
              <tr class="align-top">
                <td>Problem:</td>
                <td>
                  เครื่อง CMM ตรวจพบ position ที่สูงเกินกว่าที่ drawing กำหนด
                  โดย drawing กำหนดระยะไว้ที่ 14±0.01 mm แต่วัดจริงได้ 14.017 mm
                  โปรดเร่งเข้าแก้ไข เพื่อไม่ให้กระทบต่อยอดการผลิตรายวันครับ
                </td>
              </tr>
              <tr class="align-top">
                <td>Date:</td>
                <td>09/05/2024</td>
              </tr>
              <tr class="align-top">
                <td>Time:</td>
                <td>10:33 AM</td>
              </tr>
            </table>
          </div>
          <div
            class="alert-btn absolute right-4 bottom-3 pt-1 pr-4 pb-2 pl-4 bg-violet-50 rounded-full cursor-pointer"
            onClick={() => setAlert(!alert)}
          >
            <span class="font-bold text-indigo-600">
              {alert ? "Less" : "more"}
            </span>
          </div>
        </div> */}
        {/* <!-- alert --> */}

        {/* <!-- date --> */}
        <div class="date my-3 pb-1 px-2 mx-auto w-fit bg-violet-100 rounded-2xl">
          <span class="text-zinc-400 text-xs font-light">Today</span>
        </div>
        {/* <!-- date --> */}

        {/* <!-- chat --> */}
        {history.map((item, index) => {
          return item.html == "avatar_start_hello" ? null : (
            <div
              key={index}
              className={`chat-message ${item.user} m-4 flex flex-col`}
            >
              <div class="chat-bubble">
                <p
                  dangerouslySetInnerHTML={{ __html: textToHtml(item.html) }}
                ></p>
              </div>
              <div class="chat-status text-zinc-400 text-xs">{item.time}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
