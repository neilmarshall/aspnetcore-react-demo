/** @jsxImportSource @emotion/react */
import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { css } from '@emotion/react';
import { useForm } from 'react-hook-form';

import { UserIcon } from './Icons';
import { fontFamily, fontSize, gray1, gray2, gray5 } from './Styles';
import { useAuth } from "./Auth";

type FormData = {
  search: string
};

const Header = (): React.ReactElement => {
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<FormData>();

  const [searchParams] = useSearchParams();

  const criteria = searchParams.get('criteria') || '';

  const submitForm = ({ search }: FormData) => {
    navigate(`search?criteria=${search}`);
  };

  const { isAuthenticated, user, loading } = useAuth();

  return (
    <div css={css`
      position: fixed;
      box-sizing: border-box;
      top: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background-color: #fff;
      border-bottom: 1px solid ${gray5};
      box-shadow: 0 3px 7px 0 rgba(110, 112, 114, 0.21);
    `}>
      <Link to="/" css={css`
        font-size: 24px;
        font-weight: bold;
        color: ${gray1};
        text-decoration: none;
      `}>
        Q & A
      </Link>
      <form onSubmit={handleSubmit(submitForm)}>
        <input
          ref={register}
          name="search"
          type="text"
          placeholder="Search..."
          defaultValue={criteria}
          css={css`
          box-sizing: border-box;
          font-family: ${fontFamily};
          font-size: ${fontSize};
          padding: 8px 10px;
          border-bottom: 1px solid ${gray5};
          border-radius: 3px;
          color: ${gray2};
          background-color: white;
          width: 200px;
          height: 30px;
          :focus {
            outline-color: ${gray5};
          }
        `}
        />
      </form>
      {!loading && (isAuthenticated ? (
        <div>
          {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
          <span>{user!.name}</span>
          <Link
            to="signout"
            css={css`
          font-family: ${fontFamily};
          font-size: ${fontSize};
          padding: 5px 10px;
          background-color: transparent;
          color: ${gray2};
          text-decoration: none;
          cursor: pointer;
          :focus {
            outline-color: ${gray5};
          }
          span {
            margin-left: 7px;
          }
        `}
          >
            <UserIcon />
            <span>Sign Out</span>
          </Link>
        </div>
      ) : (
        <Link
          to="signin"
          css={css`
          font-family: ${fontFamily};
          font-size: ${fontSize};
          padding: 5px 10px;
          background-color: transparent;
          color: ${gray2};
          text-decoration: none;
          cursor: pointer;
          :focus {
            outline-color: ${gray5};
          }
          span {
            margin-left: 7px;
          }
        `}
        >
          <UserIcon />
          <span>Sign In</span>
        </Link>
      ))}
    </div>
  );
};

export default Header;