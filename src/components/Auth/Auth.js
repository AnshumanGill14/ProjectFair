import React, { useState } from 'react';
import styles from "./Auth.module.css";
import { Link, useNavigate } from 'react-router-dom';
import InputControl from '../InputControl/InputControl';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, updateUserDatabase } from '../../Firebase';

function Auth(props) {
    const isSignup=props.signup?true:false
    const navigate=useNavigate();

    const [values, setValues]= useState({
        name:"",
        email:"",
        password:"",
    });
    const [errorMsg, setErrorMsg]= useState("");
    const [submitButtonDisabled, setsubmitButtonDisabled]=useState(false)

    const handleLogin=()=>{
        if(!values.email||!values.password){
        setErrorMsg("All fields required");
        return
    }
    setsubmitButtonDisabled(true)
    signInWithEmailAndPassword(auth, values.email, values.password).then(
        ()=>{
            setsubmitButtonDisabled(false)
            navigate("/");
        }
    ).catch((err)=>{
        setsubmitButtonDisabled(false)
        setErrorMsg(err.message)
    })}

    const handleSignup=()=>{
        if(!values.name||!values.email||!values.password){
            setErrorMsg("All fields required");
            return
        }
        setsubmitButtonDisabled(true)
        createUserWithEmailAndPassword(auth, values.email, values.password).then(
            async(response)=>{
                console.log(response)
                const userId= response.user.uid
                await updateUserDatabase({name:values.name,email:values.email}, userId)
                setsubmitButtonDisabled(false)
                navigate("/");
            }
        ).catch((err)=>{
            setsubmitButtonDisabled(false)
            setErrorMsg(err.message)
        })
    }

    const handleSubmission=(event)=>{
        event.preventDefault();
        if(isSignup) handleSignup();
        else handleLogin();
    }

  return (
    <div className={styles.container}>
    <form className={styles.form} onSubmit={handleSubmission}>
        
            <p className={styles.smallLink}>
            <Link to="/">{"< Back to Home"}</Link>
            </p>
        
        <p className={styles.heading}>{isSignup?"Signup":"Login"}</p>

        {isSignup && (
            <InputControl label="Name" placeholder="Enter your name"
                onChange={(event)=>
                setValues((prev)=>({...prev, name:event.target.value}))}
            />
        )}
        <InputControl label="Email" placeholder="Enter your email"
            onChange={(event)=>
            setValues((prev)=>({...prev, email:event.target.value}))}
        />
        <InputControl
            label="Password"
            placeholder="Enter your password"
            onChange={(event)=>
            setValues((prev)=>({...prev, password:event.target.value}))}
            isPassword
            />
            <p className={styles.error}>{errorMsg}</p>
            <button type='submit' disabled={submitButtonDisabled}>{isSignup?"Signup":"Login"}</button>

            <div className={styles.bottom}>
                {isSignup?(
                    <p>
                    Already have an account? <Link to="/login">Login Here</Link>
                    </p>
                ):(
                    <p>
                        New Here? <Link to="/signup">Creare an account</Link>
                    </p>
                )}
            </div>
    </form>
       
    </div>
  )
}

export default Auth;

