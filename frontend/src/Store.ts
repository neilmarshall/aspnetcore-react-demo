import { Store, createStore, combineReducers } from "redux";

import { QuestionData } from "./QuestionsData";

interface QuestionsState {
  readonly loading: boolean;
  readonly unanswered: QuestionData[];
  readonly viewing: QuestionData | null;
  readonly searched: QuestionData[];
}

export interface AppState {
  readonly questions: QuestionsState;
}

const initialQuestionState: QuestionsState = {
  loading: false,
  unanswered: [],
  viewing: null,
  searched: []
};

export const GETTINGUNANSWEREDQUESTIONS = 'GettingUnansweredQuestions';
export const gettingUnansweredQuestionsAction = () => ({ type: GETTINGUNANSWEREDQUESTIONS } as const);

export const GOTUNANSWEREDQUESTIONS = 'GotUnansweredQuestions';
export const gotUnansweredQuestionsAction = (questions: QuestionData[]) => ({
  type: GOTUNANSWEREDQUESTIONS,
  questions: questions
} as const);

export const GETTINGQUESTION = 'GettingQuestion';
export const gettingQuestionAction = () => ({ type: GETTINGQUESTION } as const);

export const GOTQUESTION = 'GotQuestion';
export const gotQuestionAction = (question: QuestionData | null) => ({
  type: GOTQUESTION,
  question: question
} as const);

export const SEARCHINGQUESTIONS = 'SearchingQuestions';
export const searchingQuestionsAction = () => ({ type: SEARCHINGQUESTIONS } as const);

export const SEARCHEDQUESTIONS = 'SearchedQuestions';
export const searchedQuestionsAction = (questions: QuestionData[]) => ({
  type: SEARCHEDQUESTIONS,
  questions
} as const);

type QuestionsAction =
  | ReturnType<typeof gettingUnansweredQuestionsAction>
  | ReturnType<typeof gotUnansweredQuestionsAction>
  | ReturnType<typeof gettingQuestionAction>
  | ReturnType<typeof gotQuestionAction>
  | ReturnType<typeof searchingQuestionsAction>
  | ReturnType<typeof searchedQuestionsAction>

const questionsReducer = (
  state = initialQuestionState,
  action: QuestionsAction
) => {
  switch (action.type) {
    case GETTINGUNANSWEREDQUESTIONS: {
      return {
        ...state,
        loading: true
      };
    }
    case GOTUNANSWEREDQUESTIONS: {
      return {
        ...state,
        loading: false,
        unanswered: action.questions
      };
    }
    case GETTINGQUESTION: {
      return {
        ...state,
        loading: true,
        viewing: null
      };
    }
    case GOTQUESTION: {
      return {
        ...state,
        loading: false,
        viewing: action.question
      };
    }
    case SEARCHINGQUESTIONS: {
      return {
        ...state,
        loading: true,
        searched: []
      };
    }
    case SEARCHEDQUESTIONS: {
      return {
        ...state,
        loading: false,
        searched: action.questions
      };
    }
  }
  return state;
};

const rootReducer = combineReducers<AppState>({
  questions: questionsReducer
});

export function configureStore(): Store<AppState> {
  const store = createStore(rootReducer, undefined);
  return store;
}