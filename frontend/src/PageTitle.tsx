import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const PageTitle = ({ children }: Props): React.ReactElement =>
  <h2>{children}</h2>;