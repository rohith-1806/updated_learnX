const axios = require('axios');

async function run() {
  try {
    console.log("Logging in with palletisreedharreddy5...");
    const loginRes = await axios.post("https://brillon-tasks-1.onrender.com/api/v1/auth/login", {
      email: "palletisreedharreddy5@gmail.com",
      password: "sreedhar73311"
    });
    
    const token = loginRes.data.token || loginRes.data.data?.token;
    if (!token) {
      console.log("Login succeeded, but no token returned. Response:", loginRes.data);
      return;
    }
    
    console.log("Login success! Token:", token);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log("Fetching courses...");
    const coursesRes = await axios.get("https://brillon-tasks-1.onrender.com/api/v1/content/courses", { headers });
    const courses = coursesRes.data.data || coursesRes.data;
    console.log(`Fetched ${courses.length} courses:`);
    
    const courseMap = {};
    for (const c of courses) {
      console.log(` - ID: ${c._id}, Name: ${c.name || c.title}`);
      
      try {
        const modulesRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/modules?courseId=${c._id}`, { headers });
        const modules = modulesRes.data.data || [];
        
        let subCount = 0;
        let videoCount = 0;
        let assCount = 0;
        let quizCount = 0;
        
        for (const m of modules) {
          // Fetch submodules
          const subRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/sub-modules?moduleId=${m._id}`, { headers });
          const subs = subRes.data.data || [];
          subCount += subs.length;
          
          // Fetch assignments
          const assRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/assignments?moduleId=${m._id}`, { headers });
          const asms = assRes.data.data || [];
          assCount += asms.length;
          
          // Fetch videos
          for (const sub of subs) {
            const vidRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/videos?subModuleId=${sub._id}`, { headers });
            const vids = vidRes.data.data || [];
            videoCount += vids.length;
          }
          
          quizCount += m.quizzes ? m.quizzes.length : 0;
        }
        
        const finalRes = await axios.get(`https://brillon-tasks-1.onrender.com/api/v1/content/final-assignments?courseId=${c._id}`, { headers });
        const finals = finalRes.data.data || [];
        const finalCount = finals.length;
        
        const total = subCount + videoCount + assCount + quizCount + finalCount;
        console.log(`    Total lessons = ${total} (submodules: ${subCount}, videos: ${videoCount}, assignments: ${assCount}, quizzes: ${quizCount}, final: ${finalCount})`);
        courseMap[c._id] = total;
      } catch (err) {
        console.error(`    Error counting for course ${c._id}:`, err.message);
      }
    }
    
    console.log("JSON map of course totals:", JSON.stringify(courseMap, null, 2));
  } catch (err) {
    console.error("Error running script:", err.response ? err.response.data : err.message);
  }
}

run();
