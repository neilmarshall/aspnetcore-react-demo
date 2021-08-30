using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using QandA.Data;
using QandA.Data.Models;

namespace QandA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionsController : ControllerBase
    {
        private readonly IDataRepository _dataRepository;

        public QuestionsController(IDataRepository dataRepository)
        {
            _dataRepository = dataRepository;
        }

        // GET: api/questions
        [HttpGet]
        public IEnumerable<QuestionGetManyResponse> GetQuestions(string search)
        {
            if (!string.IsNullOrEmpty(search))
            {
                return _dataRepository.GetQuestionsBySearch(search);
            }
            else
            {
                return _dataRepository.GetQuestions();
            }
        }

        // GET: api/questions/unanswered
        [HttpGet("unanswered")]
        public IEnumerable<QuestionGetManyResponse> GetQuestions()
        {
            return _dataRepository.GetUnansweredQuestions();
        }

        // GET: api/questions/{questionId}
        [HttpGet("{questionId}")]
        public ActionResult<QuestionGetSingleResponse> GetQuestion(int questionId)
        {
            var question = _dataRepository.GetQuestion(questionId);

            if (question == null)
                return NotFound();

            return question;
        }

        // POST api/questions
        [HttpPost]
        public ActionResult<QuestionGetSingleResponse> PostQuestion(QuestionPostRequest questionPostRequest)
        {
            var savedQuestion = _dataRepository.PostQuestion(new QuestionPostFullRequest
            {
                Title = questionPostRequest.Title,
                Content = questionPostRequest.Content,
                UserId = "1",
                UserName = "bob.test@test.com",
                Created = DateTime.UtcNow
            });

            return CreatedAtAction(nameof(GetQuestion), new { savedQuestion.QuestionId }, savedQuestion);
        }

        // PUT api/questions/{questionId}
        [HttpPut("{questionId}")]
        public ActionResult<QuestionGetSingleResponse> Put(int questionId, QuestionPutRequest questionPutRequest)
        {
            var question = _dataRepository.GetQuestion(questionId);

            if (question == null)
                return NotFound();

            questionPutRequest.Title = string.IsNullOrEmpty(questionPutRequest.Title)
                ? question.Title
                : questionPutRequest.Title;

            questionPutRequest.Content = string.IsNullOrEmpty(questionPutRequest.Content)
                ? question.Content
                : questionPutRequest.Content;

            return _dataRepository.PutQuestion(questionId, questionPutRequest);
        }

        // DELETE api/questions/{questionId}
        [HttpDelete("{questionId}")]
        public ActionResult Delete(int questionId)
        {
            var question = _dataRepository.GetQuestion(questionId);

            if (question == null)
                return NotFound();

            _dataRepository.DeleteQuestion(questionId);

            return NoContent();
        }

        // POST api/questions/answer
        [HttpPost("answer")]
        public ActionResult<AnswerGetResponse> PostAnswer(AnswerPostRequest answerPostRequest)
        {
            var questionExists = _dataRepository.QuestionExists(answerPostRequest.QuestionId.Value);

            if (!questionExists)
                return NotFound();

            return _dataRepository.PostAnswer(new AnswerPostFullRequest
            {
                QuestionId = answerPostRequest.QuestionId.Value,
                Content = answerPostRequest.Content,
                UserId = "1",
                UserName = "bob.test@test.com",
                Created = DateTime.UtcNow
            });
        }
    }
}
