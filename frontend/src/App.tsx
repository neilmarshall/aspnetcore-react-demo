/** @jsxImportSource @emotion/react */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { css } from '@emotion/react';

import Header from './Header';
import { AuthProvider } from './Auth';
import { AuthorizedPage } from './AuthorizedPage';
import { HomePage } from './HomePage';
import { NotFoundPage } from './NotFoundPage';
import { QuestionPage } from './QuestionPage';
import { SearchPage } from './SearchPage';
import { SignInPage } from './SignInPage';
import { SignOutPage } from './SignOutPage';
import { configureStore } from './Store';
import { fontFamily, fontSize, gray2 } from './Styles';

const AskPage = React.lazy(() => import('./AskPage'));

const store = configureStore();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Provider store={store}>
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
                    <AuthorizedPage>
                      <AskPage />
                    </AuthorizedPage>
                  </React.Suspense>
                }
              />
              <Route path="signin" element={<SignInPage action="signin" />} />
              <Route path="signin-callback" element={<SignInPage action="signin-callback" />} />
              <Route path="signout" element={<SignOutPage action="signout" />} />
              <Route path="signout-callback" element={<SignOutPage action="signout-callback" />} />
              <Route path="questions/:questionId" element={<QuestionPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </Provider>
    </AuthProvider>
  );
}

export default App;
