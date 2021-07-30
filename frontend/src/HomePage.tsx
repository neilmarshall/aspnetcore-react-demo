import React, { useEffect, useState } from 'react';
import { Page } from './Page';
import { PageTitle } from './PageTitle';
import { QuestionList } from './QuestionList';
import { getUnansweredQuestions, QuestionData } from './QuestionsData';

export const HomePage = (): React.ReactElement => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setQuestions(await getUnansweredQuestions());
      setQuestionsLoading(false);
    })();
  }, []);

  const handleAskQuestionClick = () => {
    console.log('TODO - move to the AskPage');
  };

  return (
    <Page>
      <div>
        <PageTitle>Unanswered Questions</PageTitle>
        <button onClick={handleAskQuestionClick}>Ask a question</button>
      </div>
      {questionsLoading
        ? <div>Loading...</div>
        : (<QuestionList data={questions} />
      )}
    </Page>
  );
}