using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
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
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _auth0UserInfo;

        public QuestionsController(
            IDataRepository dataRepository, 
            IQuestionCache questionCache,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _dataRepository = dataRepository;
            _cache = questionCache;
            _httpClientFactory = httpClientFactory;
            _auth0UserInfo = $"{configuration["Auth0:Authority"]}userinfo";
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
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<QuestionGetSingleResponse>> PostQuestion(QuestionPostRequest questionPostRequest)
        {
            var savedQuestion = await _dataRepository.PostQuestionAsync(new QuestionPostFullRequest
            {
                Title = questionPostRequest.Title,
                Content = questionPostRequest.Content,
                UserId = User.FindFirst(ClaimTypes.NameIdentifier).Value,
                UserName = await GetUserName(),
                Created = DateTime.UtcNow
            });

            _cache.Remove(savedQuestion.QuestionId);

            return CreatedAtAction(nameof(GetQuestion), new { savedQuestion.QuestionId }, savedQuestion);
        }

        // PUT api/questions/{questionId}
        [Authorize(Policy = "MustBeQuestionAuthor")]
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
        [Authorize(Policy = "MustBeQuestionAuthor")]
        [HttpDelete("{questionId}")]
        public async Task<ActionResult> Delete(int questionId)
        {
            var question = await _dataRepository.GetQuestionAsync(questionId);

            if (question == null)
                return NotFound();

            await _dataRepository.DeleteQuestionAsync(questionId);

            _cache.Remove(questionId);

            return NoContent();
        }

        // POST api/questions/answer
        [Authorize]
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
                UserId = User.FindFirst(ClaimTypes.NameIdentifier).Value,
                UserName = await GetUserName(),
                Created = DateTime.UtcNow
            });
        }

        private async Task<string> GetUserName()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, _auth0UserInfo);
            request.Headers.Add("Authorization", Request.Headers["Authorization"].First());
            var client = _httpClientFactory.CreateClient();
            var response = await client.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var jsonContent = await response.Content.ReadAsStringAsync();
                var user = JsonSerializer.Deserialize<User>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return user.Name;
            }
            else
            {
                return "";
            }
        }
    }
}
