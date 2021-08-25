/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { AppState, searchingQuestionsAction, searchedQuestionsAction } from "./Store";
import { Page } from "./Page";
import { QuestionList } from "./QuestionList";
import { searchQuestions } from "./QuestionsData";

export const SearchPage: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const questions = useSelector((state: AppState) => state.questions.searched);

  const search = searchParams.get('criteria') || ''

  useEffect(() => {
    (async (criteria: string) => {
      dispatch(searchingQuestionsAction());
      const foundResults = await searchQuestions(criteria);
      dispatch(searchedQuestionsAction(foundResults));
    })(search);
  }, [search]);

  return (
    <Page title="Search Results">
      {search &&
        <p
          css={css`
            font-size: 16px;
            font-style: italic;
            margin-top: 0px;
          `}
        >
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          for "{search}"
        </p>
      }
      <QuestionList data={questions} />
    </Page>
  );
};