import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { BmiInfo, SubmitInfo } from "../Types";
import './home.css'


const calcBmi = (h: number, w: number): number => w / (h * h);

export const Home = () => {
    const navigate = useNavigate();
    const logOut = () => {
        signOut(auth);
    };
    const [user] = useAuthState(auth);
    if (!user) {
        navigate("/");
    }

    const [bmiInfo, setBmiInfo] = useState<BmiInfo>();
    const [pageState, setPageState] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const status = await checkUpload();
            if (status) {
                navigate("/trainer");
            }
            setPageState(true);
        })();
    }, [user]);

    const checkUpload = async (): Promise<boolean> => {
        const ref = collection(db, "bmiInfo");
        const q = query<SubmitInfo>(ref, where("id", "==", user?.uid));
        const snapshot = await getDocs(q);
        // optimizations :
        //  Directly use useNavigate('/trainer')
        // setPageState as boolean 0->Loading & 1->BmiForm
        return snapshot.docs.length > 0;
    };

    const uploadBmi = async (event: React.FormEvent) => {
        event.preventDefault();
        setBmiInfo({
            ...bmiInfo,
            bmi: calcBmi(bmiInfo?.height as number, bmiInfo?.weight as number),
        });
        if (user && bmiInfo) {
            const bmi = bmiInfo.bmi
                ? bmiInfo.bmi
                : calcBmi(bmiInfo.height as number, bmiInfo.weight as number);
            const info: SubmitInfo = {
                uname: user.displayName as string,
                id: user.uid,
                bmiInfo: {
                    height: bmiInfo?.height,
                    weight: bmiInfo?.weight,
                    bmi: bmi,
                },
            };
            await addDoc(collection(db, "bmiInfo"), info);
            navigate("/trainer");
        }
    };

    const bmiForm = () => {
        return (
           
            <center>
                 <div className="container2">
            <form onSubmit={(e) => uploadBmi(e)}>
                <input
                    type="number"
                    step="any"
                    placeholder="height in m"
                    onChange={(e) => {
                        setBmiInfo({
                            ...bmiInfo,
                            height: Number(e.target.value),
                        });
                    }}
                />
                <br />
                <br />
                <br>
                </br>
                <br>
                </br>
                <input
                    type="number"
                    step="any"
                    placeholder="weight in kg"
                    onChange={(e) => {
                        setBmiInfo({
                            ...bmiInfo,
                            weight: Number(e.target.value),
                        });
                    }}
                />
                <br />
                <br />
                <button type="submit">Submit</button>
                <br />
                <br />
            </form>
            </div>
            </center>
            
        );
    };
    const  Navbar=()=> {
        return (
          <nav className="navbar">
            <ul className="navbar-list">
              <li className="navbar-item"><a href="#">Home</a></li>
              <li className="navbar-item"><a href="#">About</a></li>
              <li className="navbar-item"><a href="#">Contact</a></li>
              <li className="navbar-item"><a href="#">Products</a></li>
              <li className="navbar-item"><a href="#">Videos</a></li>
            </ul>
          </nav>
        );
      }
      
     

    const getPage = () => {
        return pageState ? bmiForm() : <h1>Loading Please wait</h1>;
    };

    return (
        <>
        
        <center>
            
            <h1>Welcome Home {user?.displayName}</h1>
            
            <button className="rt" onClick={logOut}>Sign out</button>
            {Navbar()}
            <br></br>
            </center>
           
            <br></br>
            {getPage()}
            <br></br>
            <center><h3 className=''>Enter your height and weight to calculate body mass index(BMI) </h3></center>
            
        </>
    );
};
