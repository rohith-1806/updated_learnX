const fallback = require('./src/utils/fallbackContent.js');
// Wait, fallbackContent might default export or export TOPICS. Let's see what is exported.
console.log("Keys in fallbackContent:", Object.keys(fallback));
// Let's print the structure
const TOPICS = fallback.TOPICS || fallback;
for (const key of Object.keys(TOPICS)) {
  const data = TOPICS[key];
  if (!data) continue;
  
  const topicsCount = data.topics ? data.topics.length : 0;
  const assignmentsCount = data.assignments ? data.assignments.length : 0;
  const quizCount = data.quiz ? data.quiz.length : 0;
  const hasFinal = data.finalTask ? 1 : 0;
  
  // Note: let's check how many videos. In fallbackContent, there is a videoTitle and videoUrl per course.
  // Wait, is it 1 video per course, or how many? Let's check how many videos are rendered.
  // In CoursePlayer, videos are fetched via API, but if it falls back to mock, it generates 1 video.
  console.log(`Course ${key}: topics=${topicsCount}, assignments=${assignmentsCount}, quizzes=${quizCount}, hasFinal=${hasFinal}`);
}
