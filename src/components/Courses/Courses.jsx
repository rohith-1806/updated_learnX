import React,{useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import SkeletonLoader from "../common/SkeletonLoader";
import PageLoader from "../common/PageLoader";
import "./Courses.css";


const BASE_URL =
"https://brillon-tasks-1.onrender.com/api/v1";



const Courses=({home})=>{


const navigate=useNavigate();


const [items,setItems]=useState([]);

const [level,setLevel]=useState("departments");

const [title,setTitle]=useState("Departments");

const [history,setHistory]=useState([]);

const [loading,setLoading]=useState(true);







const getGradient = (id) => {
  const colors = [
    "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
  ];
  const index = id ? String(id).charCodeAt(String(id).length - 1) % colors.length : 0;
  return colors[index];
};










// ================= API FIX =================


const extractArray=(data)=>{



console.log(
"API RESPONSE",
data
);




if(Array.isArray(data))

return data;




if(Array.isArray(data.data))

return data.data;




if(Array.isArray(data.data?.departments))

return data.data.departments;




if(Array.isArray(data.data?.categories))

return data.data.categories;




if(Array.isArray(data.data?.domains))

return data.data.domains;




if(Array.isArray(data.data?.tracks))

return data.data.tracks;




if(Array.isArray(data.data?.courses))

return data.data.courses;





if(Array.isArray(data.departments))

return data.departments;



if(Array.isArray(data.categories))

return data.categories;



if(Array.isArray(data.domains))

return data.domains;



if(Array.isArray(data.tracks))

return data.tracks;



if(Array.isArray(data.courses))

return data.courses;




return [];

};










const apiCall=async(url)=>{


const token=

localStorage.getItem("token")

||

localStorage.getItem("userToken");




const res=await fetch(

BASE_URL+url,

{

headers:{

Authorization:`Bearer ${token}`

}

}

);




const data=await res.json();




return extractArray(data);



};











// FIRST LOAD


const loadDepartments=async()=>{


try{


setLoading(true);



const result=

await apiCall(

"/hierarchy/departments"

);



setItems(result);


setLevel("departments");


setTitle("Departments");



}


catch(e){

console.log(e);

}


finally{

setLoading(false);

}



};










useEffect(()=>{


loadDepartments();


},[]);











// CARD CLICK


const openItem=async(item)=>{
  if (home) {
    navigate("/courses", { state: { autoOpenItem: item } });
    return;
  }
  
  try{


setLoading(true);





setHistory([

...history,


{

items,

level,

title

}


]);







let result=[];







if(level==="departments"){



result=await apiCall(

`/hierarchy/categories?departmentId=${item._id}`

);


setLevel("categories");


}





else if(level==="categories"){



result=await apiCall(

`/hierarchy/domains?categoryId=${item._id}`

);


setLevel("domains");


}






else if(level==="domains"){



result=await apiCall(

`/hierarchy/tracks?domainId=${item._id}`

);



setLevel("tracks");


}







else if(level==="tracks"){



result=await apiCall(

`/content/courses?trackId=${item._id}`

);



setLevel("courses");


}






else if(level==="courses"){



navigate(

`/course-details/${item._id}`

);



return;


}








setItems(result);



setTitle(

item.name ||

item.title

);



}



catch(e){


console.log(e);


}


finally{


setLoading(false);


}



};










// BACK


const goBack=()=>{


const last=

history[history.length-1];



if(!last)

return;




setItems(last.items);

setLevel(last.level);

setTitle(last.title);



setHistory(

history.slice(0,-1)

);


};








if(loading) {
  if (home) return <PageLoader />;
  return <SkeletonLoader count={8} type="course" />;
}









const list=

Array.isArray(items)

?

(home ? items.slice(0,3):items)

:

[];











return(


<div className="courses-section">





<h1 className="courses-title">

{title}

</h1>





{

history.length>0 &&


<button

className="view-more-btn"

onClick={goBack}

>

← Back

</button>


}








<div className="courses-container">





{

list.length>0 ?



list.map(item=>(




<div

className="course-card"

key={item._id}

>





<div className="course-card-banner" style={{ background: getGradient(item._id || item.title), height: '120px', width: '100%' }}></div>







<div className="course-content">



<span className="course-category">

{level}

</span>





<h2>

{

item.name ||

item.title

}

</h2>





<p>

{

item.description ||

"Explore learning content"

}

</p>







<button

onClick={()=>openItem(item)}

>


{

level==="courses"

?

"View Details"

:

"Open"

}


</button>






</div>




</div>




))




:



<h2>

No Data Found

</h2>


}








</div>





</div>


);


};




export default Courses;