using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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
        private readonly IQuestionCache _cache;

        public QuestionsController(IDataRepository dataRepository, IQuestionCache questionCache)
        {
            _dataRepository = dataRepository;
            _cache = questionCache;
        }

        // GET: api/questions
        [HttpGet]
        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestions(
            string search,
            bool includeAnswers,
            int page = 1,
            int pageSize = 20)
        {
            if (!string.IsNullOrEmpty(search))
            {
                return await _dataRepository.GetQuestionsBySearchWithPagingAsync(search, page, pageSize);
            }
            else
            {
                if (includeAnswers)
                {
                    return await _dataRepository.GetQuestionsWithAnswersAsync();
                }
                else
                {
                    return await _dataRepository.GetQuestionsAsync();
                }
            }
        }

        // GET: api/questions/unanswered
        [HttpGet("unanswered")]
        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestions()
        {
            return await _dataRepository.GetUnansweredQuestionsAsync();
        }

        // GET: api/questions/{questionId}
        [HttpGet("{questionId}")]
        public async Task<ActionResult<QuestionGetSingleResponse>> GetQuestion(int questionId)
        {
            var question = _cache.Get(questionId);

            if (question == null)
            {
                question = await _dataRepository.GetQuestionAsync(questionId);
            }

            if (question == null)
                return NotFound();

            _cache.Set(question);

            return question;
        }

        // POST api/questions
        [HttpPost]
        public async Task<ActionResult<QuestionGetSingleResponse>> PostQuestion(QuestionPostRequest questionPostRequest)
        {
            var savedQuestion = await _dataRepository.PostQuestionAsync(new QuestionPostFullRequest
            {
                Title = questionPostRequest.Title,
                Content = questionPostRequest.Content,
                UserId = "1",
                UserName = "bob.test@test.com",
                Created = DateTime.UtcNow
            });

            _cache.Remove(savedQuestion.QuestionId);

            return CreatedAtAction(nameof(GetQuestion), new { savedQuestion.QuestionId }, savedQuestion);
        }

        // PUT api/questions/{questionId}
        [HttpPut("{questionId}")]
        public async Task<ActionResult<QuestionGetSingleResponse>> Put(int questionId, QuestionPutRequest questionPutRequest)
        {
            var question = await _dataRepository.GetQuestionAsync(questionId);

            if (question == null)
                return NotFound();

            questionPutRequest.Title = string.IsNullOrEmpty(questionPutRequest.Title)
                ? question.Title
                : questionPutRequest.Title;

            questionPutRequest.Content = string.IsNullOrEmpty(questionPutRequest.Content)
                ? question.Content
                : questionPutRequest.Content;

            _cache.Remove(questionId);

            return await _dataRepository.PutQuestionAsync(questionId, questionPutRequest);
        }

        // DELETE api/questions/{questionId}
        [HttpDelete("{questionId}")]
        public async Task<ActionResult> Delete(int questionId)
        {
            var question = _dataRepository.GetQuestionAsync(questionId);

            if (question == null)
                return NotFound();

            await _dataRepository.DeleteQuestionAsync(questionId);

            _cache.Remove(questionId);

            return NoContent();
        }

        // POST api/questions/answer
        [HttpPost("answer")]
        public async Task<ActionResult<AnswerGetResponse>> PostAnswerAsync(AnswerPostRequest answerPostRequest)
        {
            var questionExists = await _dataRepository.QuestionExistsAsync(answerPostRequest.QuestionId.Value);

            if (!questionExists)
                return NotFound();

            return await _dataRepository.PostAnswerAsync(new AnswerPostFullRequest
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
