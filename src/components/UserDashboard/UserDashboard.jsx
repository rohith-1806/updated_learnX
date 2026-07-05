import React,{useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import { useProgress } from "../../context/ProgressContext";
import "./UserDashboard.css";


const API =
"https://brillon-tasks-1.onrender.com/api/v1";



const UserDashboard=()=>{


const navigate=useNavigate();
const { progressData } = useProgress();


const [activeSection,setActiveSection]
=
useState("dashboard");


const [user,setUser]
=
useState(null);


const [enrolledCourses,setEnrolledCourses]
=
useState([]);


const [certificates,setCertificates]
=
useState([]);


const [events,setEvents]
=
useState([]);


const [editMode,setEditMode]
=
useState(false);



const [editData,setEditData]
=
useState({

name:"",
email:"",
currentPassword:"",
newPassword:""

});







useEffect(()=>{


const savedUser =
JSON.parse(
localStorage.getItem("loggedInUser")
);


setUser(savedUser);



if(savedUser){

setEditData({

name:savedUser.name || "",

email:savedUser.email || "",

currentPassword:"",

newPassword:""

});

}



fetchEnrollments();

fetchCertificates();

fetchEvents();



},[]);










const getToken=()=>{


return(

localStorage.getItem("token")

||

localStorage.getItem("userToken")

);


};









// ================= ENROLLMENTS =================


const fetchEnrollments=async()=>{


try{


const res =
await fetch(

`${API}/enrollments/me`,

{

headers:{

Authorization:`Bearer ${getToken()}`

}

}

);



const data =
await res.json();


console.log(
"DASHBOARD ENROLLMENTS",
data
);




setEnrolledCourses(

data.enrollments ||

data.data ||

[]

);



}

catch(e){

console.log(e);

}


};









// ================= CERTIFICATES =================


const fetchCertificates=async()=>{


try{


const res =
await fetch(

`${API}/certificates/me`,

{

headers:{

Authorization:`Bearer ${getToken()}`

}

}

);



const data =
await res.json();



setCertificates(

data.certificates ||

data.data ||

[]

);


}

catch(e){

console.log(e);

}


};










// ================= EVENTS =================


const fetchEvents=async()=>{


try{


const res =
await fetch(

`${API}/user/my-events`,

{

headers:{

Authorization:`Bearer ${getToken()}`

}

}

);



const data =
await res.json();




setEvents(

data.events ||

data.data ||

[]

);


}

catch(e){

console.log(e);

}


};










const handleChange=(e)=>{


setEditData({

...editData,

[e.target.name]:

e.target.value

});


};









const saveProfile=async()=>{


try{


if(editData.newPassword){



await fetch(

`${API}/user/change-password`,

{

method:"PUT",

headers:{

"Content-Type":"application/json",

Authorization:`Bearer ${getToken()}`

},


body:

JSON.stringify({

newPassword:

editData.newPassword

})


}

);


}




const updated={

...user,

name:editData.name,

email:editData.email

};



setUser(updated);



localStorage.setItem(

"loggedInUser",

JSON.stringify(updated)

);



alert("Profile Updated");


setEditMode(false);



}

catch(e){

alert("Update Failed");

}


};









const logout=()=>{


localStorage.clear();


navigate("/user-login");


};








const progressValue=(item)=>{


const cId = item.courseId?._id || item.courseId;
if (progressData && progressData[cId] && progressData[cId].percentage !== undefined) {
  return progressData[cId].percentage;
}
return(

item.completionPercentage ||

item.progress ||

item.progressPercentage ||

0

);


};








const courseId=(item)=>{


return(

item.courseId?._id ||

item.course?._id ||

item.courseId

);


};
return(

<div className="dashboard-layout-horizontal">



{/* ================= NAVBAR ================= */}


<header className="dashboard-header-navigation">


<div className="navbar-brand-section">

<h2>LernX</h2>

</div>





<nav className="navbar-links-tabs">



<button

className="nav-tab-item"

onClick={()=>setActiveSection("dashboard")}

>

Dashboard

</button>





<button

className="nav-tab-item"

onClick={()=>navigate("/courses")}

>

Browse Courses

</button>






<button

className="nav-tab-item"

onClick={()=>setActiveSection("enrollments")}

>

Enrollments

</button>






<button

className="nav-tab-item"

onClick={()=>setActiveSection("certificates")}

>

Certificates

</button>





<button

className="nav-tab-item"

onClick={()=>setActiveSection("events")}

>

Events

</button>




</nav>







<button

className="navbar-signout-btn"

onClick={logout}

>

Logout

</button>





</header>









{/* ================= MAIN ================= */}



<main className="dashboard-main-content-canvas">







{/* DASHBOARD */}


{

activeSection==="dashboard" &&


<div className="view-wrapper">





<h1>

Welcome {user?.name}

</h1>






<div className="dashboard-metrics-grid">



<div className="metric-card">

<h2>

📚 {enrolledCourses.length}

</h2>

<p>

Courses

</p>

</div>






<div className="metric-card">

<h2>

🏆 {certificates.length}

</h2>

<p>

Certificates

</p>

</div>






<div className="metric-card">

<h2>

🎉 {events.length}

</h2>

<p>

Events

</p>

</div>




</div>









{/* PROFILE */}



<div className="panel-card">


<h2>

Profile

</h2>





{


!editMode ?


<>


<p>

Name : {user?.name}

</p>


<p>

Email : {user?.email}

</p>





<button

className="panel-primary-btn"

onClick={()=>setEditMode(true)}

>

Edit Profile

</button>



</>


:


<>



<input

name="name"

value={editData.name}

onChange={handleChange}

/>



<input

name="email"

value={editData.email}

onChange={handleChange}

/>




<input

type="password"

placeholder="New Password"

name="newPassword"

value={editData.newPassword}

onChange={handleChange}

/>





<button

className="panel-primary-btn"

onClick={saveProfile}

>

Save

</button>



</>


}




</div>





</div>


}












{/* ================= ENROLLMENTS ================= */}



{


activeSection==="enrollments" &&



<div className="view-wrapper">



<h1>

My Learning

</h1>







<div className="saas-cards-grid-layout">



{


enrolledCourses.length>0 ?



enrolledCourses.map(item=>(




<div

className="saas-data-card-item"

key={item._id}

>






<h2>

📘 {


item.courseId?.name ||

item.courseId?.title ||

item.course?.name ||

"Course"


}

</h2>






<p>


{


item.courseId?.description ||

"Continue your learning journey"


}


</p>









{/* PROGRESS */}



<div className="ledger-progress-tracking-bar-wrapper">



<div className="progress-text-values-strip">



<span>

Progress

</span>




<strong>

{

progressValue(item)

}%

</strong>





</div>






<div className="progress-outer-track-bg-line">



<div

className="progress-inner-fill-color-indicator"


style={{

width:

`${progressValue(item)}%`

}}


/>




</div>





</div>








<button

className="panel-primary-btn"


onClick={()=>navigate(

`/learn/${courseId(item)}`

)}

>


Continue Learning


</button>







</div>



))





:




<div className="global-empty-state-card-view">


No courses enrolled


</div>




}






</div>





</div>



}









{/* ================= CERTIFICATES ================= */}
{/* ================= CERTIFICATES ================= */}


{

activeSection==="certificates" &&


<div className="view-wrapper">


<h1>

My Certificates 🏆

</h1>



<p className="section-subtitle">

Your completed course achievements

</p>






<div className="certificate-grid">



{


certificates.length>0 ?


certificates.map(cert=>(



<div

className="certificate-card"

key={cert._id}

>




<div className="certificate-top">


<div className="certificate-icon">

🏆

</div>



<div>


<h2>

Certificate of Completion

</h2>



<p>

Verified Achievement

</p>



</div>


</div>







<div className="certificate-body">



<h3>


{

cert.courseId?.name ||

cert.courseId?.title ||

cert.course?.name ||

"Course"

}


</h3>





<p>


Completed successfully with LernX


</p>






<div className="certificate-info">


<span>

Issued Date

</span>



<strong>


{


cert.createdAt ?

new Date(cert.createdAt)
.toLocaleDateString()

:

"Recently"


}


</strong>


</div>








</div>









<div className="certificate-actions">






{


cert.certificateUrl &&


<a


href={cert.certificateUrl}


target="_blank"


rel="noreferrer"


className="view-cert-btn"


>


View Certificate


</a>


}








{


cert.certificateUrl &&


<a


href={cert.certificateUrl}


download


className="download-cert-btn"


>


Download


</a>


}








</div>





</div>



))


:




<div className="global-empty-state-card-view">


🏆 Complete courses to earn certificates


</div>



}






</div>






</div>


}
{/* ================= EVENTS ================= */}



{


activeSection==="events" &&



<div className="view-wrapper">



<h1>

Events

</h1>





<div className="saas-cards-grid-layout">



{


events.length>0 ?


events.map(e=>(




<div

className="saas-data-card-item"

key={e._id}

>


<h2>

🎉 {e.title}

</h2>



<p>

{e.description}

</p>




</div>



))


:


<div className="global-empty-state-card-view">

No Events

</div>


}





</div>




</div>



}









</main>





</div>


);


};





export default UserDashboard;