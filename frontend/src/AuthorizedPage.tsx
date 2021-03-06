import React, { Fragment } from "react";

import { Page } from "./Page";
import { useAuth } from "./Auth";

export const AuthorizedPage: React.FC = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Fragment>
        {children}
      </Fragment>
    );
  } else {
    return (
      <Page title="You do not have access to this page">
        {null}
      </Page>
    );
  }
}