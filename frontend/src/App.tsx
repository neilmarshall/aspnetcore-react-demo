/** @jsxImportSource @emotion/react */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { css } from '@emotion/react';

import Header from './Header';
import { HomePage } from './HomePage';
import { NotFoundPage } from './NotFoundPage';
import { QuestionPage } from './QuestionPage';
import { SearchPage } from './SearchPage';
import { SignInPage } from './SignInPage';
import { fontFamily, fontSize, gray2 } from './styles';

const AskPage = React.lazy(() => import('./AskPage'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div css={css`
      font-family: ${fontFamily};
      font-size: ${fontSize};
      color: ${gray2};
    `}>
        <Header />
        <Routes>
          <Route path="" element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route
            path="ask"
            element={
              <React.Suspense
                fallback={
                  <div
                    css={css`
                      margin-top: 100px;
                      text-align: center;
                    `}
                  >
                    Loading...
                  </div>
                }
              >
                <AskPage />
              </React.Suspense>
            }
          />
          <Route path="signin" element={<SignInPage />} />
          <Route path="questions/:questionId" element={<QuestionPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
