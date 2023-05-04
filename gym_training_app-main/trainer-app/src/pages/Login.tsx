import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import './login.css'

const  Navbar=()=> {
    return (
        
        <div className="d">
         <li >HOME</li>
         <li>Contact</li>
         <li>Careers</li>
         <li>Blog</li>
        </div>
    );
  }

export const Login = () => {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const signIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };
    if (user) {
        navigate("/home");
    }
    return (
        <><header>a</header>
        <br />
         {Navbar()}
         <br />
        <div className="container">
            <div className="form-container">
                <div className="form">
                    <div className="wrap">
            <h2>LOGIN TO GYM TRAINER</h2>
            <button onClick={signIn}>Sign in With google</button>
            </div>
            </div>
            </div>
            </div>
        </>
    );
};
