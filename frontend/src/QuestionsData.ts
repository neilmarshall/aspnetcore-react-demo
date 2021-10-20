import { getAccessToken } from "./Auth";
import { http } from "./http";

interface QuestionDataFromServer {
  questionId: number;
  title: string;
  content: string;
  userName: string;
  created: string;
  answers: AnswerDataFromServer[]
}

export interface QuestionData {
  questionId: number;
  title: string;
  content: string;
  userName: string;
  created: Date;
  answers: AnswerData[]
}

export interface AnswerDataFromServer {
  answerId: number;
  content: string;
  userName: string;
  created: string;
}

export interface AnswerData {
  answerId: number;
  content: string;
  userName: string;
  created: Date;
}

export interface PostQuestionData {
  title: string;
  content: string;
  userName: string;
  created: Date;
}

export interface PostAnswerData {
  questionId: number,
  content: string;
  userName: string;
  created: Date;
}

const mapQuestionFromServer = (question: QuestionDataFromServer): QuestionData => {
  const answers = question.answers?.map(answer => ({ ...answer, created: new Date(answer.created) }));
  return { ...question, created: new Date(question.created), answers };
}

export const getUnansweredQuestions = async (): Promise<QuestionData[]> => {
  const result = await http<QuestionDataFromServer[]>({
    path: 'questions/unanswered'
  });
  if (result.ok && result.body) {
    return result.body.map(mapQuestionFromServer);
  } else {
    return [];
  }
};

export const getQuestion = async (questionId: number): Promise<QuestionData | null> => {
  const result = await http<QuestionDataFromServer>({
    path: `questions/${questionId}`
  });
  if (result.ok && result.body) {
    return mapQuestionFromServer(result.body);
  } else {
    return null;
  }
};

export const searchQuestions = async (criteria: string): Promise<QuestionData[]> => {
  const result = await http<QuestionDataFromServer[]>({
    path: `questions?search=${criteria}`
  });
  if (result.ok && result.body) {
    return result.body.map(mapQuestionFromServer);
  } else {
    return [];
  }
};

export const postQuestion = async (question: PostQuestionData): Promise<QuestionData | undefined> => {
  const accessToken = await getAccessToken();
  const result = await http<QuestionDataFromServer, PostQuestionData>({
    path: 'questions',
    method: 'post',
    body: question,
    accessToken
  });

  if (result.ok && result.body) {
    return mapQuestionFromServer(result.body);
  } else {
    return undefined;
  }
};

export const postAnswer = async (answer: PostAnswerData): Promise<AnswerData | undefined> => {
  const accessToken = await getAccessToken();
  const result = await http<AnswerData, PostAnswerData>({
    path: 'questions/answer',
    method: 'post',
    body: answer,
    accessToken
  });

  if (result.ok) {
    return result.body;
  } else {
    return undefined;
  }
}