/** @jsxImportSource @emotion/react */
import React, { Fragment, useEffect, useState } from "react";
import { css } from "@emotion/react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";

import { AnswerList } from "./AnswerList";
import { AppState, gettingQuestionAction, gotQuestionAction } from "./Store";
import { Page } from "./Page";
import { getQuestion, postAnswer } from "./QuestionsData";
import { gray3, gray6, FieldSet, FieldContainer, FieldLabel, FieldTextArea, FormButtonContainer, PrimaryButton, FieldError, SubmissionSuccess } from "./Styles";
import { useAuth } from './Auth';

type FormData = {
  content: string;
};

export const QuestionPage: React.FC = () => {
  const dispatch = useDispatch();

  const question = useSelector((state: AppState) => state.questions.viewing);
  const [successfullySubmitted, setSuccessfullySubmitted] = useState(false);

  const { register, errors, handleSubmit, formState } = useForm<FormData>({
    mode: 'onBlur'
  });

  const { questionId } = useParams();

  const submitForm = async (data: FormData) => {
    const result = await postAnswer({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      questionId: question!.questionId,
      content: data.content,
      userName: 'Fred',
      created: new Date()
    });

    setSuccessfullySubmitted(result ? true : false);
  };

  useEffect(() => {
    const doGetQuestion = async (questionId: number) => {
      dispatch(gettingQuestionAction());
      const foundQuestion = await getQuestion(questionId);
      dispatch(gotQuestionAction(foundQuestion));
    };

    if (questionId) {
      doGetQuestion(Number(questionId));
    }
  }, [questionId]);

  const { isAuthenticated } = useAuth();

  return (
    <Page>
      <div
        css={css`
          background-color: white;
          padding: 15px 20px 20px 20px;
          border-radius: 4px;
          border: 1px solid ${gray6};
          box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.16);
        `}
      >
        <div
          css={css`
              font-size: 19px;
              font-weight: bold;
              margin: 10px 0px 5px;
            `}
        >
          {question === null ? '' : question.title}
        </div>
        {question !== null &&
          <Fragment>
            <p
              css={css`
              margin-top: 0px;
              background-color: white;
          `}
            >
              {question.content}
            </p>
            <div
              css={css`
              font-size: 12px;
              font-style: italic;
              color: ${gray3}
          `}
            >
              {`Asked by ${question.userName} on ${question.created.toLocaleDateString()} ${question.created.toLocaleTimeString()}`}
            </div>
            <AnswerList data={question.answers} />
            {isAuthenticated && (
              <form
                onSubmit={handleSubmit(submitForm)}
                css={css`
                margin-top: 20px;
              `}>
                <FieldSet
                  disabled={formState.isSubmitting || successfullySubmitted}
                >
                  <FieldContainer>
                    <FieldLabel htmlFor="content">
                      Your Answer
                    </FieldLabel>
                    <FieldTextArea
                      id="content"
                      name="content"
                      ref={register({
                        required: true,
                        minLength: 50
                      })}
                    />
                    {errors.content && errors.content.type === 'required' && (
                      <FieldError>
                        You must enter an answer
                      </FieldError>
                    )}
                    {errors.content && errors.content.type === 'minLength' && (
                      <FieldError>
                        The answer must be at least 50 characters
                      </FieldError>
                    )}
                  </FieldContainer>
                  <FormButtonContainer>
                    <PrimaryButton type="submit">
                      Submit Your Answer
                    </PrimaryButton>
                  </FormButtonContainer>
                  {successfullySubmitted && (
                    <SubmissionSuccess>
                      Your answer was successfully submitted
                    </SubmissionSuccess>
                  )}
                </FieldSet>
              </form>
            )}
          </Fragment>}
      </div>
    </Page>
  );
};