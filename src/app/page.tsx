"use client";
import React from "react";
import * as dateFns from "date-fns";
import { v4 as uuid } from "uuid";

const DEFAULT_USER_ID = "123";

const SYSTEM_USER_ID = "456";

const USERS: Record<string, { name: string }> = {
  [DEFAULT_USER_ID]: {
    name: "Justin",
  },
  [SYSTEM_USER_ID]: {
    name: "System",
  },
};

type Message = {
  id: string;
  text: string;
  userId: string;
  timestamp: number;
};

type State = {
  draft: string;
  messages: Message[];
};

const initialState = {
  draft: "",
  messages: [
    {
      id: uuid(),
      userId: SYSTEM_USER_ID,
      text: "Hello, how are you?",
      timestamp: Date.now(),
    },
  ],
};

type ActionType<T extends string, P = any> = P extends undefined
  ? {
      type: T;
    }
  : {
      type: T;
      payload: P;
    };

type Action =
  | ActionType<"setDraft", string>
  | ActionType<"send">
  | ActionType<"delete", { messageId: string }>;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setDraft": {
      return {
        ...state,
        draft: action.payload,
      };
    }
    case "send": {
      const nextMessages = [
        ...state.messages,
        {
          id: uuid(),
          text: state.draft,
          userId: DEFAULT_USER_ID,
          timestamp: Date.now(),
        },
      ];
      return {
        ...state,
        draft: "",
        messages: nextMessages,
      };
    }
    case "delete": {
      const nextMessages = [...state.messages];
      const messageIdx = nextMessages.findIndex(
        (m) => m.id === action.payload.messageId
      );
      if (messageIdx === -1) {
        return {
          ...state,
        };
      }
      const message = nextMessages[messageIdx];
      if (message?.userId !== DEFAULT_USER_ID) return { ...state };
      nextMessages.splice(messageIdx, 1);
      return {
        ...state,
        messages: nextMessages,
      };
    }
    default: {
      return state;
    }
  }
};

export default function Home() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <main className="flex h-screen flex-col items-center justify-start p-10 font-sans">
      <div className="flex flex-col items-start justify-center w-full max-w-[700px] h-full">
        <div className="flex flex-col gap-4 w-full h-full overflow-auto items-start align-top px-8">
          {state.messages.map((message) => {
            const isUser = message.userId === DEFAULT_USER_ID;
            return (
              <div
                key={message.id}
                className={`flex flex-col max-w-3/4 relative  ${
                  isUser ? `self-end` : `self-start`
                }`}
              >
                {USERS[message.userId] && (
                  <span
                    className={`text-slate-500 text-xs ${
                      isUser ? `self-end` : `self-start`
                    }`}
                  >
                    {USERS[message.userId].name}
                  </span>
                )}
                <div
                  className={`${
                    isUser ? "w-full bg-slate-800" : "bg-slate-500"
                  } p-4 rounded-lg w-full`}
                >
                  <p className="text-slate-200">{message.text}</p>
                </div>
                {isUser && (
                  <button
                    className="absolute -right-[20px] top-1/2 translate-y-[-50%]"
                    onClick={() =>
                      dispatch({
                        type: "delete",
                        payload: {
                          messageId: message.id,
                        },
                      })
                    }
                  >
                    ❌
                  </button>
                )}
                <span
                  className={`text-slate-500 text-xs ${
                    isUser ? `self-end` : `self-start`
                  }`}
                >
                  {dateFns.isToday(new Date(message.timestamp))
                    ? `Today at ${dateFns.format(
                        new Date(message.timestamp),
                        "HH:mm"
                      )}`
                    : dateFns.format(
                        new Date(message.timestamp),
                        "MM/dd/yyyy HH:mm"
                      )}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-row border-2 border-slate-800 p-4 rounded-lg w-full self-end">
          <input
            className="bg-transparent w-full outline-none"
            type="text"
            placeholder="Input message"
            value={state.draft}
            onChange={(e) =>
              dispatch({ type: "setDraft", payload: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && state.draft) {
                e.preventDefault();
                dispatch({ type: "send" });
              }
            }}
          />
          <button
            onClick={() => dispatch({ type: "send" })}
            disabled={!state.draft}
            className={
              !state.draft ? `opacity-50 cursor-not-allowed` : `cursor-pointer`
            }
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
