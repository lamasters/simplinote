import React from "react";

export type Note = {
  id: string;
  title: string;
  content: string;
};

export type State = {
  notes: Map<string, Note>;
  setNotes: CallableFunction;
  currentNote: string | null;
  setCurrentNote: CallableFunction;
};

const StateContext = React.createContext<State>({
  notes: new Map(),
  setNotes: () => null,
  currentNote: null,
  setCurrentNote: () => null,
});

export function useStateContext() {
  const value = React.useContext(StateContext);
  if (!value) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return value;
}

export function StateProvider(props: React.PropsWithChildren) {
  const [notes, setNotes] = React.useState<Map<string, Note>>(new Map());
  const [currentNote, setCurrentNote] = React.useState<string | null>(null);
  return (
    <StateContext.Provider
      value={{ notes, setNotes, currentNote, setCurrentNote }}
    >
      {props.children}
    </StateContext.Provider>
  );
}
