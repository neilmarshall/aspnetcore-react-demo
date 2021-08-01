/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from 'react';
import { Page } from './Page';
import { PageTitle } from './PageTitle';
import { PrimaryButton } from './styles';
import { QuestionList } from './QuestionList';
import { css } from '@emotion/react';
import { getUnansweredQuestions, QuestionData } from './QuestionsData';
import { useNavigate } from 'react-router';

export const HomePage = (): React.ReactElement => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setQuestions(await getUnansweredQuestions());
      setQuestionsLoading(false);
    })();
  }, []);

  const navigate = useNavigate();

  const handleAskQuestionClick = () => {
    navigate('ask');
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