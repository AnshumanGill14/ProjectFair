import { deleteApp, initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage"
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, where} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCFOZ4HVuH6HB3bCRZxjxHw-hb6tsVjgH0",
  authDomain: "project-pro-b3d5e.firebaseapp.com",
  projectId: "project-pro-b3d5e",
  storageBucket: "project-pro-b3d5e.appspot.com",
  messagingSenderId: "754669526852",
  appId: "1:754669526852:web:db1457c8e83c6150d10111",
  measurementId: "G-FYZ3GN6ESJ"
};


const app = initializeApp(firebaseConfig);

const auth=getAuth(app);

const db= getFirestore(app);

const storage= getStorage(app);

const updateUserDatabase=async(user,uid)=>{
  if(typeof user!=="object")return;
  const docRef=doc(db,"users",uid);
  await setDoc(docRef,{...user,uid});
}

const getUserFromDatabase=async(uid)=>{
  const docRef=doc(db,"users",uid);
  const result= await getDoc(docRef);

  if (!result.exists())return null;
  return result.data();
}

const addProjectDatabase=async(project)=>{
  if(typeof project!=="object")return;
  const collectionRef=collection(db,"projects");
  await addDoc(collectionRef,{...project});
}

const updateProjectDatabase=async(project,pid)=>{
  if(typeof project!=="object")return;
  const docRef=doc(db,"projects",pid);
  await setDoc(docRef,{...project});
}




const uploadImage=(file,progressCallback,urlCallback, errorCallback)=>{
  if(!file){
    errorCallback("File not found")
    return;
  }

  const fileType= file.type;
  const fileSize= file.size / 1024 / 1024;

  if(!fileType.includes("image")){
    errorCallback("File must be an image")
    return;
  }

  if(fileSize>2){
    errorCallback('File must be smaller than 2MB')
    return;
  }

  const storageRef= ref(storage,`images/${file.name}`)
  const task=uploadBytesResumable(storageRef,file)

  task.on('state_changed',(snapshot)=>{
    
    const progress= (snapshot.bytesTransferred/snapshot.totalBytes)*100;
    progressCallback(progress);
  },
  (error)=>{
    errorCallback(error.message);
  },
  ()=>{
    getDownloadURL(storageRef).then((url)=>{
      urlCallback(url);
    })
  }
  )
}

const getAllProjects=async()=>{
  return await getDocs(collection(db,"projects"))
}

const getAllProjectsForUser=async(uid)=>{
  if(!uid) return;
  const collectionRef=collection(db,"projects")
  const condition=where('refUser','==',uid)
  const dbQuery= query(collectionRef,condition)
  return await getDocs(dbQuery)
}

const deleteProject=async(pid)=>{
  const docRef=doc(db,"projects",pid)
  await deleteDoc(docRef)
}

export {app as default, auth, db, updateUserDatabase, getUserFromDatabase,uploadImage, addProjectDatabase, updateProjectDatabase, getAllProjects,getAllProjectsForUser, deleteProject};