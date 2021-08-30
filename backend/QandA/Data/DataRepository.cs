using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using QandA.Data.Models;

namespace QandA.Data
{
    public class DataRepository : IDataRepository
    {
        private readonly string _connectionString;

        public DataRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task DeleteQuestionAsync(int questionId)
        {
            using var connection = new SqlConnection(_connectionString);

            await connection.ExecuteAsync(
                @"EXEC dbo.Question_Delete @QuestionId",
                new { questionId });
        }

        public async Task<AnswerGetResponse> GetAnswerAsync(int answerId)
        {
            using var connection = new SqlConnection(_connectionString);

            return await connection.QueryFirstOrDefaultAsync<AnswerGetResponse>(
                @"EXEC dbo.Answer_Get_ByAnswerId @AnswerId",
                new { answerId });
        }

        public async Task<QuestionGetSingleResponse> GetQuestionAsync(int questionId)
        {
            using var connection = new SqlConnection(_connectionString);

            var results = await connection.QueryMultipleAsync(
                @"EXEC dbo.Question_GetSingle @QuestionId; EXEC dbo.Answer_Get_ByQuestionId @QuestionId;",
                new { questionId });

            var question = await results.ReadFirstAsync<QuestionGetSingleResponse>();

            if (question != null)
            {
                question.Answers = await results.ReadAsync<AnswerGetResponse>();
            }

            return question;
        }

        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsAsync()
        {
            using var connection = new SqlConnection(_connectionString);

            return await connection.QueryAsync<QuestionGetManyResponse>(@"EXEC dbo.Question_GetMany");
        }

        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsWithAnswersAsync()
        {
            using var connection = new SqlConnection(_connectionString);

            var questionDictionary = new Dictionary<int, QuestionGetManyResponse>();

            return (await connection.QueryAsync<QuestionGetManyResponse, AnswerGetResponse, QuestionGetManyResponse>(
                @"EXEC dbo.Question_GetMany_WithAnswers",
                (q, a) =>
                {
                    if (!questionDictionary.TryGetValue(q.QuestionId, out QuestionGetManyResponse question))
                    {
                        question = q;
                        question.Answers = new List<AnswerGetResponse>();
                        questionDictionary.Add(question.QuestionId, question);
                    }
                    question.Answers.Add(a);
                    return question;
                },
                splitOn: "QuestionId"))
                .Distinct()
                .ToList();
        }

        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsBySearchAsync(string search)
        {
            using var connection = new SqlConnection(_connectionString);

            return await connection.QueryAsync<QuestionGetManyResponse>(
                @"EXEC dbo.Question_GetMany_BySearch @Search",
                new { search });
        }

        public async Task<IEnumerable<QuestionGetManyResponse>> GetQuestionsBySearchWithPagingAsync(
            string search,
            int pageNumber,
            int pageSize)
        {
            using var connection = new SqlConnection(_connectionString);

            return await connection.QueryAsync<QuestionGetManyResponse>(
                @"EXEC dbo.Question_GetMany_BySearch_WithPaging @Search, @PageNumber, @PageSize;",
                new { search, pageNumber, pageSize });
        }

        public async Task<IEnumerable<QuestionGetManyResponse>> GetUnansweredQuestionsAsync()
        {
            using var connection = new SqlConnection(_connectionString);

            return await connection.QueryAsync<QuestionGetManyResponse>(@"EXEC dbo.Question_GetUnanswered");
        }

        public async Task<AnswerGetResponse> PostAnswerAsync(AnswerPostFullRequest answer)
        {
            using var connection = new SqlConnection(_connectionString);

            return await connection.QueryFirstAsync<AnswerGetResponse>(
                @"EXEC dbo.Answer_Post @QuestionId, @Content, @UserId, @UserName, @Created",
                answer);
        }

        public async Task<QuestionGetSingleResponse> PostQuestionAsync(QuestionPostFullRequest question)
        {
            using var connection = new SqlConnection(_connectionString);

            var questionId = await connection.QueryFirstAsync<int>(
                @"EXEC dbo.Question_Post @Title, @Content, @UserId, @UserName, @Created",
                question);

            return await GetQuestionAsync(questionId);
        }

        public async Task<QuestionGetSingleResponse> PutQuestionAsync(int questionId, QuestionPutRequest question)
        {
            using var connection = new SqlConnection(_connectionString);

            await connection.ExecuteAsync(
                @"EXEC dbo.Question_Put @QuestionId, @Title, @Content",
                new { questionId, question.Title, question.Content });

            return await GetQuestionAsync(questionId);
        }

        public async Task<bool> QuestionExistsAsync(int questionId)
        {
            using var connection = new SqlConnection(_connectionString);

            return await connection.QueryFirstAsync<bool>(
                @"EXEC dbo.Question_Exists @QuestionId",
                new { questionId });
        }
    }
}
