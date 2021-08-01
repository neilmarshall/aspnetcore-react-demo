/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import user from './user.svg';

export const UserIcon = (): React.ReactElement => (
  <img
    src={user}
    alt="User"
    css={css`
      width: 12px;
      opacity: 0.6;
    `}
  />
);