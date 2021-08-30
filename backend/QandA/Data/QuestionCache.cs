using Microsoft.Extensions.Caching.Memory;
using QandA.Data.Models;

namespace QandA.Data
{
    public class QuestionCache : IQuestionCache
    {
        public MemoryCache _cache { get; }

        public QuestionCache()
        {
            _cache = new MemoryCache(new MemoryCacheOptions
            {
                SizeLimit = 100
            });
        }

        private static string GetCacheKey(int questionId) => $"Question-{questionId}";

        public QuestionGetSingleResponse Get(int questionId)
        {
            _cache.TryGetValue(GetCacheKey(questionId), out QuestionGetSingleResponse question);
            return question;
        }

        public void Remove(int questionId)
        {
            _cache.Remove(GetCacheKey(questionId));
        }

        public void Set(QuestionGetSingleResponse question)
        {
            var cacheEntryOptions = new MemoryCacheEntryOptions().SetSize(1);

            _cache.Set(GetCacheKey(question.QuestionId), question, cacheEntryOptions);
        }
    }
}
