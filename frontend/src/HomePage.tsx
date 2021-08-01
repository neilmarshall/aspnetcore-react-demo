/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { Page } from './Page';
import { PageTitle } from './PageTitle';
import { QuestionList } from './QuestionList';
import { getUnansweredQuestions, QuestionData } from './QuestionsData';
import { PrimaryButton } from './styles';

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
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
        `}
      >
        <PageTitle>Unanswered Questions</PageTitle>
        <PrimaryButton
          onClick={handleAskQuestionClick}
        >
          Ask a question
        </PrimaryButton>
      </div>
      {questionsLoading
        ? <div>Loading...</div>
        : (<QuestionList data={questions} />
      )}
    </Page>
  );
}