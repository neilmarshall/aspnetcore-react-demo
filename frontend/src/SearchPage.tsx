/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { useSearchParams } from "react-router-dom";

import { Page } from "./Page";
import { QuestionList } from "./QuestionList";
import { searchQuestions, QuestionData } from "./QuestionsData";

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [questions, setQuestions] = useState<QuestionData[]>([]);

  const search = searchParams.get('criteria') || ''

  useEffect(() => {
    (async (criteria: string) => {
      const foundResults = await searchQuestions(criteria);
      setQuestions(foundResults);
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