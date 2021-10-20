/** @jsxImportSource @emotion/react */
import React, { useEffect } from 'react';
import { css } from '@emotion/react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';

import { Page } from './Page';
import { PageTitle } from './PageTitle';
import { PrimaryButton } from './Styles';
import { QuestionList } from './QuestionList';
import { getUnansweredQuestions } from './QuestionsData';
import { gettingUnansweredQuestionsAction, gotUnansweredQuestionsAction, AppState } from './Store';
import { useAuth } from './Auth';

export const HomePage = (): React.ReactElement => {
  const dispatch = useDispatch();

  const questions = useSelector((state: AppState) => state.questions.unanswered);
  const questionsLoading = useSelector((state: AppState) => state.questions.loading);

  useEffect(() => {
    (async () => {
      dispatch(gettingUnansweredQuestionsAction());
      const unansweredQuestions = await getUnansweredQuestions();
      dispatch(gotUnansweredQuestionsAction(unansweredQuestions));
    })();
  }, []);

  const navigate = useNavigate();

  const handleAskQuestionClick = () => {
    navigate('ask');
  };

  const { isAuthenticated } = useAuth();

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
        {isAuthenticated && (
          <PrimaryButton
            onClick={handleAskQuestionClick}
          >
            Ask a question
          </PrimaryButton>
        )}
      </div>
      {questionsLoading
        ? <div>Loading...</div>
        : (<QuestionList data={questions} />
        )}
    </Page>
  );
}