const axios = require('axios');

async function run() {
  try {
    console.log("Fetching courses...");
    const coursesRes = await axios.get("https://brillon-tasks-1.onrender.com/api/v1/content/courses");
    const courses = coursesRes.data.data || coursesRes.data;
    console.log(`Fetched ${courses.length} courses:`);
    for (const c of courses) {
      console.log(` - ID: ${c._id}, Name: ${c.name || c.title}`);
      
      // Fetch modules for this course
      try {
        const modulesRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/modules?courseId=${c._id}`);
        const modules = modulesRes.data.data || [];
        console.log(`    Modules: ${modules.length}`);
        
        let totalLessons = 0;
        for (const m of modules) {
          // Fetch submodules
          const subRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/sub-modules?moduleId=${m._id}`);
          const subs = subRes.data.data || [];
          
          // Fetch assignments
          const assRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/assignments?moduleId=${m._id}`);
          const asms = assRes.data.data || [];
          
          // Quizzes (quizzes might be nested in the module or fetched separately)
          const quizCount = m.quizzes ? m.quizzes.length : 0;
          
          let subVideoCount = 0;
          for (const sub of subs) {
            const vidRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/videos?subModuleId=${sub._id}`);
            const vids = vidRes.data.data || [];
            subVideoCount += vids.length;
          }
          
          const moduleLessonsCount = subs.length + subVideoCount + asms.length + quizCount;
          totalLessons += moduleLessonsCount;
          console.log(`      * Module ${m._id} "${m.name || m.title}": ${subs.length} submodules, ${subVideoCount} videos, ${asms.length} assignments, ${quizCount} quizzes = ${moduleLessonsCount} items`);
        }
        
        // Fetch final assignments
        const finalRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/final-assignments?courseId=${c._id}`);
        const finals = finalRes.data.data || [];
        totalLessons += finals.length;
        console.log(`      * Final Assignments: ${finals.length}`);
        console.log(`    Total items for course: ${totalLessons}`);
      } catch (err) {
        console.error(`    Error fetching modules for ${c._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Error fetching from API:", err);
  }
}

run();
