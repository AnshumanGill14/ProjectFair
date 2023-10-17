import React, { useEffect, useRef, useState } from 'react'
import { Camera, Edit2, GitHub, Linkedin, LogOut, Paperclip, Trash, } from 'react-feather'
import styles from "./Account.module.css"
import InputControl from '../InputControl/InputControl'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, deleteProject, getAllProjectsForUser, updateUserDatabase, uploadImage } from '../../Firebase';
import ProjectForm from './ProjectForm/ProjectForm';
import Spinner from '../Spinner/Spinner';

function Account(props) {
    const userDetails = props.userDetails;
    const isAuthenticated = props.auth
    const navigate = useNavigate();
    const imagePicker = useRef()
    const [progress,setProgress]=useState(0)
    const [profileImageUrl, setProfileImageUrl] = useState(
        userDetails.profileImage ||
          "https://www.agora-gallery.com/advice/wp-content/uploads/2015/10/image-placeholder-300x200.png"
      );
    const [profileImageUploadStarted, setProfileImageUploadStarted]=useState(false)
    const [userProfileValues, setUserProfileValues]=useState({
        name:userDetails.name || "",
        designation:userDetails.designation || "",
        github:userDetails.github || "",
        linkedin:userDetails.linkedin || ""
    })
    const [showSaveDetailsButton, setShowSaveDetailsButton]=useState(false)
    const [errorMessage, setErrorMessage]= useState("")
    const [saveButtonDisabled, setSaveButtonDisabled]=useState(false)
    const [showProjectForm, setShowProjectForm]=useState(false)
    const [projectsLoaded,setProjectsLoaded]=useState(false)
    const [projects,setProjects]=useState([])
    const [isEditProjectModal, setIsEditProjectModal]= useState(false)
    const [editProject, setEditProject]= useState({})


    const hanleLogout = async () => {
        await signOut(auth)

    }

    const handleInputChange = (event, property) => {
        setShowSaveDetailsButton(true);
    
        setUserProfileValues((prev) => ({
          ...prev,
          [property]: event.target.value,
        }));
      };

    const handleCameraClick = () => {
        imagePicker.current.click();
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setProfileImageUploadStarted(true)
        uploadImage(
            file,
            (progress) => {setProgress(progress) },
            (url) => {
                setProfileImageUrl(url);
                updateProfileImageToDatabase(url)
                setProfileImageUploadStarted(false)
                 setProgress(0)
                },
            (err) => {console.error("Error->", err)
                    setProfileImageUploadStarted(false)}
            )
        console.log(file)
    }

    const updateProfileImageToDatabase=async(url)=>{
        await updateUserDatabase({...userProfileValues, profileImage:url}, userDetails.uid)
    }

    const saveDetailsToDatabase=async()=>{
        if(!userProfileValues.name){
            setErrorMessage("Name required")
        }
        setSaveButtonDisabled(true)
        await updateUserDatabase({...userProfileValues}, userDetails.uid)
        setSaveButtonDisabled(false)
        setShowSaveDetailsButton(false)
    }

    const fetchAllProjects=async()=>{
        const result=await getAllProjectsForUser(userDetails.uid)
        if(!result){
            setProjectsLoaded(true)
            return
        }

        setProjectsLoaded(true)

        let tempProjects=[];
        result.forEach((doc)=>tempProjects.push({...doc.data(),pid:doc.id}))
        setProjects(tempProjects)
        console.log(result,tempProjects)
    }

    const handleEditClick=(project)=>{
        setIsEditProjectModal(true)
        setEditProject(project)
        setShowProjectForm(true)
    }

    const handleDeletion=async(pid)=>{
        await deleteProject(pid);
        fetchAllProjects();
    }

    useEffect(()=>{
        fetchAllProjects()
    },[])

    return isAuthenticated ? (
        <div className={styles.container}>

        {
            showProjectForm && (
            <ProjectForm onClose={()=>setShowProjectForm(false)} uid={userDetails.uid} onSubmission={fetchAllProjects} isEdit={isEditProjectModal} default={editProject}/>

            )
        }
            <div className={styles.header}>
                <p className={styles.heading}>
                    Welcome <span>{userProfileValues.name}</span>
                </p>
                <div className={styles.logout} onClick={hanleLogout}>
                    <LogOut /> Logout
                </div>
            </div>
            <input ref={imagePicker} type='file' style={{ display: "none" }}
                onChange={handleImageChange}
            />
            <div className={styles.section}>
                <div className={styles.title}>Your Profile</div>
                <div className={styles.profile}>
                    <div className={styles.left}>
                        <div className={styles.image}>
                            <img
                                src={profileImageUrl}
                                alt='Profile Photo'
                            />
                            <div className={styles.camera} onClick={handleCameraClick} >
                                <Camera />
                            </div>
                        </div>
                        {profileImageUploadStarted ? 
                        <p className={styles.progress}>
                        {
                            progress === 100?"Getting image url...":`${progress.toFixed(2)}% uploaded`}</p>:""}
                    </div>
                    <div className={styles.right}>
                        <div className={styles.row}>
                            <InputControl
                                label="Name"
                                value={userProfileValues.name}
                                placeholder="Enter you name"
                                onChange={(event) => handleInputChange(event, "name")}

                            />
                            <InputControl
                                label="Designation"
                                value={userProfileValues.designation}
                                placeholder="eg:Full Stack Developer"
                                onChange={(event) => handleInputChange(event, "designation")}

                            />
                        </div>
                        <div className={styles.row}>
                            <InputControl
                                label="Github"
                                value={userProfileValues.github}
                                placeholder="Enter your github link"
                                onChange={(event) => handleInputChange(event, "github")}

                            />
                            <InputControl
                                label="Linkedin"
                                value={userProfileValues.linkedin}
                                placeholder="Enter your Linkedin link"
                                onChange={(event) => handleInputChange(event, "linkedin")}

                            />
                        </div>
                        <div className={styles.footer}>
                            <p className={styles.error}>{errorMessage}</p>
                        </div>
                        {showSaveDetailsButton && (
                        <button className={styles.saveButton} onClick={saveDetailsToDatabase} disabled={saveButtonDisabled}>Save Details</button>
                        )}      
                    </div>
                </div>
            </div>
            <hr/>
            <div className={styles.section}>
                <div className={styles.projectsHeader}>
                    <div className={styles.title}>Your Projects</div>
                    <button className={styles.saveButton} onClick={()=> setShowProjectForm(true)}>Add Project</button>
                </div>

                <div className={styles.projects}>
                {projectsLoaded?(
                    projects.length>0?(
                        projects.map((item,index)=>(
                   <div className={styles.project} key={item.title+index}>
                      <p className={styles.title}>{item.title}</p>

                      <div className={styles.links}>
                        <Edit2 onClick={()=>handleEditClick(item)}/>
                        <Trash onClick={()=>handleDeletion(item.pid)}/>
                        <Link target='_blank' to={`//${item.github}`}>
                        <GitHub />

                        </Link>
                        {item.link?(
                            <Link target='_blank' to={`//${item.link}`}>
                        <Paperclip />

                            </Link>
                        ):("")
                            }
                      </div>

                   </div>
                        ))
                ):(
                    <p>No Projects Found</p>
                )
                ):(
                    <Spinner/>
                )

                }   
                   
                </div>   
            </div>
        </div>
    ) : (
        <Navigate to="/" />
    )
}

export default Account
