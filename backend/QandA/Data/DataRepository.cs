using System.Collections.Generic;
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

        public void DeleteQuestion(int questionId)
        {
            using var connection = new SqlConnection(_connectionString);

            connection.Execute(
                @"EXEC dbo.Question_Delete @QuestionId",
                new { questionId });
        }

        public AnswerGetResponse GetAnswer(int answerId)
        {
            using var connection = new SqlConnection(_connectionString);

            return connection.QueryFirstOrDefault<AnswerGetResponse>(
                @"EXEC dbo.Answer_Get_ByAnswerId @AnswerId",
                new { answerId });
        }

        public QuestionGetSingleResponse GetQuestion(int questionId)
        {
            using var connection = new SqlConnection(_connectionString);

            var question = connection.QueryFirstOrDefault<QuestionGetSingleResponse>(
                @"EXEC dbo.Question_GetSingle @QuestionId",
                new { questionId });

            if (question != null)
            {
                question.Answers = connection.Query<AnswerGetResponse>(
                    @"EXEC dbo.Answer_Get_ByQuestionId @QuestionId",
                    new { questionId });
            }

            return question;
        }

        public IEnumerable<QuestionGetManyResponse> GetQuestions()
        {
            using var connection = new SqlConnection(_connectionString);

            return connection.Query<QuestionGetManyResponse>(@"EXEC dbo.Question_GetMany");
        }

        public IEnumerable<QuestionGetManyResponse> GetQuestionsBySearch(string search)
        {
            using var connection = new SqlConnection(_connectionString);

            return connection.Query<QuestionGetManyResponse>(
                @"EXEC dbo.Question_GetMany_BySearch @Search",
                new { search });
        }

        public IEnumerable<QuestionGetManyResponse> GetUnansweredQuestions()
        {
            using var connection = new SqlConnection(_connectionString);

            return connection.Query<QuestionGetManyResponse>(@"EXEC dbo.Question_GetUnanswered");
        }

        public AnswerGetResponse PostAnswer(AnswerPostFullRequest answer)
        {
            using var connection = new SqlConnection(_connectionString);

            return connection.QueryFirst<AnswerGetResponse>(
                @"EXEC dbo.Answer_Post @QuestionId, @Content, @UserId, @UserName, @Created",
                answer);
        }

        public QuestionGetSingleResponse PostQuestion(QuestionPostFullRequest question)
        {
            using var connection = new SqlConnection(_connectionString);

            var questionId = connection.QueryFirst<int>(
                @"EXEC dbo.Question_Post @Title, @Content, @UserId, @UserName, @Created",
                question);

            return GetQuestion(questionId);
        }

        public QuestionGetSingleResponse PutQuestion(int questionId, QuestionPutRequest question)
        {
            using var connection = new SqlConnection(_connectionString);

            connection.Execute(
                @"EXEC dbo.Question_Put @QuestionId, @Title, @Content",
                new { questionId, question.Title, question.Content });

            return GetQuestion(questionId);
        }

        public bool QuestionExists(int questionId)
        {
            using var connection = new SqlConnection(_connectionString);

            return connection.QueryFirst<bool>(
                @"EXEC dbo.Question_Exists @QuestionId",
                new { questionId });
        }
    }
}
